import React from 'react';
import {mount} from 'react-mounter';

import Layout from '../imports/ui/layouts/layout.jsx';
import BuildCurriculumPageContainer from '../imports/ui/pages/build_curriculum_page.jsx';

// By default, FlowRouter mounts the React component onto .react-root
FlowRouter.route('/:id?', {
  action({ id }) {
    mount(Layout, {
      content: (<BuildCurriculumPageContainer _id={ id }/>)
    });
  }
});
