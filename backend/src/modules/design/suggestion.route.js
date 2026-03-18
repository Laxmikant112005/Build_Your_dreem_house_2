/**
 * BuildMyHome - Design Suggestion Routes
 */

const express = require('express');
const suggestionController = require('./suggestion.controller');

const router = express.Router();

router.post('/suggest', suggestionController.suggestDesigns);

module.exports = router;

