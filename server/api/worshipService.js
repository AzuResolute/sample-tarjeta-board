const router = require('express').Router()
const {
  Attendance,
  ReportingPeriod,
  WorshipService,
  Local
} = require('../db/models')

router.get('/', async (req, res, next) => {
  const worshipServices = await WorshipService.findAll()
  res.send(worshipServices)
})

router.get('/:id', async (req, res, next) => {
  try {
    const {id} = req.params
    const reporting = await WorshipService.findOne({
      where: {
        id
      },
      include: [
        {
          model: Attendance
        }
      ]
    })
    res.send(reporting)
  } catch (error) {
    next(error)
  }
})

router.get('/:id/destroy', async (req, res, next) => {
  try {
    const {id} = req.params
    const reporting = await WorshipService.findByPk(id)
    await reporting.destroy()
    res.status(200).send()
  } catch (error) {
    next(error)
  }
})

router.get(
  '/:localId/:weekNumber/:serviceType/:dateTime/',
  async (req, res, next) => {
    try {
      const {localId, weekNumber, serviceType, dateTime} = req.params

      let worshipService = await WorshipService.findOne({
        where: {dateTime: `${dateTime}Z`},
        include: [{model: Attendance}]
      })

      if (worshipService) {
        const reportingPeriodOfWS = await ReportingPeriod.findOne({
          where: {localId, weekNumber, serviceType}
        })
        worshipService = !reportingPeriodOfWS ? null : worshipService
      }

      res.send(worshipService)
    } catch (error) {
      next(error)
    }
  }
)

router.get('/reporting/:reportingId', async (req, res, next) => {
  try {
    const {reportingId} = req.params
    const attendanceInRep = await WorshipService.findAll({
      where: {
        reportingId
      }
    })
    res.status(200).send(attendanceInRep)
  } catch (error) {
    next(error)
  }
})

router.get('/reporting/:reportingId/ext', async (req, res, next) => {
  try {
    const {reportingId} = req.params

    const parentReportingPeriod = await ReportingPeriod.findOne({
      where: {
        id: reportingId
      },
      include: [
        {
          model: WorshipService,
          include: [Attendance]
        }
      ]
    })
    const localOfRep = await Local.findOne({
      where: {
        id: parentReportingPeriod.localId
      },
      include: [
        {
          model: Local,
          as: 'Extensions'
        }
      ]
    })

    const childrenReportingPeriods = await Promise.all(
      localOfRep.Extensions.map(e =>
        ReportingPeriod.findOne({
          where: {
            localId: e.id,
            year: parentReportingPeriod.year,
            weekNumber: parentReportingPeriod.weekNumber,
            serviceType: parentReportingPeriod.serviceType
          },
          include: [
            {
              model: WorshipService,
              include: [Attendance]
            }
          ]
        })
      )
    )

    let services = parentReportingPeriod.worshipservices

    if (childrenReportingPeriods[0]) {
      services = services.concat(
        childrenReportingPeriods.reduce((accum, crp) => {
          accum = accum.concat(crp.worshipservices)
          return accum
        }, [])
      )
    }

    res.status(200).send(services)
  } catch (error) {
    next(error)
  }
})

router.get('/local/:localId/ext/week/:weekNumber', async (req, res, next) => {
  try {
    const {localId, weekNumber} = req.params

    const parentLocal = await Local.findOne({
      where: {
        id: localId
      },
      include: [
        {
          model: Local,
          as: 'Extensions',
          include: [
            {
              model: ReportingPeriod,
              where: {
                weekNumber: Number(weekNumber)
              },
              include: [
                {
                  model: WorshipService
                }
              ]
            }
          ]
        },
        {
          model: ReportingPeriod,
          where: {
            weekNumber: Number(weekNumber)
          },
          include: [
            {
              model: WorshipService
            }
          ]
        }
      ]
    })

    let consolidatedReporting = parentLocal.reportings
    parentLocal.Extensions.forEach(e => {
      consolidatedReporting = consolidatedReporting.concat(e.reportings)
    })

    const services = consolidatedReporting.reduce((accum, r) => {
      accum = accum.concat(r.worshipservices)
      return accum
    }, [])

    res.status(200).send(services)
  } catch (error) {
    next(error)
  }
})

module.exports = router
