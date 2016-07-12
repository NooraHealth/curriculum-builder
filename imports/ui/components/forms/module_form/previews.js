import Immutable from 'immutable';

const Previews = Immutable.Record({
  image: undefined,
  options_images: Immutable.List(),
  audio: undefined,
  correct_audio: undefined,
  video: undefined
});

export default Previews;
