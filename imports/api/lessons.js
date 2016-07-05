import { Meteor } from 'meteor/meteor';

import Immutable from 'immutable';

import { Lessons } from 'meteor/noorahealth:mongo-schemas';

const Lesson = Immutable.Record({
  _id: '',
  title: '',
  image: '',
  modules: Immutable.List()
});

export { Lesson };

Meteor.methods({
  'lessons.upsert'(lesson) {
    return Lessons.upsert(lesson._id, {'$set': {
      title: lesson.title,
      image: lesson.image,
      modules: lesson.modules
    }});
  },
  'lessons.setModules'(_id, module_ids) {
    return Lessons.update({ _id }, {
      $set: {
        modules: module_ids
      }
    });
  }
});
