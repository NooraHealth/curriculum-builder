import React from 'react';

const Layout = React.createClass({
  render() {
    return (
      <div>
        <main>
          { this.props.content }
        </main>
      </div>
    )
  }
});

export default Layout;
