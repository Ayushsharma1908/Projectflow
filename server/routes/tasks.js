const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

const router = express.Router();

// Get tasks for a project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    const isMember = project.owner.equals(req.userId) ||
      project.members.some(m => m.equals(req.userId));
    if (!isMember) return res.status(403).json({ message: 'Access denied.' });

    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email')
      .sort({ order: 1, createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all tasks assigned to me
router.get('/my-tasks', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ assignee: req.userId })
      .populate('project', 'name color')
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email')
      .sort({ deadline: 1, createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, project, assignee, status, priority, deadline, tags } = req.body;
    if (!title || !project) return res.status(400).json({ message: 'Title and project are required.' });

    const projectDoc = await Project.findById(project);
    if (!projectDoc) return res.status(404).json({ message: 'Project not found.' });

    const isMember = projectDoc.owner.equals(req.userId) ||
      projectDoc.members.some(m => m.equals(req.userId));
    if (!isMember) return res.status(403).json({ message: 'Access denied.' });

    const task = new Task({
      title, description, project, assignee: assignee || null,
      status, priority, deadline, tags,
      createdBy: req.userId
    });

    await task.save();
    await task.populate('assignee', 'name email');
    await task.populate('createdBy', 'name email');
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    const allowed = ['title', 'description', 'assignee', 'status', 'priority', 'deadline', 'tags', 'order'];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) task[field] = req.body[field];
    });

    await task.save();
    await task.populate('assignee', 'name email');
    await task.populate('createdBy', 'name email');
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    await task.deleteOne();
    res.json({ message: 'Task deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
