import React from 'react';

import { Curriculum } from '../../../api/curriculums';

import classnames from '../../../utilities/classnames';

const conditions = ["Cardiac Surgery", "Diabetes", "Neonatology"];
const languages  = ["Hindi", "English", "Kannada", "Tamil"];

export const CurriculumForm = React.createClass({
  propTypes: {
    curriculum: React.PropTypes.instanceOf(Curriculum).isRequired,
    onSave: React.PropTypes.func.isRequired
  },
  getInitialState() {
    return {
      titleError: false
    };
  },
  render() {
    const { title, condition, language } = this.props.curriculum;

    return (
      <form className="ui form">
        <div className={ classnames("field", {error: this.state.titleError})}>
          <label>Title</label>
          <input type="text"
                 name="title"
                 placeholder="New Title"
                 defaultValue={ title } ref={ c => this._title = c }
                 onChange={ this.onTitleChange } />
        </div>

        <div className="field">
          <label>Condition</label>
          <select className="ui fluid dropdown" defaultValue={ condition || conditions[0] } ref={ c => this._condition = c }>
            { conditions.map(condition => <option key={ condition } value={ condition }>{ condition }</option>) }
          </select>
        </div>

        <div className="field">
          <label>Language</label>
          <select className="ui fluid dropdown" defaultValue={ language || languages[0] } ref={ c => this._language = c }>
            { languages.map(language => <option key={ language } value={ language }>{ language }</option>) }
          </select>
        </div>

        <button className="ui primary button" onClick={ this.onSave }>Save</button>
      </form>
    );
  },
  onSave(event) {
    event.preventDefault();

    if (!this._title.value) {
      return this.setState({
        titleError: false
      });
    }

    const curriculum = this.props
                           .curriculum
                           .set('title', this._title.value)
                           .set('condition', this._condition.value)
                           .set('language', this._language.value);
    console.log(curriculum);

    this.props.onSave(curriculum);
  }
});
