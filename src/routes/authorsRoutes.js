import express from 'express';
import { AuthorController } from '../controllers/authorsController.js';

const router = express.Router()

router.post("/authors/", AuthorController.create)
router.delete("/authors/:id", AuthorController.delete)
router.delete("/authors/:id", AuthorController.deleteAuthorAndBooks)
router.get('/authors/', AuthorController.findAll)
router.get('/authors/:id', AuthorController.findBooksByAuthorId)
router.put('/authors/:id', AuthorController.update)

export default router