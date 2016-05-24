/****
 * BuildCurriculumPage
 *
 * Keeps track of the state of the curriculum and
 * any updates made through the child components.
 * Uploads files and saves documents to the MongoDB
 *****/
import React from 'react';

const conditions = ["Cardiac Surgery", "Diabetes", "Neonatology"];
const languages  = ["Hindi", "English", "Kannada", "Tamil"];

const BuildCurriculumPage = React.createClass({
  getInitialState() {
    return {
      title: "",
      condition: conditions[0],
      language: languages[0]
    };
  },
  renderHeader() {
    return (
      <div>
        <div className="field">
          <label>Title</label>
          <input type="text" name="title" placeholder="New Title" value={ this.state.title } onChange={ this.onTitleChange } />
        </div>

        <div className="field">
          <label>Condition</label>
          <select className="ui fluid dropdown" value={ this.state.condition } onChange={ this.onConditionChange }>
            { conditions.map(condition => <option key={ condition }>{ condition }</option>) }
          </select>
        </div>

        <div className="field">
          <label>Language</label>
          <select className="ui fluid dropdown" value={ this.state.language } onChange={ this.onLanguageChange }>
            { languages.map(language => <option key={ language }>{ language }</option>) }
          </select>
        </div>
      </div>
    );
  },
  render() {
    return (
      <form className="ui form">
        { this.renderHeader() }
      </form>
    );
  },
  onLanguageChange(event) {
    this.setState({
      title: event.target.value
    });
  },
  onConditionChange(event) {
    this.setState({
      condition: event.target.value
    });
  },
  onLanguageChange(event) {
    this.setState({
      language: event.target.value
    });
  }
});

export default BuildCurriculumPage;
