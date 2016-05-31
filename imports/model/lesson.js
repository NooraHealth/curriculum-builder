import Immutable from 'immutable';

const BaseLesson = Immutable.Record({
  _id: '',
  title: '',
  image: 'smileyface.jpg',
  modules: Immutable.List()
});

export class Lesson extends BaseLesson {

}
