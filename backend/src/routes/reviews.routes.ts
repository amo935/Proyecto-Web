import { Router } from 'express'
import { list, create, update, remove } from '../controllers/reviews.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/', list)
router.post('/', requireAuth, create)
router.put('/:id', requireAuth, update)
router.delete('/:id', requireAuth, remove)

export default router
