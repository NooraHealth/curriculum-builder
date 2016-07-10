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
      lessons: Immutable.List(this.props.lessons),
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
      </div>
    );
  },
  renderLessons() {
    if (this.state.lessons.size > 0) {
      return (
        <div className="ui list">
          <Sortable onChange={ this.onChangeOrder } options={ {handle: ".grabber"} }>
            {
              this.state.lessons.map(lesson => {
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
  renderLessonsSegment() {
    if (this.props.curriculum._id) {
      return (
        <div>
          <div className="ui divider" />

          { this.renderLessons() }
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
                        onSave={ this.saveLesson }
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

        { this.renderLessonsSegment() }

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
        let { lessons } = this.state;
        const index = lessons.findIndex(x => x._id === lesson._id);
        lessons = lessons.delete(index);
        this.setState({
          lessons
        });
      }
    });
  },
  saveLesson(lesson) {
    Meteor.call('lessons.upsert', lesson.toJS(), (error, results) => {
      if (error) {
        console.error(error);
      } else {
        let { lessons, showNewLessonForm } = this.state;

        if ("insertedId" in results) {
          lessons = lessons.push(lesson.set('_id', results.insertedId));
          showNewLessonForm = false;
        } else {
          const index = lessons.findIndex(x => x._id === lesson._id);
          lessons = lessons.set(index, lesson);
        }

        this.setState({
          lessons,
          showNewLessonForm
        });

        this.persistLessonsOrder();
      }
    });
  },
  onTitleChange() {
    if (this.state.titleError) {
      this.setState({
        titleError: false
      });
    }
  },
  onChangeOrder(order) {
    const lessons = this.state.lessons.sort((a, b) => order.indexOf(a._id) - order.indexOf(b._id));

    this.setState({
      lessons
    });

    this.persistLessonsOrder();
  },
  persistLessonsOrder() {
    Meteor.call('curriculums.setLessons', this.props.curriculum._id, this.state.lessons.map(x => x._id).toJS());
    Meteor.call('curriculums.touch', this.props.curriculum._id);
  }
});

const BuildCurriculumPageContainer = createContainer(({ _id }) => {
  const curriculumsHandle = Meteor.subscribe('curriculum', _id);
  const lessonsHandle = Meteor.subscribe('lessons.all');

  const loading = !(curriculumsHandle.ready() && lessonsHandle.ready());
  const curriculum = new Curriculum(Curriculums.findOne({ _id }));

  const lesson_ids = curriculum.lessons;

  const lessons = Lessons.find({ _id: { $in: lesson_ids }})
                         .fetch()
                         .sort((a, b) => lesson_ids.indexOf(a._id) - lesson_ids.indexOf(b._id))
                         .map(l => new Lesson(l));

  return {
    loading,
    curriculum,
    lessons
  };
}, ({loading, curriculum, lessons}) => {
  return loading ? <div>Loading...</div> : <BuildCurriculumPage curriculum={ curriculum } lessons={ lessons} />;
});

export default BuildCurriculumPageContainer;
