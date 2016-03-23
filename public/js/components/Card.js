import React from 'react';
import cx from 'classnames';

const Card = (props) =>
  <div {...props} className={cx('card', props.className)}>
    <div className="card-content">
      {props.children}
    </div>
  </div>;

export default Card;
