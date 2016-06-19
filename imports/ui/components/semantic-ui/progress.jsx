import React from 'react';

// React wrapper on top of Semantic UI Progress.
//
// Props:
// progress - The current progress as a number between 0 to 1.
// Label (optional) - A string to be displayed under the progress bar.
//
// Note:
// This component does not use the JavaScript API provided by Semantic UI.
// Current implementation supports only a small subset of the features.

const Progress = React.createClass({
  propTypes: {
    progress: React.PropTypes.number.isRequired,
    label: React.PropTypes.string
  },
  renderLabel() {
    if (this.props.label) {
      return <div className="label">{ this.props.label }</div>;
    } else {
      return false;
    }
  },
  render() {
    const percent    = this.props.progress * 100;
    const percentInt = Math.round(percent);

    const barStyle = {
      transition: "300ms",
      width: `${percent}%`
    };

    return (
      <div className="ui teal progress">
        <div className="bar" style={ barStyle }>
          <div className="progress">{ percentInt }%</div>
        </div>

        { this.renderLabel() }
      </div>
    );
  }
});

export { Progress };
