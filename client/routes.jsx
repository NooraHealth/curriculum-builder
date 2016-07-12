import React from 'react';
import {Meteor} from 'meteor/meteor';
import {mount} from 'react-mounter';

import Layout from '../imports/ui/layouts/layout.jsx';
import BuildCurriculumPageContainer from '../imports/ui/pages/build_curriculum_page.jsx';
import CurriculumsPageContainer from '../imports/ui/pages/curriculums_page.jsx';
import LessonPageContainer from '../imports/ui/pages/lesson_page.jsx';
import SignInPage from '../imports/ui/pages/sign_in_page';

// By default, FlowRouter mounts the React component onto .react-root
const ProtectedRoutes = FlowRouter.group({
  triggersEnter: [function(context, redirect) {
    if (!Meteor.userId()) {
      redirect('/signin');
    }
  }]
});

ProtectedRoutes.route('/', {
  triggersEnter: [function(context, redirect) {
    redirect('/curriculums');
  }]
});

ProtectedRoutes.route('/curriculums', {
  action() {
    mount(Layout, {
      content: <CurriculumsPageContainer />
    });
  }
});

ProtectedRoutes.route('/curriculums/new', {
  action() {
    mount(Layout, {
      content: <BuildCurriculumPageContainer />
    });
  }
})

ProtectedRoutes.route('/curriculums/:id', {
  action({ id }) {
    mount(Layout, {
      content: (<BuildCurriculumPageContainer _id={ id }/>)
    });
  }
});

ProtectedRoutes.route('/curriculums/:curriculum_id/lessons/:lesson_id', {
  action({ curriculum_id, lesson_id }) {
    mount(Layout, {
      content: <LessonPageContainer curriculum_id={ curriculum_id}
                                    lesson_id={ lesson_id } />
    });
  }
});

AccountsTemplates.configure({
  onSubmitHook(error, state) {
    if (!error && state === 'signIn') {
      FlowRouter.go('/');
    }
  },
  onLogoutHook() {
    console.log('yo');
    FlowRouter.go('/signin');
  }
});

FlowRouter.route('/signin', {
  triggersEnter: [function(context, redirect) {
    if (Meteor.userId()) {
      redirect('/');
    }
  }],
  action() {
    mount(Layout, {
      content: <SignInPage />
    });
  }
});
