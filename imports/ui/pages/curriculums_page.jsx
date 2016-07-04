import React from 'react';

import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import { Curriculums } from 'meteor/noorahealth:mongo-schemas';

function CurriculumsPage({ curriculums }) {
  const content = curriculums.map(({_id, title}) => {
    return (
      <li key={ _id }>
        <a href={ `/curriculums/${_id}` }>{ title }</a>
      </li>
    );
  });

  return (
    <ul>
      <li>
        <a href="/curriculums/new">New Curriculum</a>
      </li>

      { content }
    </ul>
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
