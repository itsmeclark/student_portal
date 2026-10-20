import {
    getAdminName,
    getStudentTotals,
    getStudentsByCourse,
    getPublishedAnnouncements,
    getInstitutionCounts
} from '../../models/admin/dashboard.model.js'

// The six department cards shown on the dashboard. A student counts toward a
// department when their Course contains the department code, so BSIT lands on
// the IT card, BSED on BSED, BEED on BEED, and so on.
const DEPARTMENTS = [
    { code: 'HM', label: 'HM', matches: ['HM'] },
    { code: 'TM', label: 'TM', matches: ['TM'] },
    { code: 'CRIM', label: 'CRIM', matches: ['CRIM'] },
    { code: 'IT', label: 'IT', matches: ['IT'] },
    { code: 'BSED', label: 'BSED', matches: ['BSED'] },
    { code: 'BEED', label: 'BEED', matches: ['BEED'] }
]

// Runs a callback style model function and resolves with its rows
const run = (fn, ...args) => new Promise((resolve, reject) => {
    fn(...args, (err, rows) => {
        if (err) return reject(err)
        resolve(rows)
    })
})

const toNumber = (value) => {
    const number = Number(value)
    return Number.isFinite(number) ? number : 0
}

// Admin identity of the logged in admin (password is never sent to the browser)
export const findAdmin = (req, res) => {
    // The JWT payload holds { id, name, role } (see controllers/admin/auth.controller.js)
    const admin_name = req.user && req.user.name

    if (!admin_name) {
        return res.status(401).json({ error: 'Invalid token.' })
    }

    getAdminName(admin_name, (err, results) => {
        if (err) {
            console.error('Error fetching user info:', err)
            return res.status(500).json({ error: 'Internal Server Error' })
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' })
        }

        const userInfo = results[0]
        const { Admin_password: _, ...userWithoutPassword } = userInfo
        res.status(200).json({ user: userWithoutPassword })
    })
}

// Everything the admin dashboard renders, straight from the database
export const getDashboardStats = async (req, res) => {
    try {
        const [adminRows, totalRows, courseRows, announcementRows, institutionRows] = await Promise.all([
            run(getAdminName, req.user && req.user.name),
            run(getStudentTotals),
            run(getStudentsByCourse),
            run(getPublishedAnnouncements),
            run(getInstitutionCounts)
        ])

        const totals = totalRows[0] || {}
        const institutions = institutionRows[0] || {}
        const admin = adminRows[0] || null

        // Start every department at zero, then move each course into the first
        // department it matches. Courses that match none end up in "Other".
        const departments = DEPARTMENTS.map((department) => ({
            code: department.code,
            label: department.label,
            matches: department.matches,
            students: 0,
            male: 0,
            female: 0,
            active: 0
        }))
        const other = { code: 'OTHER', label: 'Other', matches: [], students: 0, male: 0, female: 0, active: 0 }

        courseRows.forEach((row) => {
            const course = String(row.Course || 'Unassigned').toUpperCase()
            const target = departments.find((department) =>
                department.matches.some((code) => course.includes(code))
            ) || other

            target.students += toNumber(row.totalStudents)
            target.male += toNumber(row.maleStudents)
            target.female += toNumber(row.femaleStudents)
            target.active += toNumber(row.activeStudents)
        })

        const departmentList = departments.map((department) => ({
            code: department.code,
            label: department.label,
            students: department.students,
            male: department.male,
            female: department.female,
            active: department.active
        }))

        // Only show the "Other" row when there really are unmapped students
        if (other.students > 0) {
            departmentList.push({
                code: other.code,
                label: other.label,
                students: other.students,
                male: other.male,
                female: other.female,
                active: other.active
            })
        }

        const events = announcementRows.map((row) => ({
            title: row.title,
            summary: row.summary,
            category: row.category,
            publishBy: row.publishBy,
            date: row.date
        }))

        res.status(200).json({
            admin: admin
                ? { id: admin.Admin_id, name: admin.Admin_name, role: admin.Role }
                : null,
            totals: {
                totalStudents: toNumber(totals.totalStudents),
                activeStudents: toNumber(totals.activeStudents),
                inactiveStudents: toNumber(totals.inactiveStudents),
                dropoutStudents: toNumber(totals.dropoutStudents),
                maleStudents: toNumber(totals.maleStudents),
                femaleStudents: toNumber(totals.femaleStudents),
                sectionCount: toNumber(institutions.sectionCount),
                subjectCount: toNumber(institutions.subjectCount),
                enrolledThisTerm: toNumber(institutions.enrolledThisTerm)
            },
            departments: departmentList,
            events
        })
    } catch (err) {
        console.error('Error fetching dashboard stats:', err)
        res.status(500).json({ error: 'Internal Server Error' })
    }
}
