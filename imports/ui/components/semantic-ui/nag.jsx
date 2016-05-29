import React from 'react';

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
