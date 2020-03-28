const router = require('express').Router()
const {Attendance} = require('../db/models')
const moment = require('moment')

router.get('/:id', async (req, res, next) => {
  try {
    const {id} = req.params
    const attendance = await Attendance.findByPk(id)
    res.status(200).send(attendance)
  } catch (error) {
    next(error)
  }
})

router.put('/', async (req, res, next) => {
  try {
    const {id, hasAttended, code, notes} = req.body
    const attendance = await Attendance.findByPk(id)
    attendance.hasAttended = hasAttended
    attendance.code = code
    attendance.notes = notes
    await attendance.save()
    res.status(200).send(attendance)
  } catch (error) {
    next(error)
  }
})

router.put('/details', async (req, res, next) => {
  try {
    const {id} = req.body
    const attendance = await Attendance.findByPk(id)
    const updatedAttendance = attendance.update(req.body)
    res.status(200).send(updatedAttendance)
  } catch (error) {
    next(error)
  }
})

router.get('/ws/:worshipserviceId', async (req, res, next) => {
  try {
    const {worshipserviceId} = req.params
    const attendanceInWS = await Attendance.findAll({
      where: {
        worshipserviceId
      }
    })
    res.status(200).send(attendanceInWS)
  } catch (error) {
    next(error)
  }
})

router.post('/save/:user', async (req, res, next) => {
  try {
    const attendees = req.body
    const {user} = req.params
    await attendees.forEach(async a => {
      const {hasAttended, worshipserviceId, memberId, dateTimeNow} = a
      console.log(dateTimeNow)
      const memberKeys = Object.keys(a).filter(
        k => k !== 'hasAttended' && k !== 'dateTimeNow'
      )
      const attendance = await Attendance.findOrBuild({
        where: {
          worshipserviceId,
          memberId
        }
      })

      memberKeys.forEach(k => {
        attendance[0][k] = attendance[0][k] ? attendance[0][k] : a[k]
      })

      if (hasAttended && !attendance[0].hasAttended) {
        attendance[0].hasAttended = hasAttended
        console.log(dateTimeNow)
        attendance[0].notes = `${user} on ${dateTimeNow}`
      }
      await attendance[0].save()
    })
    res.status(200).send()
  } catch (error) {
    next(error)
  }
})

module.exports = router
