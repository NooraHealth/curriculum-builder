import { Meteor } from 'meteor/meteor';

import Immutable from 'immutable';

import { Curriculums, Lessons, Modules } from 'meteor/noorahealth:mongo-schemas';

import './lessons';

const Curriculum = Immutable.Record({
  _id: '',
  title: '',
  condition: '',
  language: '',
  lessons: []
});

export { Curriculum };

Meteor.methods({
  'curriculums.upsert'(curriculum) {
    if (!Meteor.userId()) {
      throw new Meteor.Error('Curriculums.methods.upsert.not-logged-in', 'Must be logged in to update curriculums.');
    }

    return Curriculums.upsert(curriculum._id, {'$set': {
      title: curriculum.title,
      condition: curriculum.condition,
      language: curriculum.language,
      lessons: curriculum.lessons,
      last_updated: new Date()
    }});
  },
  'curriculums.setLessons'(_id, lesson_ids) {
    if (!Meteor.userId()) {
      throw new Meteor.Error('Curriculums.methods.setLessons.not-logged-in', 'Must be logged in to update curriculums.');
    }

    return Curriculums.update({ _id }, {
      $set: {
        lessons: lesson_ids
      }
    });
  },
  'curriculums.touch'(_id) {
    if (!Meteor.userId()) {
      throw new Meteor.Error('Curriculums.methods.touch.not-logged-in', 'Must be logged in to update curriculums.');
    }

    return Curriculums.update({ _id }, {
      $set: {
        last_updated: new Date()
      }
    });
  },
  'curriculums.remove'(_id) {
    if (!Meteor.userId()) {
      throw new Meteor.Error('Curriculums.methods.delete.not-logged-in', 'Must be logged in to update curriculums.');
    }

    const curriculum = Curriculums.findOne({ _id });

    Curriculums.remove({ _id });
    curriculum.lessons.forEach(_id => Meteor.call('lessons.remove', _id));
  }
})
