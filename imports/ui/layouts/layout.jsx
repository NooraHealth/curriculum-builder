import React from 'react';

const Layout = React.createClass({
  render() {
    return (
      <div className="ui container">
        { this.props.content }
      </div>
    )
  }
});

export default Layout;
