/* ==========================================================
   GRADES DATA  (edit this file every semester / school year)
   ----------------------------------------------------------
   - The key (e.g. "2026-1") must match an <option value="">
     in the TERM dropdown in index.html.
   - Use null for a grade that is not posted yet (shows "—").
   - "final" is optional. If you leave it out, it is computed
     as the average of the 4 periods (only when all 4 exist).
   ========================================================== */

const GRADES_DATA = {

    "2026-1": {                       // First Semester A.Y. 2026-2027
        section: "4",
        yearLevel: "3rd",
        subjects: [
            { edp: "2611835", name: "GE ELEC 5",   prelim: 5.00, midterm: 5.00, semifinal: 5.00, final_period: 5.00 },
            { edp: "2611836", name: "GE ELEC 6",   prelim: 5.00, midterm: 5.00, semifinal: 5.00, final_period: 5.00 },
            { edp: "2611843", name: "FREE ELEC 1", prelim: 5.00, midterm: 5.00, semifinal: 5.00, final_period: 5.00 },
            { edp: "2612187", name: "IT ELEC 1",   prelim: 5.00, midterm: 5.00, semifinal: 5.00, final_period: 5.00 },
            { edp: "2612183", name: "IT EVD 31",   prelim: 5.00, midterm: 5.00, semifinal: 5.00, final_period: 5.00 },
            { edp: "2611837", name: "IT IAS 31",   prelim: 5.00, midterm: 5.00, semifinal: 5.00, final_period: 5.00 },
            { edp: "2612185", name: "IT NET 31",   prelim: 5.00, midterm: 5.00, semifinal: 5.00, final_period: 5.00 },
            { edp: "2611841", name: "IT SPI 31",   prelim: 5.00, midterm: 5.00, semifinal: 5.00, final_period: 5.00 },
            { edp: "2612186", name: "IT SIA 31",   prelim: 5.00, midterm: 5.00, semifinal: 5.00, final_period: 5.00 }
        ]
    },

    "2025-2": {                       // Second Semester A.Y. 2025-2026
        section: "4",
        yearLevel: "2nd",
        subjects: [
            // SAMPLE DATA - replace with your real subjects and grades
            { edp: "2500101", name: "IT DSA 21", prelim: 1.75, midterm: 1.50, semifinal: 1.75, final_period: 1.50 },
            { edp: "2500102", name: "IT DBM 21", prelim: 2.00, midterm: 1.75, semifinal: 1.75, final_period: 1.75 },
            { edp: "2500103", name: "IT WEB 21", prelim: 1.50, midterm: 1.50, semifinal: 1.25, final_period: 1.50 }
        ]
    },

    "2025-1": {                       // First Semester A.Y. 2025-2026
        section: "4",
        yearLevel: "2nd",
        subjects: [
            // SAMPLE DATA - replace with your real subjects and grades
            { edp: "2400201", name: "IT PRG 21", prelim: 2.00, midterm: 2.00, semifinal: 1.75, final_period: 1.75 },
            { edp: "2400202", name: "IT OOP 21", prelim: 1.75, midterm: 1.75, semifinal: 1.75, final_period: 2.00 },
            { edp: "2500103", name: "IT ELEC 21", prelim: 1.50, midterm: 1.80, semifinal: 1.25, final_period: 1.50 }
        ]
    },

    "2024-2": {                       // Second Semester A.Y. 2024-2025
        section: "4",
        yearLevel: "1st",
        subjects: [
            // SAMPLE DATA - replace with your real subjects and grades
            { edp: "2300301", name: "IT CMP 11", prelim: 2.25, midterm: 2.00, semifinal: 2.00, final_period: 2.00 },
            { edp: "2300302", name: "GE MATH 1",  prelim: 2.50, midterm: 2.25, semifinal: 2.25, final_period: 2.25 },
            { edp: "2500103", name: "FREE ELEC 21", prelim: 1.00, midterm: 1.50, semifinal: 1.25, final_period: 1.50 },
            { edp: "2500103", name: "GE 6", prelim: 1.70, midterm: 1.30, semifinal: 1.25, final_period: 1.50 }
        ]
    }
};
