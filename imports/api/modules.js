import { Meteor } from 'meteor/meteor';

import Immutable from 'immutable';

import { Modules } from 'meteor/noorahealth:mongo-schemas';

const Module = Immutable.Record({
  _id: '',
  type: "MULTIPLE_CHOICE",
  title: undefined,
  image: undefined,
  question: undefined,
  options: undefined,
  correct_answer: undefined,
  correct_audio: undefined,
  video: undefined,
  audio: undefined
});

export { Module };

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
      audio: module.audio
    }});
  }
});
