import React from 'react';

import { LessonForm } from '../../components/forms/lesson_form';

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
      display: 'flex',
      alignItems: 'baseline'
    };

    const contentStyle = {
      flexGrow: 1
    };

    return (
      <div style={ containerStyle }>
        <i className="grabber move icon" />

        <div style={ contentStyle }>
          <div className="header">
            <a href={ `/curriculums/${this.props.curriculum._id}/lessons/${this.props.lesson._id}` }>
              { this.props.lesson.title }
            </a>
          </div>
        </div>

        <button className="ui icon button" onClick={ this.onEdit }>
          <i className="write icon" />
        </button>

        <button className="negative ui icon button" onClick={ this.onRemove }>
          <i className="trash icon" />
        </button>

      </div>
    );
  },
  renderForm() {
    return (
      <LessonForm lesson={ this.props.lesson }
                  onSave={ this.onSave }
                  onCancel={ this.hideEditForm }/>
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
  },
  hideEditForm(event) {
    event.preventDefault();

    this.setState({
      edit: false
    });
  }
});

export { LessonsListItem };
