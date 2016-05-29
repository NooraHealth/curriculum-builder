import React from 'react';

import { Nag } from '../components/semantic-ui/nag';

// The NagsMixin handles some common tasks when dealing with nags.
// This mixin provides 3 public methods:
//
// renderNags(): Array<ReactComponent>
// Renders the current nags. Place this somewhere in the render() method.
//
// addNag(message, timeout = 5000): Number (id)
// Display a nag for `timeout` milliseconds with `message` as its content.
// This method returns a numerical ID which can be used to dismiss this nag
// before it is automatically dismissed. (See removeNag.)
//
// removeNag(id)
// Remove the nag whose id is `id`.
//
// Note:
// This mixin makes use of the `nags` property in the state object. I believe
// this is a sane default. However, should the need to use a custom property
// arises, feel free to implement mechanism that allows such customization.

const NagsMixin = {
  renderNags() {
    return this.__nagsMixin_getNags().map(({message, nagId}) => {
      return <Nag key={ nagId } onDismiss={ this.removeNag.bind(this, nagId) }>{ message }</Nag>;
    });
  },
  addNag(message, timeout = 5000) {
    const nags = this.__nagsMixin_getNags();

    const nagId = setTimeout(() => {
      this.removeNag(nagId);
    }, timeout);

    const nag = {
      message,
      nagId
    };

    nags.push(nag);
    this.setState({nags});

    return nagId;
  },
  removeNag(id) {
    const nags = this.__nagsMixin_getNags();
    const index = nags.findIndex(({nagId}) => nagId === id);

    if (index !== -1) {
      const nag = nags[index];
      clearTimeout(nag.nagId);
      nags.splice(index, 1);
      this.setState({nags});
    }
  },

  // Private methods
  // All the private methods are prefixed with __nagsMixin_ to prevent
  // collision.

  // getNags(): Array<Object>
  // Wrapper on top of this.state.nags. This method is helpful as the user of
  // this mixin might not have initialized the nags property in the state
  // object. Hence, this method returns a default empty array.
  __nagsMixin_getNags() {
    return Array.isArray(this.state.nags) ? this.state.nags : [];
  }
};

export { NagsMixin };
