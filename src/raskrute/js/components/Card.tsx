import React, { MouseEventHandler, ReactNode } from 'react';
import cx from 'classnames';

const Card: React.FC<{
    style?: any
    children?: ReactNode
    className?: string
    onMouseDown?: MouseEventHandler
    onClick?: MouseEventHandler
}> = (props) =>
  <div {...props} className={cx('card', props.className)}>
    <div className="card-content">
      {props.children}
    </div>
  </div>;

export default Card;
