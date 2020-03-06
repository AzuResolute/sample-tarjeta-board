const router = require('express').Router()
const {Attendance, ReportingPeriod} = require('../db/models')

const GetTimeZoneAccounted = date => {
  return new Date(
    new Date(date).getTime() - new Date(Date.now()).getTimezoneOffset() * 60000
  )
}

router.get('/attendance/:reportingId', async (req, res, next) => {
  const {reportingId} = req.params
  const attendanceInRep = await Attendance.findAll({
    where: {
      reportingId
    }
  })
  res.status(200).send(attendanceInRep)
})

router.post('/attendance', async (req, res, next) => {
  const attendees = req.body
  await attendees.forEach(async a => {
    const {reportingId, memberId, dateTime, hasAttended} = a
    const attendance = await Attendance.findOrBuild({
      where: {reportingId, memberId, dateTime: GetTimeZoneAccounted(dateTime)}
    })
    attendance[0].hasAttended = hasAttended
    await attendance[0].save()
  })
  res.status(200).send()
})

router.get('/local/:localId', async (req, res, next) => {
  const {localId} = req.params
  const reportingPeriods = await ReportingPeriod.findAll({
    where: {
      localId
    }
  })
  res.status(200).send(reportingPeriods)
})

router.post('/create', async (req, res, next) => {
  try {
    let reportingPeriod = req.body
    const {localId, weekNumber, serviceType, currentDate} = reportingPeriod
    const result = await ReportingPeriod.findOrCreate({
      where: {
        localId: localId,
        year: new Date(currentDate).getFullYear(),
        weekNumber: weekNumber,
        serviceType: serviceType
      }
    })
    reportingPeriod.id = result[0].dataValues.id

    req.session.ws.local = localId
    req.session.ws.currentDate = currentDate
    req.session.ws.reportingPeriod = {
      serviceType: 'Special',
      weekNumber: 1,
      id: 1
    }
    req.session.ws.reportingPeriod.id = reportingPeriod.id
    req.session.ws.reportingPeriod.serviceType = serviceType
    req.session.ws.reportingPeriod.weekNumber = weekNumber
    res.status(200).json(reportingPeriod)
  } catch (error) {
    next(error)
  }
})

module.exports = router
