import { Meteor } from 'meteor/meteor';

import Immutable from 'immutable';

import { Modules } from 'meteor/noorahealth:mongo-schemas';

import { deleteFile as deleteAudio } from '../uploads/audio';
import { deleteFile as deleteImage } from '../uploads/image';
import { deleteFile as deleteVideo } from '../uploads/video';

const BaseModule = Immutable.Record({
  _id: '',
  type: "MULTIPLE_CHOICE",
  title: undefined,
  image: undefined,
  question: undefined,
  options: undefined,
  correct_answer: undefined,
  correct_audio: undefined,
  video: undefined,
  audio: undefined,
  is_active: true
});

export class Module extends BaseModule {
  save() {
    return new Promise((resolve, reject) => {
      Meteor.call('modules.upsert', this.toJS(), (error, results) => {
        if (error) {
          reject(error);
        } else {
          let module = this;

          if ("insertedId" in results) {
            module = module.set("_id", results.insertedId);
          }

          resolve(module);
        }
      });
    });
  }

  remove() {
    return new Promise((resolve, reject) => {
      Meteor.call('modules.remove', this._id, (error, results) => {
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
  'modules.upsert'(module) {
    if (!Meteor.userId()) {
      throw new Meteor.Error('Modules.methods.upsert.not-logged-in', 'Must be logged in to update modules.');
    }

    return Modules.upsert(module._id, {'$set': {
      type: module.type,
      title: module.title,
      image: module.image,
      question: module.question,
      options: module.options,
      correct_answer: module.correct_answer,
      correct_audio: module.correct_audio,
      video: module.video,
      audio: module.audio,
      is_active: module.is_active
    }});
  },
  'modules.remove'(_id) {
    if (!Meteor.userId()) {
      throw new Meteor.Error('Modules.methods.delete.not-logged-in', 'Must be logged in to update modules.');
    }

    const module = Modules.findOne({ _id });

    if (module) {
      const promises = [];

      if (Meteor.isServer) {
        if (module.image) {
          promises.push(deleteImage(module.image));
        }

        if (module.audio) {
          promises.push(deleteAudio(module.audio));
        }

        if (module.correct_audio) {
          promises.push(deleteAudio(module.correct_audio));
        }

        if (module.video) {
          promises.push(deleteVideo(module.video));
        }

        if (module.type === 'MULTIPLE_CHOICE') {
          module.options.forEach(img => {
            promises.push(deleteImage(img))
          });
        }
      }

      Promise.all(promises).then(() => Modules.remove({ _id }));
    }
  }
});
