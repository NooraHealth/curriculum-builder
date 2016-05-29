import React from 'react';

const LessonsListItem = React.createClass({
  propTypes: {
    // Perhaps change this to an actual Lesson model or something?
    lesson: React.PropTypes.object.isRequired,
    edit: React.PropTypes.func
  },
  renderEditButton() {
    if (this.props.edit) {
      return <button className="ui button" onClick={ this.props.edit}>Edit</button>;
    } else {
      return false;
    }
  },
  render() {
    return (
      <div className="item">
        <div className="header">{ this.props.lesson.title }</div>
        { this.renderEditButton() }
      </div>
    );
  }
});

export { LessonsListItem };
