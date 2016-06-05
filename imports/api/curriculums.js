import { Meteor } from 'meteor/meteor';

import { Curriculums } from 'meteor/noorahealth:mongo-schemas';

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
