import React, { MouseEventHandler } from 'react';
import cx from 'classnames';

const FavIcon: React.FC<{
    isFavourite: boolean;
    onClick?: MouseEventHandler
}> = ({ isFavourite, onClick }) => {
    const classes = cx(
        'gilded',
        'fa',
        {
            'fa-star-o': !isFavourite,
            'fa-star': isFavourite,
        },
    );
    return (
        <i onClick={ onClick } className={ classes }/>
    );
};

export default FavIcon;