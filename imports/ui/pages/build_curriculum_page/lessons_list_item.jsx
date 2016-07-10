import React from 'react';

import { LessonForm } from '../../components/forms/lesson_form';

import { imageURL } from '../../../uploads/image';

import { Lesson } from '../../../api/lessons';

const LessonsListItem = React.createClass({
  propTypes: {
    // Perhaps change this to an actual Lesson model or something?
    curriculum: React.PropTypes.object.isRequired,
    lesson: React.PropTypes.instanceOf(Lesson).isRequired,
    onSave: React.PropTypes.func.isRequired,
    onRemove: React.PropTypes.func.isRequired
  },
  getInitialState() {
    return {
      edit: false
    };
  },
  renderContent() {
    const containerStyle = {
      display: 'flex'
    };

    const contentStyle = {
      flexGrow: 1
    };

    const url = imageURL(this.props.lesson.image);

    return (
      <div style={ containerStyle }>
        <i className="grabber move icon" />

        <a href={ url } className="ui small image" target="_blank">
          <img src={ url } />
        </a>

        <div style={ contentStyle }>
          <div className="header">
            <a href={ `/curriculums/${this.props.curriculum._id}/lessons/${this.props.lesson._id}` }>
              { this.props.lesson.title }
            </a>
          </div>

          <button className="ui button" onClick={ this.onEdit }>
            Edit
          </button>

          <button className="negative ui button" onClick={ this.onRemove }>
            Remove
          </button>
        </div>
      </div>
    );
  },
  renderForm() {
    return (
      <LessonForm lesson={ this.props.lesson }
                  onSubmit={ this.onSave }/>
    );
  },
  render() {
    return (
      <div className="ui segment" data-id={ this.props.lesson._id }>
        { this.state.edit ? this.renderForm() : this.renderContent() }
      </div>
    );
  },
  onEdit(event) {
    event.preventDefault();

    this.setState({
      edit: true
    });
  },
  onSave(lesson) {
    this.props.onSave(lesson);
    this.setState({
      edit: false
    });
  },
  onRemove(event) {
    event.preventDefault();

    if (confirm(`Are you sure you want to remove ${this.props.lesson.title}?`)) {
        this.props.onRemove(this.props.lesson);
    }
  }
});

export { LessonsListItem };
