const State = require('../models/states');
const statesData = require('../models/statesData.json');

// Normalize state codes to uppercase consistently
const getStateData = (code) => {
  return statesData.find(state => state.code.toUpperCase() === code.toUpperCase());
};

// GET /states?contig=true|false
const getAllStates = async (req, res) => {
  try {
    const { contig } = req.query;
    let filteredStates = [...statesData];

    if (contig === 'true') {
      filteredStates = filteredStates.filter(state => state.code !== 'AK' && state.code !== 'HI');
    } else if (contig === 'false') {
      filteredStates = filteredStates.filter(state => state.code === 'AK' || state.code === 'HI');
    }

    // Load all fun facts from DB and map by uppercase stateCode
    const dbStates = await State.find().lean();
    const funfactsMap = new Map(dbStates.map(dbState => [dbState.stateCode.toUpperCase(), dbState.funfacts]));

    // Merge funfacts carefully and ensure no mutation of original state object
    const mergedStates = filteredStates.map(state => {
      const funfacts = funfactsMap.get(state.code.toUpperCase());
      if (funfacts && funfacts.length > 0) {
        return { ...state, funfacts };
      }
      return { ...state };
    });

    res.json(mergedStates);
  } catch (error) {
    console.error('Error fetching states:', error);
    res.status(500).json({ message: 'Server error fetching states' });
  }
};

// GET /states/:state
const getState = async (req, res) => {
  const code = req.params.state.toUpperCase();
  const state = getStateData(code);
  if (!state) return res.status(404).json({ message: 'Invalid state abbreviation parameter' });

  try {
    const dbEntry = await State.findOne({ stateCode: code });
    // Clone original state object so we don't mutate original data
    const stateWithFunfacts = { ...state };

    if (dbEntry && dbEntry.funfacts && dbEntry.funfacts.length > 0) {
      stateWithFunfacts.funfacts = dbEntry.funfacts;
    }

    res.json(stateWithFunfacts);
  } catch (error) {
    console.error('Error fetching state:', error);
    res.status(500).json({ message: 'Server error fetching state' });
  }
};

// The rest of your GET endpoints for capital, nickname, population, admission date
// Just ensure you don't mutate the state object and always handle missing state

const getCapital = (req, res) => {
  const code = req.params.state.toUpperCase();
  const state = getStateData(code);
  if (!state) return res.status(404).json({ message: 'Invalid state abbreviation parameter' });
  res.json({ state: state.state, capital: state.capital });
};

const getNickname = (req, res) => {
  const code = req.params.state.toUpperCase();
  const state = getStateData(code);
  if (!state) return res.status(404).json({ message: 'Invalid state abbreviation parameter' });
  res.json({ state: state.state, nickname: state.nickname });
};

const getPopulation = (req, res) => {
  const code = req.params.state.toUpperCase();
  const state = getStateData(code);
  if (!state) return res.status(404).json({ message: 'Invalid state abbreviation parameter' });
  res.json({ state: state.state, population: state.population.toLocaleString() });
};

const getAdmissionDate = (req, res) => {
  const code = req.params.state.toUpperCase();
  const state = getStateData(code);
  if (!state) return res.status(404).json({ message: 'Invalid state abbreviation parameter' });
  res.json({ state: state.state, admitted: state.admission_date });
};

// Fun fact endpoints - create, update, delete same logic with uppercase normalization

const getFunFact = async (req, res) => {
  const code = req.params.state.toUpperCase();
  try {
    const dbEntry = await State.findOne({ stateCode: code });
    const state = getStateData(code);
    if (!dbEntry || !dbEntry.funfacts || dbEntry.funfacts.length === 0) {
      return res.status(404).json({ message: `No Fun Facts found for ${state?.state || code}` });
    }
    const randomIndex = Math.floor(Math.random() * dbEntry.funfacts.length);
    res.json({ funfact: dbEntry.funfacts[randomIndex] });
  } catch (error) {
    console.error('Error fetching fun fact:', error);
    res.status(500).json({ message: 'Server error fetching fun fact' });
  }
};

const createFunFact = async (req, res) => {
  const code = req.params.state.toUpperCase();
  const { funfacts } = req.body;

  if (!funfacts || !Array.isArray(funfacts)) {
    return res.status(400).json({ message: 'State fun facts value must be an array of strings' });
  }

  try {
    let state = await State.findOne({ stateCode: code });
    if (state) {
      state.funfacts.push(...funfacts);
    } else {
      state = new State({ stateCode: code, funfacts });
    }
    await state.save();
    res.json(state);
  } catch (error) {
    console.error('Error creating fun facts:', error);
    res.status(500).json({ message: 'Server error creating fun facts' });
  }
};

const updateFunFact = async (req, res) => {
  const code = req.params.state.toUpperCase();
  const { index, funfact } = req.body;

  if (index === undefined) {
    return res.status(400).json({ message: 'State fun fact index value required' });
  }
  if (!funfact || typeof funfact !== 'string') {
    return res.status(400).json({ message: 'State fun fact value required' });
  }

  const stateData = getStateData(code);
  if (!stateData) {
    return res.status(404).json({ message: 'Invalid state abbreviation parameter' });
  }

  try {
    const state = await State.findOne({ stateCode: code });
    if (!state || !state.funfacts || state.funfacts.length === 0) {
      return res.status(404).json({ message: `No Fun Facts found for ${stateData.state}` });
    }
    if (index < 1 || index > state.funfacts.length) {
      return res.status(404).json({ message: `No Fun Fact found at that index for ${stateData.state}` });
    }
    state.funfacts[index - 1] = funfact;
    await state.save();
    res.json(state);
  } catch (error) {
    console.error('Error updating fun fact:', error);
    res.status(500).json({ message: 'Server error updating fun fact' });
  }
};

const deleteFunFact = async (req, res) => {
  const code = req.params.state.toUpperCase();
  const { index } = req.body;

  if (index === undefined) {
    return res.status(400).json({ message: 'State fun fact index value required' });
  }

  const stateData = getStateData(code);
  if (!stateData) {
    return res.status(404).json({ message: 'Invalid state abbreviation parameter' });
  }

  try {
    const state = await State.findOne({ stateCode: code });
    if (!state || !state.funfacts || state.funfacts.length === 0) {
      return res.status(404).json({ message: `No Fun Facts found for ${stateData.state}` });
    }
    if (index < 1 || index > state.funfacts.length) {
      return res.status(404).json({ message: `No Fun Fact found at that index for ${stateData.state}` });
    }
    state.funfacts.splice(index - 1, 1);
    await state.save();
    res.json(state);
  } catch (error) {
    console.error('Error deleting fun fact:', error);
    res.status(500).json({ message: 'Server error deleting fun fact' });
  }
};

module.exports = {
  getAllStates,
  getState,
  getCapital,
  getNickname,
  getPopulation,
  getAdmissionDate,
  getFunFact,
  createFunFact,
  updateFunFact,
  deleteFunFact
};
