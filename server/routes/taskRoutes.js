import express from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController.js';

const router = express.Router();

router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

export default router;
