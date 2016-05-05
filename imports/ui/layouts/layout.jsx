
let Layout = React.createClass({
  render: function(){
    return (
      <div>
        <main>
          { this.props.content }
        </main>
      </div>
    )
  }

});

module.exports.Layout = Layout;
