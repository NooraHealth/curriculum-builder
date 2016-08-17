import Immutable from 'immutable';

const BaseErrors = Immutable.Record({
  title: false,
  question: false,
  image: false,
  audio: false,
  correct_audio: false,
  video: false,
  options: false
});

export default class Errors extends BaseErrors {
  any() {
    return this.some(v => v);
  }
}
