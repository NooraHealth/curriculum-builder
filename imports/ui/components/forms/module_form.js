import React from 'react';
import Immutable from 'immutable';
import { Tracker } from 'meteor/tracker';

import path from 'path';

import { Progress } from '../semantic-ui/progress';

import { Module } from '../../../api/modules';

import { audioURL, supportedMIMEs as audioMIMEs } from '../../../uploads/audio';
import { imageURL, supportedMIMEs as imageMIMEs } from '../../../uploads/image';
import { videoURL, supportedMIMEs as videoMIMEs } from '../../../uploads/video';

// Note: Some of the input elements in the render<field name> methods have
// some seemingly redundant key attributes. They are necessary due to issues
// with some browsers (i.e., Safari). This issue has been reported to ReactJS:
// https://github.com/facebook/react/issues/7144

export const ModuleForm = React.createClass({
  propTypes: {
    module: React.PropTypes.instanceOf(Module).isRequired,
    onCancel: React.PropTypes.func.isRequired,
    onSave: React.PropTypes.func.isRequired
  },
  getInitialState() {
    const state = this._defaultPreviewURLs();
    state.type = this.props.module.type;
    return state;
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
      <div className="field">
        <label>Title</label>
        <input type="text"
               name="title"
               placeholder="New Title"
               defaultValue={ this.props.module.title }
               key="title"
               ref={ c => this.title = c } />
      </div>
    );
  },
  renderImage() {
    const renderImagePreview = () => {
      if (this.state.imagePreview) {
        return <img className="ui small image"
                    src={ this.state.imagePreview }
                    style={ {display: 'inline', marginRight: '10px'} } />
      }
    };

    return (
      <div className="field">
        <label>Image</label>

        <div>
          { renderImagePreview() }
          <input type="file"
                 accept={ imageMIMEs.join(',') }
                 key="image"
                 ref={ c => this.image = c }
                 onChange={ this.updatePreviewFactory('imagePreview') } />
        </div>
      </div>
    );
  },
  renderQuestion() {
    return (
      <div className="field">
        <label>Question</label>
        <input type="text"
               name="question"
               placeholder="To be, or not to be?"
               defaultValue={ this.props.module.question }
               key="question"
               ref={ c => this.question = c } />
      </div>
    );
  },
  renderOptions() {
    const defaultChecked = i => {
      const { options, correct_answer: correctAnswers } = this.props.module;

      return options && correctAnswers && correctAnswers.indexOf(options[i]) !== -1;
    };

    const renderImagePreview = i => {
        if (this.state.optionsImagesPreview && this.state.optionsImagesPreview.get(i)) {
          return (
            <img className="ui small image"
                 src={ this.state.optionsImagesPreview.get(i) }
                 style={ {display: 'inline', marginRight: '10px'} } />
          );
        }
    };

    const renderCheckboxes = () => {
      return [0, 1, 2, 3, 4, 5].map(i => {
        return (
          <div key={ i } className="field">
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
      if (this.state.correctAudioPreview) {
        return (
          <audio src={ this.state.correctAudioPreview }
                 controls="true"
                 style={ {marginRight: '10px'} } />
        );
      }
    };

    return (
      <div className="field">
        <label>Correct Audio</label>

        <div>
          { renderCorrectAudioPreview() }
          <input type="file"
                 accept={ audioMIMEs.join(',') }
                 key="correct_audio"
                 ref={ c => this.correct_audio = c }
                 onChange={ this.updatePreviewFactory('correctAudioPreview') } />
        </div>
      </div>
    );
  },
  renderVideo() {
    const renderVideoPreview = () => {
      if (this.state.videoPreview) {
        return (
          <video src={ this.state.videoPreview }
                 style={ {width: '150px', marginRight: '10px'} }
                 controls="true" />
        );
      }
    };

    return (
      <div className="field">
        <label>Video</label>

        <div>
          { renderVideoPreview() }
          <input type="file"
                 accept={ videoMIMEs.join(',') }
                 key="video"
                 ref={ c => this.video = c }
                 onChange={ this.updatePreviewFactory('videoPreview') }/>
        </div>
      </div>
    );
  },
  renderAudio() {
    const renderAudioPreview = () => {
      if (this.state.audioPreview) {
        return (
          <audio src={ this.state.audioPreview }
                 controls="true"
                 style={ {'marginRight': '10px'} } />
        );
      }
    };

    return (
      <div className="field">
        <label>Audio</label>

        <div>
          { renderAudioPreview() }
          <input type="file"
                 accept={ audioMIMEs.join(',') }
                 key="audio"
                 ref={ c => this.audio = c }
                 onChange={ this.updatePreviewFactory('audioPreview') } />
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
    let state;

    if (event.target.value === this.state.type) {
      state = {};
    } else {
      state = this._defaultPreviewURLs();
    }

    state.type = event.target.value;
    this.setState(state);
  },

  onSave(event) {
    event.preventDefault();

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

    const uploader = {
      correct_audio: 'audioUploads',
      audio: 'audioUploads',
      image: 'imageUploads',
      video: 'videoUploads'
    };

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
      this.props.onSave(module);
    })

  },
  onCancel(event) {
    event.preventDefault();
    this.props.onCancel();
  },

  updatePreviewFactory(property) {
    return event => {
      event.preventDefault();

      if (window.URL && event.target.files.length > 0) {
        const preview = window.URL.createObjectURL(event.target.files[0]);
        this.setState({
          [property]: preview
        });
      }
    };
  },
  updateOptionsImagesPreviewFactory(i) {
    return event => {
      let optionsImagesPreview = this.state.optionsImagesPreview || Immutable.List();

      if (window.URL && event.target.files.length > 0) {
        const preview = window.URL.createObjectURL(event.target.files[0]);
        optionsImagesPreview = optionsImagesPreview.set(i, preview);
        this.setState({
          optionsImagesPreview
        });
      }
    };
  },

  _defaultPreviewURLs() {
    const output = {
      imagePreview: this.props.module.image && imageURL(this.props.module.image),
      optionsImagesPreview: undefined,
      correctAudioPreview: this.props.module.correct_audio && audioURL(this.props.module.correct_audio),
      audioPreview: this.props.module.audio && audioURL(this.props.module.audio),
      videoPreview: this.props.module.video && videoURL(this.props.module.video)
    };

    if (this.props.module.type === 'MULTIPLE_CHOICE' && this.props.module.options && this.props.module.options.length === 6) {
      output.optionsImagesPreview = Immutable.List(this.props.module.options.map(imageURL));
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
