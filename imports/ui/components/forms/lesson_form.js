import React from 'react';

export const LessonForm = React.createClass({
  propTypes: {
    lesson: React.PropTypes.object,
    onSubmit: React.PropTypes.func.isRequired
  },
  getInitialState() {
    if (this.props.lesson) {
      return {
        id: this.props.lesson.id,
        title: this.props.lesson.title
        // TODO deal with image
      };
    } else {
      return {
        title: ""
      }
    }
  },
  render() {
    return (
      <form className="ui form">
        <div className="field">
          <label>Title</label>
          <input type="text" value={ this.state.title } onChange={ this.onTitleChange } />
        </div>

        <div className="field">
          <label>Image</label>
          <input type="file" onChange={ this.onImageChange } />
        </div>

        <button className="ui primary button" onClick={ this.onSubmit }>Save</button>
      </form>
    );
  },
  onTitleChange(event) {
    this.setState({
      title: event.target.value
    });
  },
  onImageChange(event) {
    this.setState({
      image: event.target.files[0]
    });
  },
  onSubmit(event) {
    event.preventDefault();

    this.props.onSubmit(this.state);
  }
});
