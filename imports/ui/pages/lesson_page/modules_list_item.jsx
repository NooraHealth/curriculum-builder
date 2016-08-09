import React from 'react';

import { ModuleForm } from '../../components/forms/module_form';

import { MultipleChoiceModule } from './multiple_choice_module';
import { ScenarioModule } from './scenario_module';
import { BinaryModule } from './binary_module';
import { VideoModule } from './video_module';
import { SlideModule } from './slide_module';

import { Lesson } from '../../../api/lessons';
import { Module } from '../../../api/modules';

import { audioURL } from '../../../uploads/audio';
import { imageURL } from '../../../uploads/image';

export const ModulesListItem = React.createClass({
  propTypes: {
    lesson: React.PropTypes.instanceOf(Lesson).isRequired,
    module: React.PropTypes.instanceOf(Module).isRequired
  },
  getInitialState() {
    return {
      edit: false,
      expanded: false
    };
  },
  renderHeader() {
    const humanFriendlyType = {
      'MULTIPLE_CHOICE': 'Multiple Choice',
      'SCENARIO': 'Scenario',
      'BINARY': 'Binary',
      'VIDEO': 'Video',
      'SLIDE': 'Slide'
    };

    const type  = humanFriendlyType[this.props.module.type];
    const title = this.props.module.title || this.props.module.question;

    const containerStyle = {
      display: 'flex',
      alignItems: 'baseline'
    };

    const titleStyle = {
      cursor: 'pointer',
      flexGrow: 1
    };

    return (
      <div className="title" style={ containerStyle }>
        <i className="grabber move icon" />
        <span style={ titleStyle } onClick={ this.toggleExpand }>
          <b>{ type }</b> - { title }
          { !this.props.module.is_active && " (Inactive)" }
        </span>
        <button className="negative ui icon button" onClick={ this.onRemove }>
          <i className="trash outline icon" />
        </button>
      </div>
    );
  },
  renderForm() {
    return (
      <div style={ {marginTop: '10px'} }>
        <ModuleForm lesson={ this.props.lesson }
                    module={ this.props.module }
                    didSave={ this.didSave }
                    onCancel={ this.disableEdit } />
      </div>
    );
  },
  renderModule() {
    const components = {
      MULTIPLE_CHOICE: MultipleChoiceModule,
      SCENARIO: ScenarioModule,
      BINARY: BinaryModule,
      VIDEO: VideoModule,
      SLIDE: SlideModule
    };

    const Module = components[this.props.module.type];

    return (
      <div style={ {marginTop: '10px'} }>
        <Module module={ this.props.module } />
        <button className="ui button" onClick={ this.enableEdit }>Edit</button>
      </div>
    );
  },
  renderContent() {
    if (this.state.expanded) {
      if (this.state.edit) {
        return this.renderForm();
      } else {
        return this.renderModule();
      }
    }
  },
  render() {
    return (
      <div className="ui segment" data-id={ this.props.module._id }>
        { this.renderHeader() }
        { this.renderContent() }
      </div>
    );
  },

  didSave(promise) {
    promise.then(() => this.disableEdit(), error => {
      console.error(error);
    });
  },
  onRemove(event) {
    event.preventDefault();

    const title = this.props.module.title || this.props.module.question;

    if (confirm(`Are you sure you want to remove ${title}?`)) {
      this.props.module.remove().then(module => this.props.lesson.removeModule(module));
    }
  },
  toggleExpand(event) {
    event.preventDefault();

    this.setState({
      expanded: !this.state.expanded
    });
  },
  enableEdit(event) {
    event.preventDefault();

    this.setState({
      edit: true
    });
  },
  disableEdit() {
    this.setState({
      edit: false
    });
  }
});
