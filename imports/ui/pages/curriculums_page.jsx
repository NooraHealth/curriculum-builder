import React from 'react';

import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import { Curriculums } from 'meteor/noorahealth:mongo-schemas';

import '../../api/curriculums';

function CurriculumsPage({ curriculums }) {
  const removeCurriculum = ({ _id, title }) => {
    if (confirm(`Are you sure you want to delete ${title}?`)) {
      Meteor.call('curriculums.remove', _id)
    }
  };

  const menu = (
    <div className="ui text menu">
      <div className="ui right item">
        <a href="#" onClick={ e => e.preventDefault() || AccountsTemplates.logout() }>
          Sign Out
        </a>
      </div>
    </div>
  );

  const content = curriculums.map(curriculum => {
    const { _id, title } = curriculum;

    return (
      <li key={ _id }>
        <a href={ `/curriculums/${_id}` }>{ title }</a>
        { ' ' }
        (<a href="#" onClick={ removeCurriculum.bind(this, curriculum) }>Delete</a>)
      </li>
    );
  });

  return (
    <div>
      { menu }

      <ul>
        <li>
          <a href="/curriculums/new">New Curriculum</a>
        </li>

        { content }
      </ul>
    </div>
  );
}

const CurriculumsPageContainer = createContainer(() => {
  Meteor.subscribe('curriculums.all');
  const curriculums = Curriculums.find({}, {sort: {title: 1}}).fetch();

  return {
    curriculums
  };
}, CurriculumsPage);

export default CurriculumsPageContainer;
