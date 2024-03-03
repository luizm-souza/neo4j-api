import express from 'express';
import { BookController } from '../controllers/booksController.js';

const router = express.Router()

router.post("/books/", BookController.create)
router.delete("/books/:id", BookController.delete)
router.get('/books/', BookController.list)
router.put('/books/:id', BookController.update)

export default router