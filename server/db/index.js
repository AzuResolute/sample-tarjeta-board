const db = require('./db')

// register models
require('./models')

// To Do List:

// ReportingPeriod
// - id {year, weekNumber, serviceType}
// - year
// - weekNumber
// - serviceType
// - localId - varchar(50)

// Member
// - id
// - localId - varchar(50)
// - areaGroup - varchar(7)
// - lastName - varchar (40)
// - firstName - varchar (50)
// - cfo - varchar(10)
// - officer - varchar(20)
// - gender - Enum (M, F)
// - isActive

// Attendance
// - worshipserviceId
// - memberId
// - code
// - notes
// - hasAttended

// Worship Service
// - reportingPeriodId
// - dateTime
// - notes

// Local
// - id {first letter; two consonance}
// - name
// - extensionOf (reference localId Entity; nulll if localId)
// - district?

// Schedule
// - id
// - localId
// - serviceType
// - day
// - time

// Functionalities:

// - Add / Remove (de-activate) Members Manually
// - Update Current List via Excel
// - Swipe from area to area
// - UX / UI Feedback - Screen; Members

module.exports = db
