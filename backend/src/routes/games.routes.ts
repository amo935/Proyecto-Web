import { Router } from 'express'
import { list, getOne, create, update, remove } from '../controllers/games.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { uploadSingle } from '../middleware/upload.middleware.js'

const router = Router()

router.get('/', list)
router.get('/:id', getOne)
router.post('/', requireAuth, uploadSingle, create)
router.put('/:id', requireAuth, uploadSingle, update)
router.delete('/:id', requireAuth, remove)

export default router
