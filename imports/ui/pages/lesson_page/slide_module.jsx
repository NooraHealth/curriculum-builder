import React from 'react';

import { audioURL } from '../../../uploads/audio';
import { imageURL } from '../../../uploads/image';

export function SlideModule({module}) {
  return (
    <div className="content">
      <div className="ui list">
        <div className="item">
          <div className="header">Image</div>
          <img className="ui small image" src={ imageURL(module.image) } />
        </div>

        <div className="item">
          <div className="header">Audio</div>
          <audio src={ audioURL(module.audio) } controls="true" />
        </div>
      </div>
    </div>
  );
}
