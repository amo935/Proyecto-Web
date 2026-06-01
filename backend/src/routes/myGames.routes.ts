import { Router } from 'express'
import { list, create, update, remove } from '../controllers/myGames.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'

const router = Router()

router.use(requireAuth)

router.get('/', list)
router.post('/', create)
router.patch('/:id', update)
router.delete('/:id', remove)

export default router
