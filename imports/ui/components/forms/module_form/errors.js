import Immutable from 'immutable';

const BaseErrors = Immutable.Record({
  title: false,
  question: false,
  image: false,
  audio: false,
  correct_audio: false,
  video: false,
  options: Immutable.List([false, false, false, false, false, false])
});

export default class Errors extends BaseErrors {
  any() {
    return this.some((v, k) => {
      if (k === 'options') {
        return v.some(x => x);
      } else {
        return v;
      }
    });
  }
}
