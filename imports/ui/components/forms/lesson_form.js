import React from 'react';

export const LessonForm = React.createClass({
  propTypes: {
    lesson: React.PropTypes.object,
    onSubmit: React.PropTypes.func.isRequired
  },
  getInitialState() {
    return {
      lesson: this.props.lesson
    };
  },
  render() {
    return (
      <form className="ui form">
        <div className="field">
          <label>Title</label>
          <input type="text" value={ this.state.lesson.title } onChange={ this.onTitleChange } />
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
    const lesson = this.state.lesson.set('title', event.target.value);
    this.setState({lesson});
  },
  onImageChange(event) {
    // Use ref and upload on submit
  },
  onSubmit(event) {
    event.preventDefault();

    // 1. Upload image
    // 2. Set update URL
    // 3. Callback
    this.props.onSubmit(this.state.lesson);
  }
});
