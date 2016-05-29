import React from 'react';

// React wrapper on top of Semantic UI Nag.
//
// Props:
// onDimiss - Callback when the user clicks on the cross. For the sake of good
//            UX, this callback should always be provided.
//
// Note:
// This component is completely pure - it will not dismiss itself, thankfully,
// unlike the Modal component.

const Nag = React.createClass({
  propTypes: {
    onDismiss: React.PropTypes.func.isRequired
  },
  render() {
    return (
      <div className="ui inline cookie nag" style={ {display: 'block'} }>
        <span className="title">{ this.props.children }</span>
        <i className="close icon" onClick={ this.props.onDismiss } />
      </div>
    );
  }
})

export { Nag };
