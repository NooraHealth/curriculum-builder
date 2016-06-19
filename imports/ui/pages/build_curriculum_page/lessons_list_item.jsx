import React from 'react';

import { imageURL } from '../../../uploads/image';

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
    // TODO move these style to CSS

    const containerStyle = {
      display: 'flex'
    };

    const contentStyle = {
      flexGrow: 1
    };

    return (
      <div className="item" style={ containerStyle }>
        <div className="ui small image">
          <img src={ imageURL(this.props.lesson.image) } />
        </div>

        <div style={ contentStyle }>
          <div className="header">{ this.props.lesson.title }</div>
          { this.renderEditButton() }
        </div>
      </div>
    );
  }
});

export { LessonsListItem };
