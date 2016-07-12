import { Meteor } from 'meteor/meteor';

import Immutable from 'immutable';

import { Lessons } from 'meteor/noorahealth:mongo-schemas';

import { deleteFile as deleteImage } from '../uploads/image';

import './modules';

const Lesson = Immutable.Record({
  _id: '',
  title: '',
  image: '',
  modules: Immutable.List()
});

export { Lesson };

Meteor.methods({
  'lessons.upsert'(lesson) {
    if (!Meteor.userId()) {
      throw new Meteor.Error('Lessons.methods.upsert.not-logged-in', 'Must be logged in to update lessons.');
    }

    return Lessons.upsert(lesson._id, {'$set': {
      title: lesson.title,
      image: lesson.image,
      modules: lesson.modules
    }});
  },
  'lessons.setModules'(_id, module_ids) {
    if (!Meteor.userId()) {
      throw new Meteor.Error('Lessons.methods.setModules.not-logged-in', 'Must be logged in to update lessons.');
    }

    return Lessons.update({ _id }, {
      $set: {
        modules: module_ids
      }
    });
  },
  'lessons.remove'(_id) {
    if (!Meteor.userId()) {
      throw new Meteor.Error('Lessons.methods.remove.not-logged-in', 'Must be logged in to update lessons.');
    }

    const lesson = Lessons.findOne({ _id });

    if (lesson) {
      if (Meteor.isServer) {
        if (lesson.image) {
          deleteImage(lesson.image);
        }
      }

      Lessons.remove({ _id });
      lesson.modules.forEach(_id => Meteor.call('modules.remove', _id));
    }
  }
});
