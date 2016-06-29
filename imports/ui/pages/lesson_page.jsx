import React from 'react';

import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import { Lessons } from 'meteor/noorahealth:mongo-schemas';

const LessonPage = React.createClass({
  render() {
    return <div>{ this.props.lesson.title }</div>;
  }
});

const LessonPageContainer = createContainer(({ _id }) => {
  const lessonsHandle = Meteor.subscribe('lesson', _id);
  const loading = !lessonsHandle.ready();
  const lesson = Lessons.findOne({ _id });

  return {
    loading,
    lesson
  };
}, ({ loading, lesson }) => {
  return loading ? <div>Loading...</div> : <LessonPage lesson={ lesson } />;
});

export default LessonPageContainer;
