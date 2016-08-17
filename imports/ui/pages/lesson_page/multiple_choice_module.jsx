import React from 'react';

import { audioURL } from '../../../uploads/audio';
import { imageURL } from '../../../uploads/image';

export function MultipleChoiceModule({module}) {
  const isCorrectAnswer = option => {
    const { correct_answer: correctAnswers } = module;

    return correctAnswers.indexOf(option) !== -1;
  };

  const renderImages = () => {
    return module.options.map((option, i) => {
      const style = isCorrectAnswer(option) ? { border: '5px solid #2C662D' } : {};
      return (
        <div key={ i } className="column">
          <img className="ui fluid image"
               src={ imageURL(option) }
               style={ style } />
        </div>
      );
    });
  };

  return (
    <div className="content">
      <div className="ui relaxed list">
        <div className="item">
          <div className="header">Options</div>

          <div className="ui stackable six column grid">
            { renderImages() }
          </div>

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
