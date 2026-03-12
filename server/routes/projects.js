const express = require('express');
const Project = require('../models/Project');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all projects for user
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.userId }, { members: req.userId }]
    }).populate('owner', 'name email').populate('members', 'name email').sort({ createdAt: -1 });

    // Calculate progress for each project
    const projectsWithProgress = await Promise.all(projects.map(async (project) => {
      const tasks = await Task.find({ project: project._id });
      const total = tasks.length;
      const done = tasks.filter(t => t.status === 'done').length;
      const progress = total > 0 ? Math.round((done / total) * 100) : 0;
      const obj = project.toObject();
      obj.progress = progress;
      obj.taskCount = total;
      obj.completedCount = done;
      return obj;
    }));

    res.json(projectsWithProgress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single project
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!project) return res.status(404).json({ message: 'Project not found.' });

    const isMember = project.owner._id.equals(req.userId) ||
      project.members.some(m => m._id.equals(req.userId));
    if (!isMember) return res.status(403).json({ message: 'Access denied.' });

    const tasks = await Task.find({ project: project._id });
    const total = tasks.length;
    const done = tasks.filter(t => t.status === 'done').length;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;

    const obj = project.toObject();
    obj.progress = progress;
    obj.taskCount = total;
    obj.completedCount = done;

    res.json(obj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create project
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, color, status, priority, deadline, tags } = req.body;
    if (!name) return res.status(400).json({ message: 'Project name is required.' });

    const project = new Project({
      name, description, color, status, priority, deadline, tags,
      owner: req.userId,
      members: [req.userId]
    });

    await project.save();
    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update project
router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    if (!project.owner.equals(req.userId)) return res.status(403).json({ message: 'Only project owner can update.' });

    const allowed = ['name', 'description', 'color', 'status', 'priority', 'deadline', 'tags', 'members'];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) project[field] = req.body[field];
    });

    await project.save();
    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    if (!project.owner.equals(req.userId)) return res.status(403).json({ message: 'Only project owner can delete.' });

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();
    res.json({ message: 'Project deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
