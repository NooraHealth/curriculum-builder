import React from 'react';
import { Tracker } from 'meteor/tracker';
import { Slingshot } from 'meteor/edgee:slingshot';
import path from 'path';

import { Progress } from '../semantic-ui/progress';

import '../../../uploads/image';

const ImageUploader = new Slingshot.Upload('imageUploads');

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
  renderProgressBar() {
    if ("progress" in this.state) {
      return <Progress progress={ this.state.progress } label="Uploading Image" />;
    } else {
      return false;
    }
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
          <input type="file" ref={ c => this._image = c } />
        </div>

        { this.renderProgressBar() }

        <button className="ui primary button" onClick={ this.onSubmit }>Save</button>
      </form>
    );
  },
  onTitleChange(event) {
    const lesson = this.state.lesson.set('title', event.target.value);
    this.setState({lesson});
  },
  onSubmit(event) {
    event.preventDefault();

    const image = this._image.files[0]; // TODO validation

    ImageUploader.send(image, (error, url) => {
      if (error) {
        console.error(error);
      } else {
        const filename = path.basename(url);
        const lesson = this.state.lesson.set('image', filename);
        this.setState({lesson});
        this.props.onSubmit(lesson);
      }
    });

    Tracker.autorun(c => {
      const progress = ImageUploader.progress();

      this.setState({progress});

      if (progress === 1) {
        c.stop();
      }
    });
  }
});
