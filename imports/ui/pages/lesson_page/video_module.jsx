import React from 'react';

import { videoURL } from '../../../uploads/video';

export function VideoModule({module}) {
  return (
    <div className="content">
      <div className="ui list">
        <div className="item">
          <div className="header">Video</div>
          <video src={ videoURL(module.video) } style={ {width: '150px'} } controls="true" />
        </div>
      </div>
    </div>
  );
}
