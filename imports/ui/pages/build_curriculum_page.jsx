/****
 * BuildCurriculumPage
 *
 * Keeps track of the state of the curriculum and
 * any updates made through the child components.
 * Uploads files and saves documents to the MongoDB
 *****/
import React from 'react';

import { Modal } from '../components/semantic-ui/modal';

import { LessonForm } from '../components/forms/lesson_form';
import { LessonsListItem } from './build_curriculum_page/lessons_list_item';

import { NagsMixin } from '../mixins/nags';

import { Curriculums } from 'meteor/noorahealth:mongo-schemas/schemas/curriculums';

const conditions = ["Cardiac Surgery", "Diabetes", "Neonatology"];
const languages  = ["Hindi", "English", "Kannada", "Tamil"];

const BuildCurriculumPage = React.createClass({
  mixins: [NagsMixin],
  getInitialState() {
    return {
      _id: undefined,
      title: "",
      condition: conditions[0],
      language: languages[0],
      lessons: [],

      lessonInfoModalShown: false
    };
  },
  renderHeader() {
    return (
      <form className="ui form">
        <div className="field">
          <label>Title</label>
          <input type="text" name="title" placeholder="New Title" value={ this.state.title } onChange={ this.onTitleChange } />
        </div>

        <div className="field">
          <label>Condition</label>
          <select className="ui fluid dropdown" value={ this.state.condition } onChange={ this.onConditionChange }>
            { conditions.map(condition => <option key={ condition }>{ condition }</option>) }
          </select>
        </div>

        <div className="field">
          <label>Language</label>
          <select className="ui fluid dropdown" value={ this.state.language } onChange={ this.onLanguageChange }>
            { languages.map(language => <option key={ language }>{ language }</option>) }
          </select>
        </div>

        <button className="ui primary button" onClick={ this.saveCurriculum }>Save</button>
      </form>
    );
  },
  renderLessonInfoModal() {
    if (this.state.lessonInfoModalShown) {
      return (
        <Modal onHide={ this.hideLessonInfoModal }>
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
    if (this.state.lessons.length > 0) {
      return (
        <div className="ui list">
          { this.state.lessons.map(lesson => <LessonsListItem lesson={ lesson } key={ lesson.id } edit={ this.editLessonFactory(lesson) } />) }
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
        { this.renderLessonInfoModal() }

        <div className="ui segment">
          { this.renderHeader() }
        </div>

        <div className="ui segment">
          <button className="ui button" onClick={ this.newLesson }>Add Lesson</button>

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
  newLesson(event) {
    event.preventDefault();
    this.setState({
      lessonInfoModalShown: true
    });
  },
  hideLessonInfoModal() {
    this.setState({
      editingLesson: undefined,
      lessonInfoModalShown: false
    });
  },
  saveCurriculum(event) {
    event.preventDefault();

    Curriculums.insert({
      title: this.state.title,
      condition: this.state.condition,
      language: this.state.language,
      lessons: []
    }, (error, _id) => {
      if (error) {
        // TODO error handling
        console.error(error);
      } else {
        this.addNag("Curriculum saved");
        this.setState({
          _id
        });
      }
    });
  },
  saveLesson(lesson) {
    const lessons = this.state.lessons;

    if (lesson.id === undefined) { // New lesson
      lesson.id = lessons.length + 1;
      lessons.push(lesson);
    } else {
      // TODO Rethink how to deal with saving exisitng lesson
      // From experience, deeply altering the state is a very bad idea and can
      // lead to the UI to fail silently (when the component is buggy that is)
      // and is extremely hard to debug.
      // Perhaps we can use something like ImmutableJS to solve this.

      const existingLesson = this.state.lessons.find(x => x.id === lesson.id);
      existingLesson.title = lesson.title;
      existingLesson.image = lesson.title;
    }

    this.setState({
      lessons,
      lessonInfoModalShown: false
    });
  },
  editLessonFactory(lesson) {
    return () => {
      this.setState({
        lessonInfoModalShown: true,
        editingLesson: lesson
      });
    };
  }
});

export default BuildCurriculumPage;
