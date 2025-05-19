const express = require('express');
const router = express.Router();
const statesController = require('../controllers/statesController');

// Get all states, optionally filtering with ?contig=true or false
router.get('/', statesController.getAllStates);

// Get specific info fields (should be above /:state)
router.get('/:state/capital', statesController.getCapital);
router.get('/:state/nickname', statesController.getNickname);
router.get('/:state/population', statesController.getPopulation);
router.get('/:state/admission', statesController.getAdmissionDate);

// Fun Facts routes
router.get('/:state/funfact', statesController.getFunFact);
router.post('/:state/funfact', statesController.createFunFact);
router.patch('/:state/funfact', statesController.updateFunFact);
router.delete('/:state/funfact', statesController.deleteFunFact);

// Must come last
router.get('/:state', statesController.getState);
