import React from 'react';

import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import { Lessons, Modules } from 'meteor/noorahealth:mongo-schemas';

import Immutable from 'immutable';

import { ModuleForm } from '../components/forms/module_form';

import { ModulesListItem } from './lesson_page/modules_list_item';

import { Module } from '../../api/modules';
import '../../api/lessons';

import { imageURL } from '../../uploads/image';

const LessonPage = React.createClass({
  getInitialState() {
    return {
      modules: Immutable.List(),
      showNewModuleForm: false
    };
  },
  renderLessonInfo() {
    return (
      <h2 className="ui icon header" style={ {width: '100%'} }>
        <img className="ui large image"
             src={ imageURL(this.props.lesson.image) } />
        <div className="content">
          { this.props.lesson.title }
        </div>
      </h2>
    );
  },
  renderModule(module) {
    return (
      <div className="ui segment" key={ module._id }>
        <ModulesListItem onSave={ this.saveModule } module={ module } />
      </div>
    );
  },
  renderModules() {
    if (this.props.modules.length > 0) {
      return this.props.modules.map(m => <ModulesListItem key={ m._id } onSave={ this.saveModule } module={ m } />);
    } else {
      return false;
    }
  },
  renderNewModuleForm() {
    if (this.state.showNewModuleForm) {
      return (
        <div className="ui segment">
          <ModuleForm onSave={ this.saveModule }
                      onCancel={ this.hideNewModuleForm }
                      module={ new Module() } />
        </div>
      );
    } else {
      return (
        <button className="ui primary button"
                onClick={ this.showNewModuleForm }>
          New Module
        </button>
      );
    }
  },
  render() {
    return (
      <div>
        { this.renderLessonInfo() }

        <div className="ui divider" />

        { this.renderModules() }

        { this.renderNewModuleForm() }
      </div>
    );
  },

  saveModule(module) {
    Meteor.call('modules.upsert', module.toJS(), (error, results) => {
      if (error) {
        console.error(error);
      } else {
        if ("insertedId" in results) {
          Meteor.call('lessons.addModule', this.props.lesson._id, results.insertedId);
        }
      }
    });
  },
  showNewModuleForm(event) {
    event.preventDefault();

    this.setState({
      showNewModuleForm: true
    });
  },
  hideNewModuleForm(event) {
    this.setState({
      showNewModuleForm: false
    });
  }
});

const LessonPageContainer = createContainer(({ _id }) => {
  const lessonsHandle = Meteor.subscribe('lesson', _id);
  const modulesHandle = Meteor.subscribe('modules.all');

  const loading = !lessonsHandle.ready() || !modulesHandle.ready();

  const lesson = Lessons.findOne({ _id });

  const module_ids = (lesson ? lesson.modules : []);

  const modules = Modules.find({ _id: { $in: module_ids }}).fetch().map(m => new Module(m));

  return {
    loading,
    lesson,
    modules
  };
}, ({ loading, lesson, modules }) => {
  return loading ? <div>Loading...</div> : <LessonPage lesson={ lesson } modules={ modules } />;
});

export default LessonPageContainer;
