import React from 'react';
import { Tracker } from 'meteor/tracker';
import { Slingshot } from 'meteor/edgee:slingshot';
import path from 'path';

import { Progress } from '../semantic-ui/progress';

import { imageURL } from '../../../uploads/image';

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
  renderImage(url, label) {
    if (url) {
      return (
        <div style={ {flexBasis: '50%', textAlign: 'center'} }>
          { label }
          <img src={ url } className="ui fluid image" />
        </div>
      );
    } else {
      return false;
    }
  },
  renderImagePreview() {
    const existingImageURL = this.state.lesson.image && imageURL(this.state.lesson.image);
    return (
      <div style={ {display: 'flex', justifyContent: 'center'} }>
        { this.renderImage(existingImageURL, 'Existing image:') }
        { this.renderImage(this.state.previewURL, 'New image:') }
      </div>
    );
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
          <input type="file" ref={ c => this._image = c } onChange={ this.onImageChange } />
        </div>

        { this.renderImagePreview() }
        { this.renderProgressBar() }

        <button className="ui primary button" onClick={ this.onSubmit }>Save</button>
      </form>
    );
  },
  onTitleChange(event) {
    const lesson = this.state.lesson.set('title', event.target.value);
    this.setState({lesson});
  },
  onImageChange(event) {
    if (window.URL && event.target.files.length > 0) {
      const previewURL = window.URL.createObjectURL(event.target.files[0]);
      this.setState({previewURL});
    }
  },
  onSubmit(event) {
    event.preventDefault();

    if (this._image.files.length === 0) {
      return this.props.onSubmit(this.state.lesson);
    }

    const image = this._image.files[0];

    const ImageUploader = new Slingshot.Upload('imageUploads');

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
