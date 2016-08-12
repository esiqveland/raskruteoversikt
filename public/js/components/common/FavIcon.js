import React from 'react';
const PropTypes = React.PropTypes;
import cx from 'classnames';

const FavIcon = ({isFavourite, onClick}) => {
  let classes = cx('gilded', 'fa', {'fa-star-o': !isFavourite, 'fa-star': isFavourite});
  return (
    <i onClick={onClick} className={classes} />
  );
};

FavIcon.propTypes = {
  isFavourite: PropTypes.bool.isRequired,
  onClick: PropTypes.func,
};

export default FavIcon;