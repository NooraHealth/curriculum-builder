/****
 * BuildCurriculumPage
 *
 * Keeps track of the state of the curriculum and
 * any updates made through the child components.
 * Uploads files and saves documents to the MongoDB
 *****/
import React from 'react';
import Immutable from 'immutable'

import { createContainer } from 'meteor/react-meteor-data';

import Sortable from 'react-sortablejs';

import { CurriculumForm } from '../components/forms/curriculum_form';
import { LessonForm } from '../components/forms/lesson_form';
import { LessonsListItem } from './build_curriculum_page/lessons_list_item';

import { NagsMixin } from '../mixins/nags';

import { Curriculums, Lessons } from 'meteor/noorahealth:mongo-schemas';

import { Curriculum } from '../../api/curriculums';
import { Lesson } from '../../api/lessons';

import classnames from '../../utilities/classnames';
import capitalize from '../../utilities/capitalize';

const BuildCurriculumPage = React.createClass({
  mixins: [NagsMixin],
  getDefaultProps() {
    return {
      curriculum: {},
      lessons: []
    };
  },
  getInitialState() {
    return {
      showNewLessonForm: false
    };
  },
  renderMenu() {
    return (
      <div className="ui text menu">
        <div className="item">
          <a href="/curriculums">
            <i className="chevron left icon" />
            Back to curriculums list
          </a>
        </div>

        <div className="ui right item">
          <a href="#" onClick={ e => e.preventDefault() || AccountsTemplates.logout() }>
            Sign Out
          </a>
        </div>
      </div>
    );
  },
  renderLessons(lessons) {
    if (lessons.size > 0) {
      const { type } = lessons.get(0);

      return (
        <div className="ui list">
          <Sortable onChange={ this.onChangeOrder.bind(this, type) } options={ {handle: ".grabber"} }>
            {
              lessons.map(lesson => {
                return (
                  <LessonsListItem curriculum={ this.props.curriculum }
                                   lesson={ lesson }
                                   key={ lesson._id } />
                );
              })
            }
          </Sortable>
        </div>
      );
    } else {
      return false;
    }
  },
  renderIntroductionLesson() {
    const renderLesson = () => {
      if (this.props.introductionLesson._id) {
        return (
          <div className="ui list">
            <LessonsListItem curriculum={ this.props.curriculum }
                             lesson={ this.props.introductionLesson }
                             sortable={ false } />
          </div>
        );
      }
    };

    if (this.props.curriculum._id) {
      return (
        <div>
          <div className="ui divider" />
          <h2>Introduction</h2>
          { renderLesson() }
        </div>
      );
    }
  },
  renderLessonsSegment(type) {
    if (this.props.curriculum._id) {
      const property = `${type}Lessons`;
      const lessons = this.state[property] || this.props[property];

      return (
        <div>
          <div className="ui divider" />
          <h2>{ capitalize(type) }</h2>

          { this.renderLessons(lessons) }
        </div>
      );
    } else {
      return false;
    }
  },
  renderNewLessonForm() {
    if (this.props.curriculum._id) {
      if (this.state.showNewLessonForm) {
        return (
          <div className="ui segment">
            <LessonForm curriculum={ this.props.curriculum }
                        lesson={ new Lesson() }
                        didSave={ this.didSaveLesson }
                        onCancel={ this.hideNewLessonForm } />
          </div>
        );
      } else {
        return (
          <button className="green ui labeled icon button"
                  onClick={ this.showNewLessonForm }
                  style={ {marginTop: '1rem'} }>
            <i className="plus icon" />
            New Lesson
          </button>
        );
      }
    }
  },
  render() {
    return (
      <div>
        { this.renderNags() }
        { this.renderMenu() }

        <CurriculumForm curriculum={ this.props.curriculum }
                        didSave={ this.didSaveCurriculum } />

        { this.renderIntroductionLesson() }
        { this.renderLessonsSegment('beginner') }
        { this.renderLessonsSegment('intermediate') }
        { this.renderLessonsSegment('advanced') }

        { this.renderNewLessonForm() }
      </div>
    );
  },
  didSaveCurriculum(promise) {
    promise.then(curriculum => {
      FlowRouter.go(`/curriculums/${curriculum._id}`);
    }, error => {
      console.error(error);
    });
  },
  showNewLessonForm(event) {
    event.preventDefault();

    this.setState({
      showNewLessonForm: true
    });
  },
  hideNewLessonForm(event) {
    event.preventDefault();

    this.setState({
      showNewLessonForm: false
    });
  },
  didSaveLesson(promise) {
    promise.then(() => {
      this.setState({
        showNewLessonForm: false
      });
    }, error => {
      console.error(error);
    });
  },
  onTitleChange() {
    if (this.state.titleError) {
      this.setState({
        titleError: false
      });
    }
  },
  onChangeOrder(type, order) {
    const property = `${type}Lessons`;
    const lessons = this.props[property].sort((a, b) => order.indexOf(a._id) - order.indexOf(b._id));

    this.setState({
      [property]: lessons
    });

    const curriculum = this.props.curriculum.set(type, Immutable.List(order));
    curriculum.save().then(() => {
      this.setState({
        [property]: undefined
      });
    }, error => console.error(error));
  }
});

const BuildCurriculumPageContainer = createContainer(({ _id }) => {
  const curriculumsHandle = Meteor.subscribe('curriculum', _id);
  const lessonsHandle = Meteor.subscribe('lessons.all');

  const loading = !(curriculumsHandle.ready() && lessonsHandle.ready());
  const curriculum = new Curriculum(Curriculums.findOne({ _id }));

  const introductionLesson = new Lesson(Lessons.findOne({ _id: curriculum.introduction })).set('type', 'introduction');

  const beginnerLessons = Lessons.find({ _id: { $in: curriculum.beginner.toJS() }})
                                 .fetch()
                                 .sort((a, b) => curriculum.beginner.indexOf(a._id) - curriculum.beginner.indexOf(b._id))
                                 .map(l => new Lesson(l).set('type', 'beginner'));

  const intermediateLessons = Lessons.find({ _id: { $in: curriculum.intermediate.toJS() }})
                                     .fetch()
                                     .sort((a, b) => curriculum.intermediate.indexOf(a._id) - curriculum.intermediate.indexOf(b._id))
                                     .map(l => new Lesson(l).set('type', 'intermediate'));

  const advancedLessons = Lessons.find({ _id: { $in: curriculum.advanced.toJS() }})
                                 .fetch()
                                 .sort((a, b) => curriculum.advanced.indexOf(a._id) - curriculum.advanced.indexOf(b._id))
                                 .map(l => new Lesson(l).set('type', 'advanced'));

  return {
    loading,
    curriculum,
    introductionLesson,
    beginnerLessons: Immutable.List(beginnerLessons),
    intermediateLessons: Immutable.List(intermediateLessons),
    advancedLessons: Immutable.List(advancedLessons)
  };
}, ({loading, curriculum, introductionLesson, beginnerLessons, intermediateLessons, advancedLessons}) => {
  if (loading) {
    return <div>Loading...</div>;
  } else {
    return <BuildCurriculumPage curriculum={ curriculum }
                                introductionLesson={ introductionLesson }
                                beginnerLessons={ beginnerLessons }
                                intermediateLessons={ intermediateLessons }
                                advancedLessons={ advancedLessons } />;
  }
});

export default BuildCurriculumPageContainer;
