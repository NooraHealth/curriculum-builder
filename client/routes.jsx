import React from 'react';
import {mount} from 'react-mounter';

import Layout from '../imports/ui/layouts/layout.jsx';
import BuildCurriculumPage from '../imports/ui/pages/build_curriculum_page.jsx';

FlowRouter.route('/', {
  action() {
    mount(Layout, {
      content: (<BuildCurriculumPage />)
    });
  }
});
