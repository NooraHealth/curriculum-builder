import { Meteor } from 'meteor/meteor';

import Immutable from 'immutable';

import { Lessons } from 'meteor/noorahealth:mongo-schemas';

import { deleteFile as deleteImage } from '../uploads/image';

import './modules';

const BaseLesson = Immutable.Record({
  _id: '',
  title: '',
  type: 'beginner',
  image: '',
  modules: Immutable.List()
});

export class Lesson extends BaseLesson {
  constructor(properties) {
    super(Object.assign({}, properties, {
      modules: Immutable.List(properties && properties.modules)
    }));
  }

  isBeginner() {
    return this.type === 'beginner';
  }

  isIntermediate() {
    return this.type === 'intermediate';
  }

  isAdvanced() {
    return this.type === 'advanced';
  }

  save() {
    return new Promise((resolve, reject) => {
      Meteor.call('lessons.upsert', this.toJS(), (error, results) => {
        if (error) {
          reject(error);
        } else {
          let lesson = this;
          if ("insertedId" in results) {
            lesson = lesson.set('_id', results.insertedId);
          }
          resolve(lesson);
        }
      });
    });
  }

  addModule(module) {
    if (!this.modules.includes(module._id)) {
      let modules = this.modules;
      modules = modules.push(module._id);
      const lesson = this.set('modules', modules);
      return lesson.save();
    } else {
      return this.save();
    }
  }

  setModules(modules) {
    const lesson = this.set('modules', modules.map(m => m._id));

    return lesson.save();
  }

  removeModule(module) {
    const modules = this.modules.filter(id => id !== module._id);
    const lesson = this.set('modules', modules);
    return lesson.save();
  }

  remove() {
    return new Promise((resolve, reject) => {
      Meteor.call('lessons.remove', this._id, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(this);
        }
      });
    });
  }
}

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
