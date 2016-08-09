import React from 'react';

import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import { Curriculums, Lessons, Modules } from 'meteor/noorahealth:mongo-schemas';

import Immutable from 'immutable';

import Sortable from 'react-sortablejs';

import { ModuleForm } from '../components/forms/module_form';

import { ModulesListItem } from './lesson_page/modules_list_item';

import { Curriculum } from '../../api/curriculums';
import { Module } from '../../api/modules';
import { Lesson } from '../../api/lessons';

import { imageURL } from '../../uploads/image';

const LessonPage = React.createClass({
  propTypes: {
    curriculum: React.PropTypes.instanceOf(Curriculum).isRequired,
    lesson: React.PropTypes.instanceOf(Lesson).isRequired,
    modules: React.PropTypes.instanceOf(Immutable.List).isRequired
  },
  getInitialState() {
    return {
      showNewModuleForm: false
    };
  },
  renderMenu() {
    return (
      <div className="ui text menu">
        <div className="item">
          <a href={ `/curriculums/${ this.props.curriculum._id }` }>
            <i className="chevron left icon"></i>
            Back to { this.props.curriculum.title }
          </a>
        </div>

        <div className="ui right item">
          <a href="#" onClick={ e => e.preventDefault() || AccountsTemplates.logout() }>
            Sign Out
          </a>
        </div>
      </div>
    );
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
  renderModules() {
    if (this.props.modules.size > 0) {
      const items = this.props.modules.map(m => {
        return (
          <ModulesListItem key={ m._id }
                           lesson={ this.props.lesson }
                           module={ m } />
        );
      });

      return (
        <Sortable onChange={ this.onChangeOrder } options={ {handle: ".grabber"} }>
          { items }
        </Sortable>
      );
    } else {
      return false;
    }
  },
  renderNewModuleForm() {
    if (this.state.showNewModuleForm) {
      return (
        <div className="ui segment">
          <ModuleForm didSave={ this.didCreateModule }
                      onCancel={ this.hideNewModuleForm }
                      lesson={ this.props.lesson }
                      module={ new Module() } />
        </div>
      );
    } else {
      const style = this.props.modules.size ? {marginTop: '1rem'} : {};
      return (
        <button className="green ui labeled icon button"
                onClick={ this.showNewModuleForm }
                style={ style }>
          <i className="plus icon" />
          New Module
        </button>
      );
    }
  },
  render() {
    return (
      <div>
        { this.renderMenu() }

        { this.renderLessonInfo() }

        <div className="ui divider" />

        { this.renderModules() }

        { this.renderNewModuleForm() }
      </div>
    );
  },

  didCreateModule(promise) {
    promise.then(() => {
      this.setState({
        showNewModuleForm: false
      });
    }, error => {
      console.error(error);
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
  },
  onChangeOrder(order) {
    const modules = Immutable.List(order).map(_id => this.props.modules.find(x => x._id === _id));

    this.setState({
      modules,
    });

    this.persistModulesOrder();
  },
  persistModulesOrder() {
    const modules = this.state.modules || this.props.modules;
    this.props.lesson.setModules(modules).then(() => {
      this.setState({
        modules: undefined
      });
    });
  }
});

const LessonPageContainer = createContainer(({ curriculum_id, lesson_id }) => {
  const curriculumsHandle = Meteor.subscribe('curriculum', curriculum_id);
  const lessonsHandle = Meteor.subscribe('lesson', lesson_id);
  const modulesHandle = Meteor.subscribe('modules.all');

  const loading = !curriculumsHandle.ready() || !lessonsHandle.ready() || !modulesHandle.ready();

  const curriculum = new Curriculum(Curriculums.findOne({ _id: curriculum_id }));

  const lesson = new Lesson(Lessons.findOne({ _id: lesson_id }));

  const module_ids = lesson.modules.toJS();

  const modules = Modules.find({ _id: { $in: module_ids }})
                         .fetch()
                         .map(m => new Module(m))
                         .sort((a, b) => module_ids.indexOf(a._id) - module_ids.indexOf(b._id));

  return {
    loading,
    curriculum,
    lesson,
    modules: Immutable.List(modules)
  };
}, ({ loading, curriculum, lesson, modules }) => {
  return loading ? <div>Loading...</div> : <LessonPage curriculum={ curriculum } lesson={ lesson } modules={ modules } />;
});

export default LessonPageContainer;
