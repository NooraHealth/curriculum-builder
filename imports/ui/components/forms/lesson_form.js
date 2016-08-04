import React from 'react';
import { Tracker } from 'meteor/tracker';
import { Slingshot } from 'meteor/edgee:slingshot';
import path from 'path';

import { Progress } from '../semantic-ui/progress';

import { imageURL, supportedMIMEs as imageMIMEs } from '../../../uploads/image';

import classnames from '../../../utilities/classnames';
import '../../../api/lessons';

export const LessonForm = React.createClass({
  propTypes: {
    lesson: React.PropTypes.object,
    onSave: React.PropTypes.func.isRequired,
    onCancel: React.PropTypes.func.isRequired
  },
  getInitialState() {
    return {
      lesson: this.props.lesson,
      imagePreview: this.props.lesson.image && imageURL(this.props.lesson.image),
      titleError: false,
      imageError: false
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
    const renderImagePreview = () => {
      if (this.state.imagePreview) {
        return <img className="ui small image"
                    src={ this.state.imagePreview }
                    style={ {display: 'inline', marginRight: '10px'} } />
      }
    };

    return (
      <form className="ui form">
        <div className={ classnames("field", {error: this.state.titleError}) }>
          <label>Title</label>
          <input type="text" value={ this.state.lesson.title } onChange={ this.onTitleChange } />
        </div>

        <div className="inline fields">
          <label>Type</label>

          <div className="field">
            <div className="ui radio checkbox">
              <input type="radio"
                     name="type"
                     value="beginner"
                     checked={ this.state.lesson.isBeginner() }
                     onChange={ this.onTypeChange } />
              <label>Beginner</label>
            </div>
          </div>

          <div className="field">
            <div className="ui radio checkbox">
              <input type="radio"
                     name="type"
                     value="intermediate"
                     checked={ this.state.lesson.isIntermediate() }
                     onChange={ this.onTypeChange } />
              <label>Intermediate</label>
            </div>
          </div>

          <div className="field">
            <div className="ui radio checkbox">
              <input type="radio"
                     name="type"
                     value="advanced"
                     checked={ this.state.lesson.isAdvanced() }
                     onChange={ this.onTypeChange } />
              <label>Advanced</label>
            </div>
          </div>
        </div>

        <div className={ classnames("field", {error: this.state.imageError}) }>
          <label>Image</label>
          <div>
            { renderImagePreview() }
            <input type="file"
                   accept={ imageMIMEs.join(',') }
                   ref={ c => this._image = c }
                   onChange={ this.onImageChange } />
          </div>
        </div>

        { this.renderProgressBar() }

        <button className="ui primary button" onClick={ this.onSave }>Save</button>
        <button className="ui button" onClick={ this.props.onCancel }>Cancel</button>
      </form>
    );
  },
  onTitleChange(event) {
    const lesson = this.state.lesson.set('title', event.target.value);
    this.setState({
      lesson,
      titleError: false
    });
  },
  onTypeChange(event) {
    this.setState({
      lesson: this.state.lesson.set('type', event.target.value)
    });
  },
  onImageChange(event) {
    if (window.URL && event.target.files.length > 0) {
      const imagePreview = window.URL.createObjectURL(event.target.files[0]);
      this.setState({
        imagePreview,
        imageError: false
      });
    }
  },
  // Performs form validation and sets state.
  // Returns true iff the form is valid.
  validate() {
    const titleError = !this.state.lesson.title;
    const imageError = this._image.files.length === 0 && !this.state.lesson.image;

    this.setState({
      titleError,
      imageError
    });

    return !(titleError || imageError);
  },
  // Uploads image if necessary.
  // Returns a promise. The resolved value is the new lesson.
  uploadImage() {
    return new Promise((resolve, reject) => {
      if (this._image.files.length === 0) {
        resolve(this.state.lesson);
      }

      const image = this._image.files[0];

      const ImageUploader = new Slingshot.Upload('imageUploads');

      ImageUploader.send(image, (error, url) => {
        if (error) {
          reject(error);
        } else {
          const filename = path.basename(url);
          const lesson = this.state.lesson.set('image', filename);
          this.setState({lesson});
          resolve(lesson);
        }
      });

      Tracker.autorun(c => {
        const progress = ImageUploader.progress() || 0;

        this.setState({progress});

        if (progress === 1) {
          c.stop();
        }
      });
    });
  },
  onSave(event) {
    event.preventDefault();

    if (!this.validate()) {
      return;
    }

    const promise = this.uploadImage().then(lesson => lesson.save());
    this.props.onSave(promise);
  }
});
