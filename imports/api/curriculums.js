import { Meteor } from 'meteor/meteor';

import Immutable from 'immutable';

import { Curriculums } from 'meteor/noorahealth:mongo-schemas';

const Curriculum = Immutable.Record({
  _id: '',
  title: '',
  condition: '',
  language: '',
  lessons: Immutable.List()
});

export { Curriculum };

Meteor.methods({
  'curriculums.upsert'(curriculum) {
    return Curriculums.upsert(curriculum._id, {'$set': {
      title: curriculum.title,
      condition: curriculum.condition,
      language: curriculum.language,
      lessons: curriculum.lessons
    }});
  }
})
