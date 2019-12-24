import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'
import { NextFunction } from 'connect'
import { Invite } from '../database/entities/Invite'
import { Image } from '../database/entities/Image'
import { User } from '../database/entities/User'
import { ShortenedUrl } from '../database/entities/ShortenedUrl'
import { bucket } from '../utils/StorageUtil'
import sgMail from '@sendgrid/mail'

const AnalyticsRouter = express.Router()
AnalyticsRouter.use(
  bodyParser.urlencoded({
    extended: true
  })
)
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).send('Unauthorized')
  }
  if (!req.user.admin) {
    return res.status(401).send('Not an admin')
  }
  return next()
}
AnalyticsRouter.use(authMiddleware)

AnalyticsRouter.route('/').get(async (req, res) => {
  let users = await User.find()
  let images = await Image.find({
    relations: ['uploader']
  })
  let usersSerialized = users.map(user => user.serialize())
  let imagesSerialized = images.map(image => image.serialize())
  let usersJSON = JSON.stringify(usersSerialized).replace(/'/, "\\'")
  let imagesJSON = JSON.stringify(imagesSerialized).replace(/'/, "\\'")
  res.render('pages/analytics/index', {
    layout: 'layouts/analytics',
    users,
    images,
    usersSerialized,
    imagesSerialized,
    usersJSON,
    imagesJSON
  })
})

export default AnalyticsRouter