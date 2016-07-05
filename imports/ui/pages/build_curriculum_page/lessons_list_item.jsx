import React from 'react';

import { imageURL } from '../../../uploads/image';

const LessonsListItem = React.createClass({
  propTypes: {
    // Perhaps change this to an actual Lesson model or something?
    curriculum: React.PropTypes.object.isRequired,
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
    // TODO move these style to CSS
    const containerStyle = {
      display: 'flex'
    };

    const contentStyle = {
      flexGrow: 1
    };

    const url = imageURL(this.props.lesson.image);

    return (
      <div className="item"
           style={ containerStyle }
           data-id={ this.props.lesson._id }>
        <a href={ url } className="ui small image" target="_blank">
          <img src={ url } />
        </a>

        <div style={ contentStyle }>
          <div className="header">
            <a href={ `/curriculums/${this.props.curriculum._id}/lessons/${this.props.lesson._id}` }>
              { this.props.lesson.title }
            </a>
          </div>
          { this.renderEditButton() }
        </div>
      </div>
    );
  }
});

export { LessonsListItem };
