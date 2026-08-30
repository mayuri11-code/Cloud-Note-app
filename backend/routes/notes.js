const express = require('express');
const Note = require('../models/Note');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes below require authentication
router.use(protect);

// @route   GET /api/notes
// @desc    Get all notes for logged-in user (supports ?search=&tag=)
router.get('/', async (req, res) => {
  try {
    const { search, tag } = req.query;
    const query = { user: req.user._id };

    if (search) {
      query.$text = { $search: search };
    }
    if (tag) {
      query.tags = tag;
    }

    const notes = await Note.find(query).sort({ pinned: -1, updatedAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/notes/:id
// @desc    Get single note
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/notes
// @desc    Create a new note
router.post('/', async (req, res) => {
  try {
    const { title, content, tags, color } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const note = await Note.create({
      user: req.user._id,
      title,
      content,
      tags,
      color,
    });

    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/notes/:id
// @desc    Update a note
router.put('/:id', async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const { title, content, tags, pinned, color } = req.body;
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (tags !== undefined) note.tags = tags;
    if (pinned !== undefined) note.pinned = pinned;
    if (color !== undefined) note.color = color;

    const updated = await note.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   DELETE /api/notes/:id
// @desc    Delete a note
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Note deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
