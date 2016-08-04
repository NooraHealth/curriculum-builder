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
      // beginnerLessons: Immutable.List(this.props.beginnerLessons),
      // intermediateLessons: Immutable.List(this.props.intermediateLessons),
      // advancedLessons: Immutable.List(this.props.advancedLessons),
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
                                   key={ lesson._id }
                                   onSave={ this.saveLesson }
                                   onRemove={ this.removeLesson }/>
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
            <LessonForm lesson={ new Lesson() }
                        onSave={ this.afterSaveLesson }
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
                        onSave={ this.saveCurriculum } />

        { this.renderLessonsSegment('beginner') }
        { this.renderLessonsSegment('intermediate') }
        { this.renderLessonsSegment('advanced') }

        { this.renderNewLessonForm() }
      </div>
    );
  },
  saveCurriculum(curriculum) {
    Meteor.call('curriculums.upsert', curriculum.toJS(), (error, results) => {
      if (error) {
        console.error(error);
      } else {
        if ("insertedId" in results) {
          FlowRouter.go(`/curriculums/${results.insertedId}`);
        } else {
          this.addNag("Curriculum saved");
        }
      }
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
  removeLesson(lesson) {
    Meteor.call('lessons.remove', lesson._id, (error, result) => {
      if (error) {
        console.error(error);
      } else {
        let lessons = this.state[`${lesson.type}Lessons`];
        const index = lessons.findIndex(x => x._id === lesson._id);
        lessons = lessons.delete(index);

        this.setState({
          [`${lesson.type}Lessons`]: lessons
        });

        this.persistLessonsOrder();
      }
    });
  },
  saveLesson(lesson) {
    Meteor.call('lessons.upsert', lesson.toJS(), (error, results) => {
      if (error) {
        console.error(error);
      } else {
        let { beginnerLessons, showNewLessonForm } = this.state;
        let lessons = this.state[`${lesson.type}Lessons`];

        if ("insertedId" in results) {
          lessons = lessons.push(lesson.set('_id', results.insertedId));
          showNewLessonForm = false;
        } else {
          const index = lessons.findIndex(x => x._id === lesson._id);
          lessons = lessons.set(index, lesson);
        }

        this.setState({
          [`${lesson.type}Lessons`]: lessons,
          showNewLessonForm
        });

        this.persistLessonsOrder();
      }
    });
  },
  afterSaveLesson(promise) {
    promise.then(lesson => this.props.curriculum.addLesson(lesson)).then(() => {
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
    const lessons = this.state[`${type}Lessons`].sort((a, b) => order.indexOf(a._id) - order.indexOf(b._id));

    this.setState({
      [`${type}Lessons`]: lessons
    });

    this.persistLessonsOrder();
  },
  persistLessonsOrder() {
    ['beginner', 'intermediate', 'advanced'].forEach(type => {
      Meteor.call('curriculums.setLessons', this.props.curriculum._id, type, this.state[`${type}Lessons`].map(x => x._id).toJS());
    });
    Meteor.call('curriculums.touch', this.props.curriculum._id);
  }
});

const BuildCurriculumPageContainer = createContainer(({ _id }) => {
  const curriculumsHandle = Meteor.subscribe('curriculum', _id);
  const lessonsHandle = Meteor.subscribe('lessons.all');

  const loading = !(curriculumsHandle.ready() && lessonsHandle.ready());
  const curriculum = new Curriculum(Curriculums.findOne({ _id }));

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
    beginnerLessons: Immutable.List(beginnerLessons),
    intermediateLessons: Immutable.List(intermediateLessons),
    advancedLessons: Immutable.List(advancedLessons)
  };
}, ({loading, curriculum, beginnerLessons, intermediateLessons, advancedLessons}) => {
  if (loading) {
    return <div>Loading...</div>;
  } else {
    return <BuildCurriculumPage curriculum={ curriculum }
                                beginnerLessons={ beginnerLessons }
                                intermediateLessons={ intermediateLessons }
                                advancedLessons={ advancedLessons } />;
  }
});

export default BuildCurriculumPageContainer;
