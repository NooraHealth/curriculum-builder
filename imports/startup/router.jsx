
import '../ui/layouts/layout.jsx';
import '../ui/pages/build_curriculum_page.jsx';

FlowRouter.route('/', {
  action: function(){
    ReactLayout.render( Layout, {
      content: <BuildCurriculumPage/>
    });
  }
});


