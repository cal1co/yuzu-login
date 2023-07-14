import express from 'express';
import userController from '../controllers/userController'
import userPageController from '../controllers/userPageController'
import followController from '../controllers/followController'
import searchController from '../controllers/searchController'
import { rateLimiter } from '../middleware/rateLimiter';
import { authMiddleware } from '../middleware/authMiddleware';
import s3Controller from '../controllers/s3Controllers'
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router()

router.post('/register', rateLimiter, userController.register)
router.post('/login', rateLimiter, userController.login)

router.get('/getuser/:username', rateLimiter, userController.getUser)
router.get('/user/:id', rateLimiter, authMiddleware, userPageController.getUser)

router.post('/user/update/bio', rateLimiter, authMiddleware, userController.updateBio)
router.post('/user/update/displayname', rateLimiter, authMiddleware, userController.updateDisplayName)
router.post('/user/update/username', rateLimiter, authMiddleware, userController.updateUsername)
router.post('/user/update/password', rateLimiter, authMiddleware, userController.updatePassword)
router.post('/user/update/pfp', rateLimiter, authMiddleware, userController.updateProfileImage)

router.post('/follow/:followingId', rateLimiter, authMiddleware, followController.follow)
router.post('/unfollow/:followingId', rateLimiter, authMiddleware, followController.unfollow)

router.get('/search/user/:usernameQuery', rateLimiter, authMiddleware, searchController.searchUser)
router.get('/search/post/:postContentQuery', rateLimiter, authMiddleware, searchController.searchPost)

router.get('/s3image/:image', rateLimiter, s3Controller.getImage)
router.post('/s3image/fetch/images', rateLimiter, s3Controller.getImagesById)
router.post('/s3image', rateLimiter, upload.single('content'), s3Controller.uploadImage)
router.post('/s3image/feed', rateLimiter, s3Controller.handleMultiple)
router.post('/user/s3image/upload', rateLimiter, upload.single('content'), s3Controller.updateProfileImage)


export default router