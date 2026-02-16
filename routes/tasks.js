const express = require("express");
const router = express.Router();
const validateTask = require('../middleware/validateTask')
const {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  getTask,
  replaceTask,
} = require("../controllers/tasks");

router.route("/").get(getAllTasks).post(validateTask, createTask);

router.route("/:id").get(getTask).patch(validateTask, updateTask).delete(deleteTask).put(validateTask, replaceTask);



module.exports = router;
