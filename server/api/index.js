const router = require('express').Router()
module.exports = router

router.use((req, res, next) => {
  if (!req.session.passport) {
    const unauthorized = new Error('Unauthorized')
    unauthorized.status = 401
    next(unauthorized)
  } else {
    next()
  }
})

router.use('/attendance', require('./attendance'))
router.use('/users', require('./users'))
router.use('/ws', require('./worshipService'))
router.use('/cache', require('./cache'))
router.use('/member', require('./member'))
router.use('/congregation', require('./local'))
router.use('/reporting', require('./reporting'))

router.use('/admin', require('./admin'))

router.use((req, res, next) => {
  const error = new Error('Not Found')
  error.status = 404
  next(error)
})
