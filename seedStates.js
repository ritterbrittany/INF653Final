require('dotenv').config();
const mongoose = require('mongoose');
const State = require('./models/states');

const seedData = [
  {
    stateCode: 'KS',
    funfacts: [
      'State flower - sunflower',
      'State rock - jelenite',
      'State animal - American bison'
    ]
  },
  {
    stateCode: 'MO',
    funfacts: [
      'State flower - hawthorn',
      'State rock - mozarkite',
      'State animal - Missouri mule'
    ]
  },
  {
    stateCode: 'OK',
    funfacts: [
      'State flower - mistletoe',
      'State rock - barite rose',
      'State animal - American bison'
    ]
  },
  {
    stateCode: 'NE',
    funfacts: [
      'State flower - goldenrod',
      'State rock - blue agate',
      'State animal - white-tailed deer'
    ]
  },
  {
    stateCode: 'CO',
    funfacts: [
      'State flower - Rocky Mountain columbine',
      'State rock - aquamarine',
      'State animal - Rocky Mountain bighorn sheep'
    ]
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await State.deleteMany({});
    await State.insertMany(seedData);
    console.log('Database seeded!');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

seedDatabase();