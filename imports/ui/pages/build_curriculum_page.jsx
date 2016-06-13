/****
 * BuildCurriculumPage
 *
 * Keeps track of the state of the curriculum and
 * any updates made through the child components.
 * Uploads files and saves documents to the MongoDB
 *****/
import React from 'react';
import Immutable from 'immutable';

import { createContainer } from 'meteor/react-meteor-data';

import { Modal } from '../components/semantic-ui/modal';

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
  getInitialState() {
    const { curriculum, lessons } = this.props;
    const state = {
      _id: undefined,
      title: "",
      condition: conditions[0],
      language: languages[0],
      lessons: Immutable.List(),

      showLessonFormModal: false
    };

    if (curriculum) {
      state._id = curriculum._id;
      state.title = curriculum.title;
      state.condition = curriculum.condition;
      state.language = curriculum.language;
    }

    if (lessons) {
      state.lessons = Immutable.List(lessons);
    }

    return state;
  },
  renderCurriculumForm() {
    return (
      <form className="ui form">
        <div className="field">
          <label>Title</label>
          <input type="text" name="title" placeholder="New Title" value={ this.state.title } onChange={ this.onTitleChange } />
        </div>

        <div className="field">
          <label>Condition</label>
          <select className="ui fluid dropdown" value={ this.state.condition } onChange={ this.onConditionChange }>
            { conditions.map(condition => <option key={ condition } value={ condition }>{ condition }</option>) }
          </select>
        </div>

        <div className="field">
          <label>Language</label>
          <select className="ui fluid dropdown" value={ this.state.language } onChange={ this.onLanguageChange }>
            { languages.map(language => <option key={ language } value={ language }>{ language }</option>) }
          </select>
        </div>

        <button className="ui primary button" onClick={ this.saveCurriculum }>Save</button>
      </form>
    );
  },
  renderLessonFormModal() {
    if (this.state.showLessonFormModal) {
      return (
        <Modal onHide={ this.hideLessonFormModal }>
          <div className="content">
            <LessonForm lesson={ this.state.editingLesson } onSubmit={ this.saveLesson } />
          </div>
        </Modal>
      );
    } else {
      return false;
    }
  },
  renderLessons() {
    if (this.state.lessons.size > 0) {
      return (
        <div className="ui list">
          { this.state.lessons.map(lesson => <LessonsListItem lesson={ lesson } key={ lesson._id } edit={ this.editLesson.bind(this, lesson) } />) }
        </div>
      );
    } else {
      return false;
    }
  },
  render() {
    return (
      <div className="ui segments">
        { this.renderNags() }
        { this.renderLessonFormModal() }

        <div className="ui segment">
          { this.renderCurriculumForm() }
        </div>

        <div className="ui segment">
          <button className="ui button" onClick={ this.editLesson.bind(this, undefined) }>Add Lesson</button>

          { this.state.lessons.length > 0 && <div className="ui divider" /> }

          { this.renderLessons() }
        </div>
      </div>
    );
  },
  onTitleChange(event) {
    this.setState({
      title: event.target.value
    });
  },
  onConditionChange(event) {
    this.setState({
      condition: event.target.value
    });
  },
  onLanguageChange(event) {
    this.setState({
      language: event.target.value
    });
  },
  saveCurriculum(event) {
    event.preventDefault();

    Meteor.call('curriculums.upsert', {
      _id: this.state._id,
      title: this.state.title,
      condition: this.state.condition,
      language: this.state.language,
      lessons: this.state.lessons.map(lesson => lesson._id).toArray()
    }, (error, results) => {
      if (error) {
        console.error(error);
      } else {
        if ("insertedId" in results) {
          this.setState({
            _id: results.insertedId
          });
        }

        this.addNag("Curriculum saved");
      }
    });
  },
  editLesson(lesson = new Lesson()) {
    this.setState({
      showLessonFormModal: true,
      editingLesson: lesson
    });
  },
  saveLesson(lesson) {
    Meteor.call('lessons.upsert', lesson.toJS(), (error, results) => {
      if (error) {
        console.error(error);
      } else {
        console.log(results);
        // TODO this is probably unnecessary after switching to container

        let lessons = this.state.lessons;

        if ("insertedId" in results) {
          lessons = lessons.push(lesson.set("_id", results.insertedId));
        } else {
          const index = lessons.findIndex(l => l._id === lesson._id);
          lessons = lessons.set(index, lesson);
        }

        this.setState({
          showLessonFormModal: false,
          lessons
        });
      }
    });
  },
  hideLessonFormModal() {
    this.setState({
      editingLesson: undefined,
      showLessonFormModal: false
    });
  }
});

const BuildCurriculumPageContainer = createContainer(({ _id }) => {
  const curriculumsHandle = Meteor.subscribe('curriculums', _id);
  const lessonsHandle = Meteor.subscribe('lessons.inCurriculum', _id);

  const loading = !(curriculumsHandle.ready() && lessonsHandle.ready());
  const curriculum = Curriculums.findOne({ _id });
  const lessons = Lessons.find().fetch();

  return {
    loading,
    curriculum,
    lessons
  };
}, ({loading, curriculum, lessons}) => {
  return loading ? <div>Loading...</div> : <BuildCurriculumPage curriculum={ curriculum } lessons={ lessons} />;
});

export default BuildCurriculumPageContainer;
