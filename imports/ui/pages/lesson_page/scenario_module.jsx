import React from 'react';

import { audioURL } from '../../../uploads/audio';
import { imageURL } from '../../../uploads/image';

export function ScenarioModule({module}) {
  const humanFriendlyAnswers = {
    CallDoc: 'Call Doctor',
    Call911: 'Call 911',
    Normal: 'Normal'
  };

  return (
    <div className="content">
      <div className="ui list">
        <div className="item">
          <div className="header">Image</div>
          <img className="ui small image" src={ imageURL(module.image) } />
        </div>

        <div className="item">
          <div className="header">Question</div>
          { module.question }
        </div>

        <div className="item">
          <div className="header">Correct Answer</div>
          { humanFriendlyAnswers[module.correct_answer[0]] }
        </div>

        <div className="item">
          <div className="header">Correct Audio</div>
          <audio src={ audioURL(module.correct_audio) } controls="true" />
        </div>

        <div className="item">
          <div className="header">Audio</div>
          <audio src={ audioURL(module.audio) } controls="true" />
        </div>
      </div>
    </div>
  );
}
