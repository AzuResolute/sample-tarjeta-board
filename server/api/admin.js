const router = require('express').Router()
const {commandAlpha, commandBeta} = require('../../script/initLoad')
const {admin} = require('../../secrets')

const adminkey = process.env.admin || admin

router.use((req, res, next) => {
  console.log(req.session.passport)
  if (req.session.passport.user !== adminkey) {
    const unauthorized = new Error('Unauthorized')
    unauthorized.status = 401
    next(unauthorized)
  } else {
    next()
  }
})

router.get('/test', (req, res, next) => {
  try {
    console.log('test')
    const test = {
      test: 'test'
    }
    res.status(200).send(test)
  } catch (error) {
    next(error)
  }
})

router.get('/alpha', async (req, res, next) => {
  try {
    const result = await commandAlpha()
    res.status(200).send(result)
  } catch (error) {
    next(error)
  }
})

router.get('/beta', async (req, res, next) => {
  try {
    const result = await commandBeta()
    res.status(200).send(result)
  } catch (error) {
    next(error)
  }
})

module.exports = router
