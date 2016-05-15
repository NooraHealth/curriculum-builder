import React from 'react';

// React wrapper on top of Semantic UI modals.
//
// Props:
// onHide - Callback when the modal will be hidden. Primarily used to handle the scenario where the
//          user clicks on the dimmer to dismiss the modal.
//
// Note:
// This component is not completely stateless. When this component is unmounted, the dimmer is still
// mounted in the DOM tree. This is certainly not the ideal situation, but I can't find a way to
// reliably select the dimmer constructed by the modal (so that I can manually remove it from the DOM
// tree).
//
// Example:
// renderSomeModal() {
//   return (
//     <Modal onHide={ this.hideModal }>
//       <div className="content">
//         <form className="ui form">
//           <div className="field">
//             <label>What is your name</label>
//             <input type="text" placeholder="John Smith" />
//           </div>
//
//           <button className="ui primary button" onClick={ this.hideModal }>Submit</button>
//         </form>
//       </div>
//     </Modal>
//   );
// }

export const Modal = React.createClass({
  propTypes: {
    // Note that onHide is made mandatory. I think it doesn't make sense to not handle the event,
    // especially when we are mixing React and jQuery.
    onHide: React.PropTypes.func
  },
  componentDidMount() {
    const self = this;

    $(this.refs.modalContainer).modal({
      // By default, detachable is set to true. A modal consists of two components - a dimmer (the
      // black curtain that blocks off everything else) and the dialog itself. The dimmer is mounted
      // as a direct child of body. When detachable is set to true, the dialog is detached from its
      // current position and mounted as a child of the dimmer. This behavior does not work well with
      // React. When this component is unmounted, the dialog will not be in its original position and
      // React will complain.
      detachable: false,
      onHide: function() {
        self.props.onHide();
      }
    }).modal('show');
  },
  componentWillUnmount() {
    // This is necessary to have the nice animation shown before the modal is dismissed and, more
    // importantly, hide the dimmer.
    $(this.refs.modalContainer).modal('hide');
  },
  render() {
    return (
      <div ref="modalContainer" className="ui modal">
        { this.props.children }
      </div>
    );
  }
});
