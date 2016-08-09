import React from 'react';
import Immutable from 'immutable';
import { Tracker } from 'meteor/tracker';

import path from 'path';

import { Progress } from '../semantic-ui/progress';

import { Lesson } from '../../../api/lessons';
import { Module } from '../../../api/modules';

import { audioURL, supportedMIMEs as audioMIMEs } from '../../../uploads/audio';
import { imageURL, supportedMIMEs as imageMIMEs } from '../../../uploads/image';
import { videoURL, supportedMIMEs as videoMIMEs } from '../../../uploads/video';

import classnames from '../../../utilities/classnames';

import Errors from './module_form/errors';
import Previews from './module_form/previews';

const simpleProperties = {
  MULTIPLE_CHOICE: ['type', 'question'],
  SCENARIO: ['type', 'question'],
  BINARY: ['type', 'question'],
  VIDEO: ['type', 'title'],
  SLIDE: ['type', 'title']
};

const fileProperties = {
  MULTIPLE_CHOICE: ['correct_audio', 'audio'],
  SCENARIO: ['image', 'correct_audio', 'audio'],
  BINARY: ['image', 'correct_audio', 'audio'],
  VIDEO: ['video'],
  SLIDE: ['image', 'audio']
};

// Note: Some of the input elements in the render<field name> methods have
// some seemingly redundant key attributes. They are necessary due to issues
// with some browsers (i.e., Safari). This issue has been reported to ReactJS:
// https://github.com/facebook/react/issues/7144

export const ModuleForm = React.createClass({
  propTypes: {
    lesson: React.PropTypes.instanceOf(Lesson).isRequired,
    module: React.PropTypes.instanceOf(Module).isRequired,
    onCancel: React.PropTypes.func.isRequired,
    didSave: React.PropTypes.func
  },
  getDefaultProps() {
    return {
      didSave: () => {}
    };
  },
  getInitialState() {
    return {
      previews: this._defaultPreviewURLs(),
      type: this.props.module.type,
      errors: new Errors()
    };
  },
  componentWillMount() {
    this.correctOptions = [];
    this.options = [];
  },
  renderModuleType() {
    return (
      <div className="field">
        <label>Module Type</label>
        <select className="ui fluid dropdown"
                value={ this.state.type }
                onChange={ this.onTypeChange }
                ref={ c => this.type = c }>
          <option value="MULTIPLE_CHOICE">Multiple Choice</option>
          <option value="SCENARIO">Scenario</option>
          <option value="BINARY">Binary</option>
          <option value="VIDEO">Video</option>
          <option value="SLIDE">Slide</option>
        </select>
      </div>
    );
  },
  renderTitle() {
    return (
      <div className={ classnames('field', {error: this.state.errors.title}) }>
        <label>Title</label>
        <input type="text"
               name="title"
               placeholder="New Title"
               defaultValue={ this.props.module.title }
               key="title"
               ref={ c => this.title = c }
               onChange={ this.clearError.bind(this, 'title') }/>
      </div>
    );
  },
  renderImage() {
    const renderImagePreview = () => {
      if (this.state.previews.image) {
        return <img className="ui small image"
                    src={ this.state.previews.image }
                    style={ {display: 'inline', marginRight: '10px'} } />
      }
    };

    return (
      <div className={ classnames('field', {error: this.state.errors.image}) }>
        <label>Image</label>

        <div>
          { renderImagePreview() }
          <input type="file"
                 accept={ imageMIMEs.join(',') }
                 key="image"
                 ref={ c => this.image = c }
                 onChange={ this.updatePreviewFactory('image') } />
        </div>
      </div>
    );
  },
  renderQuestion() {
    return (
      <div className={ classnames('field', {error: this.state.errors.question}) }>
        <label>Question</label>
        <input type="text"
               name="question"
               placeholder="To be, or not to be?"
               defaultValue={ this.props.module.question }
               key="question"
               ref={ c => this.question = c }
               onChange={ this.clearError.bind(this, 'question') }/>
      </div>
    );
  },
  renderOptions() {
    const defaultChecked = i => {
      const { options, correct_answer: correctAnswers } = this.props.module;

      return options && correctAnswers && correctAnswers.indexOf(options[i]) !== -1;
    };

    const renderImagePreview = i => {
        if (this.state.previews.options_images.get(i)) {
          return (
            <img className="ui small image"
                 src={ this.state.previews.options_images.get(i) }
                 style={ {display: 'inline', marginRight: '10px'} } />
          );
        }
    };

    const renderCheckboxes = () => {
      return [0, 1, 2, 3, 4, 5].map(i => {
        return (
          <div key={ i } className={ classnames('field', {error: this.state.errors.options.get(i)}) }>
            <div className="ui checkbox">
              <input type="checkbox"
                     defaultChecked={ defaultChecked(i) }
                     ref={ c => this.correctOptions[i] = c } />
              <label>
                { renderImagePreview(i) }
                <input type="file"
                       accept={ imageMIMEs.join(',') }
                       ref={ c => this.options[i] = c }
                       onChange={ this.updateOptionsImagesPreviewFactory(i) }/>
              </label>
            </div>
          </div>
        );
      });
    };

    return (
      <div className="grouped fields">
        <label>Options</label>

        { renderCheckboxes() }
      </div>
    );
  },
  renderCorrectBinaryAnswer() {
    return (
      <div className="field">
        <label>Correct Answer</label>
        <select className="ui fluid dropdown"
                defaultValue={ this.props.module.correct_answer && this.props.module.correct_answer[0] }
                ref={ c => this.correct_answer = c }>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </div>
    );
  },
  renderCorrectScenarioAnswer() {
    return (
      <div className="field">
        <label>Correct Answer</label>
        <select className="ui fluid dropdown"
                defaultValue={ this.props.module.correct_answer && this.props.module.correct_answer[0] }
                ref={ c => this.correct_answer = c }>
          <option value="Normal">Normal</option>
          <option value="CallDoc">Call Doctor</option>
          <option value="Call911">Call 911</option>
        </select>
      </div>
    );
  },
  renderCorrectAudio() {
    const renderCorrectAudioPreview = () => {
      if (this.state.previews.correct_audio) {
        return (
          <audio src={ this.state.previews.correct_audio }
                 controls="true"
                 style={ {marginRight: '10px'} } />
        );
      }
    };

    return (
      <div className={ classnames('field', {error: this.state.errors.correct_audio}) }>
        <label>Correct Audio</label>

        <div>
          { renderCorrectAudioPreview() }
          <input type="file"
                 accept={ audioMIMEs.join(',') }
                 key="correct_audio"
                 ref={ c => this.correct_audio = c }
                 onChange={ this.updatePreviewFactory('correct_audio') } />
        </div>
      </div>
    );
  },
  renderVideo() {
    const renderVideoPreview = () => {
      if (this.state.previews.video) {
        return (
          <video src={ this.state.previews.video }
                 style={ {width: '150px', marginRight: '10px'} }
                 controls="true" />
        );
      }
    };

    return (
      <div className={ classnames('field', {error: this.state.errors.video}) }>
        <label>Video</label>

        <div>
          { renderVideoPreview() }
          <input type="file"
                 accept={ videoMIMEs.join(',') }
                 key="video"
                 ref={ c => this.video = c }
                 onChange={ this.updatePreviewFactory('video') }/>
        </div>
      </div>
    );
  },
  renderAudio() {
    const renderAudioPreview = () => {
      if (this.state.previews.audio) {
        return (
          <audio src={ this.state.previews.audio }
                 controls="true"
                 style={ {'marginRight': '10px'} } />
        );
      }
    };

    return (
      <div className={ classnames('field', {error: this.state.errors.audio}) }>
        <label>Audio</label>

        <div>
          { renderAudioPreview() }
          <input type="file"
                 accept={ audioMIMEs.join(',') }
                 key="audio"
                 ref={ c => this.audio = c }
                 onChange={ this.updatePreviewFactory('audio') } />
        </div>
      </div>
    );
  },

  renderProgressBar() {
    if (this.state.fileUploadProgress && this.state.fileUploadProgress.size > 0) {
      const totalProgress = this.state.fileUploadProgress.reduce((a, b) => a + b);
      const progress = totalProgress / this.state.fileUploadProgress.size;
      return <Progress progress={ progress } label="Uploading Files" />
    } else {
      return false;
    }
  },

  renderControlButtons() {
    return (
      <div>

        { this.renderProgressBar() }

        <button className="ui primary button" onClick={ this.onSave }>Save</button>
        <button className="ui button" onClick={ this.onCancel }>Cancel</button>
      </div>
    );
  },

  renderMultipleChoiceForm() {
    return (
      <form className="ui form">
        { this.renderModuleType() }
        { this.renderQuestion() }
        { this.renderOptions() }
        { this.renderCorrectAudio() }
        { this.renderAudio() }
        { this.renderControlButtons() }
      </form>
    );
  },

  renderScenarioForm() {
    return (
      <form className="ui form">
        { this.renderModuleType() }
        { this.renderImage() }
        { this.renderQuestion() }
        { this.renderCorrectScenarioAnswer() }
        { this.renderCorrectAudio() }
        { this.renderAudio() }
        { this.renderControlButtons() }
      </form>
    );
  },

  renderBinaryForm() {
    return (
      <form className="ui form">
        { this.renderModuleType() }
        { this.renderImage() }
        { this.renderQuestion() }
        { this.renderCorrectBinaryAnswer() }
        { this.renderCorrectAudio() }
        { this.renderAudio() }
        { this.renderControlButtons() }
      </form>
    );
  },

  renderVideoForm() {
    return (
      <form className="ui form">
        { this.renderModuleType() }
        { this.renderTitle() }
        { this.renderVideo() }
        { this.renderControlButtons() }
      </form>
    );
  },

  renderSlideForm() {
    return (
      <form className="ui form">
        { this.renderModuleType() }
        { this.renderTitle() }
        { this.renderImage() }
        { this.renderAudio() }
        { this.renderControlButtons() }
      </form>
    );
  },

  render() {
    const { type } = this.state;

    if (type === 'MULTIPLE_CHOICE') {
      return this.renderMultipleChoiceForm();
    } else if (type === 'SCENARIO') {
      return this.renderScenarioForm();
    } else if (type === 'BINARY') {
      return this.renderBinaryForm();
    } else if (type === 'VIDEO') {
      return this.renderVideoForm();
    } else if (type === 'SLIDE') {
      return this.renderSlideForm();
    }
  },

  onTypeChange(event) {
    let state = {
      type: event.target.value
    };

    if (event.target.value !== this.state.type) {
      state.errors = new Errors();
      state.previews = this._defaultPreviewURLs();
    }

    // Reset the input fields if necessary
    fileProperties[event.target.value].forEach(property => {
      if (fileProperties[this.state.type].indexOf(property) !== -1) {
        this[property].value = "";
      }
    });

    this.setState(state);
  },

  currentFormErrors() {
    let errors = new Errors();

    simpleProperties[this.state.type].forEach(property => {
      if (!this[property].value) {
        errors = errors.set(property, true);
      }
    });

    fileProperties[this.state.type].forEach(property => {
      if (!this[property].value && !this.props.module.get(property)) {
        errors = errors.set(property, true);
      }
    });

    if (this.state.type === 'MULTIPLE_CHOICE') {
      this.options.forEach((c, i) => {
        if (c.files.length === 0 && !((this.props.module.options || [])[i])) {
          errors = errors.setIn(['options', i], true);
        }
      });
    }

    return errors;
  },

  onSave(event) {
    event.preventDefault();

    const uploader = {
      correct_audio: 'audioUploads',
      audio: 'audioUploads',
      image: 'imageUploads',
      video: 'videoUploads'
    };

    const errors = this.currentFormErrors();

    if (errors.any()) {
      return this.setState({
        errors
      });
    }

    this.setState({
      fileUploadProgress: Immutable.Map()
    });

    let module = this.props.module;

    simpleProperties[this.state.type].forEach(property => {
      module = module.set(property, this[property].value);
    });

    let uploadPromises = fileProperties[this.state.type].map(property => {
      if (this[property].files.length > 0) {
        const promise = this._uploadFile(this[property].files[0], new Slingshot.Upload(uploader[property]), property);

        promise.then(filename => {
          module = module.set(property, filename);
        }, error => {
          console.error(error);
        });

        return promise;
      } else {
        const filename = this.props.module[property];
        module = module.set(property, filename);
        return Promise.resolve(filename);
      }
    });

    if (this.state.type === 'MULTIPLE_CHOICE') {
      // Upload all choices
      const promises = this.options.map((c, i) => {
        if (c.files.length > 0) {
          return this._uploadFile(c.files[0], new Slingshot.Upload('imageUploads'));
        } else {
          return this.props.module.options[i];
        }
      });

      Promise.all(promises).then(filenames => {
        module = module.set('options', filenames);

        // set correct answer
        const choices = this.correctOptions.map(c => c.checked);
        const correctAnswers = filenames.filter((_, i) => choices[i]);
        module = module.set('correct_answer', correctAnswers);
      });

      uploadPromises = uploadPromises.concat(promises);
    } else if (this.state.type === 'SCENARIO') {
      module = module.set('options', ['CallDoc', 'Call911', 'Normal']);
      module = module.set('correct_answer', [this.correct_answer.value]);
    } else if (this.state.type === 'BINARY') {
      module = module.set('options', ['Yes', 'No']);
      module = module.set('correct_answer', [this.correct_answer.value]);
    }

    Promise.all(uploadPromises).then(() => {
      const promise = module.save().then(module => this.props.lesson.addModule(module));

      this.props.didSave(promise);
    });

  },
  onCancel(event) {
    event.preventDefault();
    this.props.onCancel();
  },

  clearError(property) {
    this.setState({
      errors: this.state.errors.set(property, false)
    });
  },
  updatePreviewFactory(property) {
    return event => {
      event.preventDefault();

      if (window.URL && event.target.files.length > 0) {
        const preview = window.URL.createObjectURL(event.target.files[0]);
        this.setState({
          errors: this.state.errors.set(property, false),
          previews: this.state.previews.set(property, preview)
        });
      }
    };
  },
  updateOptionsImagesPreviewFactory(i) {
    return event => {
      let optionsImagesPreview = this.state.optionsImagesPreview || Immutable.List();

      if (window.URL && event.target.files.length > 0) {
        const preview = window.URL.createObjectURL(event.target.files[0]);
        this.setState({
          errors: this.state.errors.setIn(['options', i], false),
          previews: this.state.previews.setIn(['options_images', i], preview)
        });
      }
    };
  },

  _defaultPreviewURLs() {
    let output = new Previews({
      image: this.props.module.image && imageURL(this.props.module.image),
      correct_audio: this.props.module.correct_audio && audioURL(this.props.module.correct_audio),
      audio: this.props.module.audio && audioURL(this.props.module.audio),
      video: this.props.module.video && videoURL(this.props.module.video)
    });

    if (this.props.module.type === 'MULTIPLE_CHOICE' && this.props.module.options && this.props.module.options.length === 6) {
      output = output.set('options_images', Immutable.List(this.props.module.options.map(imageURL)));
    }

    return output;
  },

  _uploadFile(file, Uploader, label = (() => (Math.random() + "").substring(2))()) {
    const promise = new Promise((resolve, reject) => {
      Uploader.send(file, (error, url) => {
        if (error) {
          reject(error);
        } else {
          resolve(path.basename(url));
        }
      });

      Tracker.autorun(c => {
        const progress = Uploader.progress();

        const {fileUploadProgress: progressMap = Immutable.Map()} = this.state;

        this.setState({
          fileUploadProgress: progressMap.set(label, progress || 0) // progress || 0 as progress can be NaN.
        });

        if (progress === 1) {
          c.stop();
        }
      });
    });

    return promise;
  }
});
