import React from 'react';
import {mount} from 'react-mounter';

import Layout from '../imports/ui/layouts/layout.jsx';
import BuildCurriculumPageContainer from '../imports/ui/pages/build_curriculum_page.jsx';
import CurriculumsPageContainer from '../imports/ui/pages/curriculums_page.jsx';

// By default, FlowRouter mounts the React component onto .react-root
FlowRouter.route('/', {
  triggersEnter: [function(context, redirect) {
    redirect('/curriculums');
  }]
});

FlowRouter.route('/curriculums', {
  action() {
    mount(Layout, {
      content: <CurriculumsPageContainer />
    });
  }
});

FlowRouter.route('/curriculums/new', {
  action() {
    mount(Layout, {
      content: <BuildCurriculumPageContainer />
    });
  }
})

FlowRouter.route('/curriculums/:id', {
  action({ id }) {
    mount(Layout, {
      content: (<BuildCurriculumPageContainer _id={ id }/>)
    });
  }
});
