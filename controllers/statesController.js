const State = require('../models/states');
const statesData = require('../models/statesData.json');

const getStateData = (code) => {
  return statesData.find(state => state.code.toUpperCase() === code.toUpperCase());
};

const getAllStates = async (req, res) => {
  const { contig } = req.query;
  let states = [...statesData];

  if (contig === 'true') {
    states = states.filter(state => state.code !== 'AK' && state.code !== 'HI');
  } else if (contig === 'false') {
    states = states.filter(state => state.code === 'AK' || state.code === 'HI');
  }

  const dbStates = await State.find();
  const merged = states.map(state => {
    const match = dbStates.find(db => db.stateCode === state.code);
    if (match && match.funfacts.length > 0) {
      return { ...state, funfacts: match.funfacts };
    }
    return state;
  });

  res.json(merged);
};

const getState = async (req, res) => {
  const code = req.params.state.toUpperCase();
  const state = getStateData(code);
  if (!state) return res.status(404).json({ message: 'Invalid state abbreviation parameter' });

  const dbEntry = await State.findOne({ stateCode: code });
  if (dbEntry?.funfacts?.length > 0) {
    state.funfacts = dbEntry.funfacts;
  }

  res.json(state);
};

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

const getFunFact = async (req, res) => {
  const code = req.params.state.toUpperCase();
  const dbEntry = await State.findOne({ stateCode: code });
  const state = getStateData(code);
  if (!dbEntry || dbEntry.funfacts.length === 0) {
    return res.status(404).json({ message: `No Fun Facts found for ${state?.state || code}` });
  }

  const randomIndex = Math.floor(Math.random() * dbEntry.funfacts.length);
  res.json({ funfact: dbEntry.funfacts[randomIndex] });
};

const createFunFact = async (req, res) => {
  const code = req.params.state.toUpperCase();
  const { funfacts } = req.body;

  if (!funfacts || !Array.isArray(funfacts)) {
    return res.status(400).json({ message: 'State fun facts value must be an array of strings' });
  }

  let state = await State.findOne({ stateCode: code });

  if (state) {
    state.funfacts.push(...funfacts);
  } else {
    state = new State({ stateCode: code, funfacts });
  }

  await state.save();
  res.json(state);
};

const updateFunFact = async (req, res) => {
  const code = req.params.state.toUpperCase();
  const { index, funfact } = req.body;
  const stateData = getStateData(code);

  if (!stateData) {
    return res.status(404).json({ message: 'Invalid state abbreviation parameter' });
  }

  if (index === undefined) {
    return res.status(400).json({ message: 'State fun fact index value required' });
  }

  if (!funfact || typeof funfact !== 'string') {
    return res.status(400).json({ message: 'State fun fact value required' });
  }

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
};

const deleteFunFact = async (req, res) => {
  try {
    const code = req.params.state.toUpperCase();
    const { index } = req.body;
    const stateData = getStateData(code);

    if (!stateData) {
      return res.status(404).json({ message: 'Invalid state abbreviation parameter' });
    }

    if (index === undefined) {
      return res.status(400).json({ message: 'State fun fact index value required' });
    }

    const state = await State.findOne({ stateCode: code });

    if (!state || !state.funfacts || state.funfacts.length === 0) {
      return res.status(404).json({ message: `No Fun Facts found for ${stateData.state}` });
    }

    if (index < 1 || index > state.funfacts.length) {
      return res.status(400).json({ message: `No Fun Fact found at that index for ${stateData.state}` });
    }

    state.funfacts.splice(index - 1, 1);
    await state.save();
    return res.json(state);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error deleting fun fact' });
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
