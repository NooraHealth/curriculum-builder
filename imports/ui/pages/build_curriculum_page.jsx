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

import { LessonForm } from '../components/forms/lesson_form';
import { LessonsListItem } from './build_curriculum_page/lessons_list_item';

import { NagsMixin } from '../mixins/nags';

import { Curriculums, Lessons } from 'meteor/noorahealth:mongo-schemas';

import '../../api/curriculums';
import { Lesson } from '../../api/lessons';

const conditions = ["Cardiac Surgery", "Diabetes", "Neonatology"];
const languages  = ["Hindi", "English", "Kannada", "Tamil"];

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
  renderCurriculumForm() {
    const { title, condition, language } = this.props.curriculum;

    return (
      <form className="ui form">
        <div className="field">
          <label>Title</label>
          <input type="text" name="title" placeholder="New Title" defaultValue={ title } ref={ c => this._title = c } />
        </div>

        <div className="field">
          <label>Condition</label>
          <select className="ui fluid dropdown" defaultValue={ condition || conditions[0] } ref={ c => this._condition = c }>
            { conditions.map(condition => <option key={ condition } value={ condition }>{ condition }</option>) }
          </select>
        </div>

        <div className="field">
          <label>Language</label>
          <select className="ui fluid dropdown" defaultValue={ language || languages[0] } ref={ c => this._language = c }>
            { languages.map(language => <option key={ language } value={ language }>{ language }</option>) }
          </select>
        </div>

        <button className="ui primary button" onClick={ this.saveCurriculum }>Save</button>
      </form>
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
    if (this.state.showNewLessonForm) {
      return (
        <div className="ui segment">
          <LessonForm lesson={ new Lesson() } onSave={ this.saveLesson } />
        </div>
      );
    } else {
      return (
        <button className="ui button" onClick={ this.showNewLessonForm }>
          Add Lesson
        </button>
      );
    }
  },
  render() {
    return (
      <div>
        { this.renderNags() }
        { this.renderMenu() }

        { this.renderCurriculumForm() }

        { this.renderLessonsSegment() }

        { this.renderNewLessonForm() }
      </div>
    );
  },
  saveCurriculum(event) {
    event.preventDefault();

    Meteor.call('curriculums.upsert', {
      _id: this.props.curriculum._id,
      title: this._title.value,
      condition: this._condition.value,
      language: this._language.value,
      lessons: this.state.lessons.map(lesson => lesson._id)
    }, (error, results) => {
      if (error) {
        console.error(error);
      } else {
        if ("insertedId" in results) {
          FlowRouter.go(`/${results.insertedId}`);
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
  const curriculum = Curriculums.findOne({ _id });

  const lesson_ids = curriculum ? curriculum.lessons : [];

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
