import React from 'react';

import { ModuleForm } from '../../components/forms/module_form';

import { MultipleChoiceModule } from './multiple_choice_module';
import { ScenarioModule } from './scenario_module';
import { BinaryModule } from './binary_module';
import { VideoModule } from './video_module';
import { SlideModule } from './slide_module';

import { Module } from '../../../api/modules';

import { audioURL } from '../../../uploads/audio';
import { imageURL } from '../../../uploads/image';

export const ModulesListItem = React.createClass({
  propTypes: {
    edit: React.PropTypes.bool,
    module: React.PropTypes.instanceOf(Module).isRequired,
    onSave: React.PropTypes.func.isRequired
  },
  getInitialState() {
    return {
      edit: this.props.edit,
      expanded: false
    };
  },
  getDefaultProps() {
    return {
      edit: false
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

    return (
      <div className="title" onClick={ this.toggleExpand } style={ {cursor: 'pointer'} }>
        <b>{ type }</b> - { title }
      </div>
    );
  },
  renderForm() {
    return (
      <div style={ {marginTop: '10px'} }>
        <ModuleForm module={ this.props.module }
                    onSave={ this.onSave }
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

  onSave(module) {
    this.props.onSave(module);
    this.disableEdit();
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
