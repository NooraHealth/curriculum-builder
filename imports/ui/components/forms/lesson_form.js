import React from 'react';
import { Tracker } from 'meteor/tracker';
import { Slingshot } from 'meteor/edgee:slingshot';
import path from 'path';

import { Progress } from '../semantic-ui/progress';

import { imageURL } from '../../../uploads/image';

export const LessonForm = React.createClass({
  propTypes: {
    lesson: React.PropTypes.object,
    onSave: React.PropTypes.func.isRequired,
    onCancel: React.PropTypes.func.isRequired
  },
  getInitialState() {
    return {
      lesson: this.props.lesson,
      imagePreview: this.props.lesson.image && imageURL(this.props.lesson.image)
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
        <div className="field">
          <label>Title</label>
          <input type="text" value={ this.state.lesson.title } onChange={ this.onTitleChange } />
        </div>

        <div className="field">
          <label>Image</label>
          <div>
            { renderImagePreview() }
            <input type="file" ref={ c => this._image = c } onChange={ this.onImageChange } />
          </div>
        </div>

        <button className="ui primary button" onClick={ this.onSave }>Save</button>
        <button className="ui button" onClick={ this.props.onCancel }>Cancel</button>
      </form>
    );
  },
  onTitleChange(event) {
    const lesson = this.state.lesson.set('title', event.target.value);
    this.setState({lesson});
  },
  onImageChange(event) {
    if (window.URL && event.target.files.length > 0) {
      const imagePreview = window.URL.createObjectURL(event.target.files[0]);
      this.setState({imagePreview});
    }
  },
  onSave(event) {
    event.preventDefault();

    if (this._image.files.length === 0) {
      return this.props.onSave(this.state.lesson);
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
        this.props.onSave(lesson);
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
