const Task = require("../models/task");
const asyncWrapper = require('../middleware/async');
const NotFoundError = require("../errors/not-found");

const getAllTasks = asyncWrapper(async (req, res) => {
    const tasks = await Task.find();
    res.status(200).json({ tasks });
});

const createTask = asyncWrapper(async (req, res) => {
    const task = await Task.create(req.body);
    res.status(201).json({
        success: true,
        task: task,
    });
});

const getTask = asyncWrapper(async (req, res) => {
    const { id: taskID } = req.params;

    const task = await Task.findById(taskID);

    if (!task) {
        throw new NotFoundError("task not found")
    }

    res.status(200).json({ task });
});


const deleteTask = asyncWrapper(async (req, res) => {
    const { id: taskID } = req.params;
    const task = await Task.findByIdAndDelete(taskID);

    if (!task) {
        throw new NotFoundError("task not found")
    }
    res.status(200).json({
        success: true,
        task: task,
        message: "Task deleted successfully",
    });

});

const updateTask = asyncWrapper(async (req, res) => {
    const { id: taskID } = req.params

    const task = await Task.findByIdAndUpdate(
        taskID,
        req.body,
        {
            new: true,
            runValidators: true
        }
    )

    if (!task) {
        throw new NotFoundError("task not found")
    }

    res.status(200).json({ task });
});
//Put req
const replaceTask = asyncWrapper(async (req, res) => {
    const { id: taskID } = req.params

    const task = await Task.findOneAndReplace(
        { _id: taskID },
        req.body,
        {
            new: true,
            runValidators: true
        }
    )

    if (!task) {
       throw new NotFoundError("task not found")
    }

    res.status(200).json({ task });
});

module.exports = { getAllTasks, createTask, updateTask, deleteTask, getTask, replaceTask };
