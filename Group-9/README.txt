CEBU EASTERN COLLEGE - HTML/CSS VERSION

Files:
- portal.js          Shared browser storage for schedules and profile details
- profile.html       Student My Profile page
- class-schedule.html Student Class Schedule page
- admin.html         Administrator Class Schedule Management page
- style.css          Shared styling
- assets/cec-logo.png Logo extracted from the provided PDF

Open the pages directly in a browser:
- http://localhost:8080/ (redirects to the profile page)
- http://localhost:8080/admin.html
- http://localhost:8080/class-schedule.html
- http://localhost:8080/profile.html

The root URL redirects to the profile page instead of showing a directory listing. The admin schedule editor supports add, edit, and delete. Schedule and profile changes are saved in this browser and shared between the pages. Password changes need a connected authentication service and are not saved by this static demo.
