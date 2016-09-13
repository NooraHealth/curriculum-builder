import { Meteor } from 'meteor/meteor';

import Immutable from 'immutable';

import { Curriculums, Lessons, Modules } from 'meteor/noorahealth:mongo-schemas';

import './lessons';

const BaseCurriculum = Immutable.Record({
  _id: '',
  title: '',
  condition: '',
  language: '',
  introduction: undefined,
  beginner: Immutable.List(),
  intermediate: Immutable.List(),
  advanced: Immutable.List()
});

export class Curriculum extends BaseCurriculum {
  constructor(properties) {
    super(Object.assign({}, properties, {
      beginner: Immutable.List(properties && properties.beginner),
      intermediate: Immutable.List(properties && properties.intermediate),
      advanced: Immutable.List(properties && properties.advanced)
    }));
  }

  save() {
    return new Promise((resolve, reject) => {
      Meteor.call('curriculums.upsert', this.toJS(), (error, results) => {
        if (error) {
          reject(error);
        } else {
          let curriculum = this;

          if ("insertedId" in results) {
            curriculum = curriculum.set('_id', results.insertedId);
          }

          resolve(curriculum);
        }
      });
    });
  }

  addLesson(lesson) {
    const levels = ["beginner", "intermediate", "advanced"];
    const otherLevels = levels.filter(x => x !== lesson.type);

    let curriculum = this;

    otherLevels.forEach(level => {
      const lessons = curriculum[level].filter(id => id !== lesson._id);
      curriculum = curriculum.set(level, lessons);
    });

    if (lesson.isIntroduction()) {
      curriculum = curriculum.set('introduction', lesson._id);
    } else {
      if (!curriculum[lesson.type].includes(id => id !== lesson._id)) {
        curriculum = curriculum.set(lesson.type, curriculum[lesson.type].push(lesson._id));
      }

      if (curriculum.introduction === lesson._id) {
        curriculum = curriculum.set('introduction', null);
      }
    }

    return curriculum.save();
  }

  removeLesson(lesson) {
    console.log("Removing the lesson!!");
    console.log(lesson);
    let curriculum = this;

    ["beginner", "intermediate", "advanced"].forEach(level => {
      const lessons = curriculum[level].filter(id => id !== lesson._id);
      curriculum = curriculum.set(level, lessons);
    });

    if(curriculum.introduction == lesson._id) {
      curriculum = curriculum.set("introduction", "");
    }

    return curriculum.save();
  }
}

Meteor.methods({
  'curriculums.upsert'(curriculum) {
    console.log("upserting this");
    console.log(curriculum);
    if (!Meteor.userId()) {
      throw new Meteor.Error('Curriculums.methods.upsert.not-logged-in', 'Must be logged in to update curriculums.');
    }

    return Curriculums.upsert(curriculum._id, {'$set': {
      title: curriculum.title,
      condition: curriculum.condition,
      language: curriculum.language,
      introduction: curriculum.introduction,
      beginner: curriculum.beginner,
      intermediate: curriculum.intermediate,
      advanced: curriculum.advanced,
      last_updated: new Date()
    }});
  },
  'curriculums.setLessons'(_id, lesson_type, lesson_ids) {
    if (!Meteor.userId()) {
      throw new Meteor.Error('Curriculums.methods.setLessons.not-logged-in', 'Must be logged in to update curriculums.');
    }

    return Curriculums.update({ _id }, {
      $set: {
        [lesson_type]: lesson_ids
      }
    });
  },
  'curriculums.touch'(_id) {
    if (!Meteor.userId()) {
      throw new Meteor.Error('Curriculums.methods.touch.not-logged-in', 'Must be logged in to update curriculums.');
    }

    // return Curriculums.update({ _id }, {
    //   $set: {
    //     last_updated: new Date()
    //   }
    // });
  },
  'curriculums.remove'(_id) {
    if (!Meteor.userId()) {
      throw new Meteor.Error('Curriculums.methods.delete.not-logged-in', 'Must be logged in to update curriculums.');
    }

    const curriculum = Curriculums.findOne({ _id });

    Curriculums.remove({ _id });
    ["beginner", "intermediate", "advanced"].forEach(type => {
      curriculum[type].forEach(_id => Meteor.call('lessons.remove', _id));
    });

    Meteor.call('lessons.remove', curriculum.introduction);
  }
})
