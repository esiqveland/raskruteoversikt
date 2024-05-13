import React, { ReactNode, useEffect, useState } from 'react';
import { Collapse as ReactCollapse } from 'react-collapse';
import { Link } from 'react-router-dom';
import { latLongDistance } from '../util/ruteutils';
import Spinner from './Spinner';
import Card from './Card';
import { FavorittStoreType } from "../store/favoritter/favoritter";
import { useRuteStore } from "../store";
import { FavoriteStopType } from "../store/favoritter/favorittModule";
import { Position } from "../api/types";


const FavCard: React.FC<{
    favorite: FavoriteStopType
    position?: Position
}> = ({ favorite, position }) => {
    let distance = undefined;
    if (position && favorite.location && position) {
        distance = latLongDistance(position, favorite.location);
    }
    let distanceKm = '';
    if (distance) {
        distanceKm = `${ distance.toFixed(1) }km`;
    }

    return (
        <Card key={ favorite.ID }>
            <Link to={ `/routes/${ favorite.ID }` }>{ favorite.name }</Link>
            <span className="float-right">{ distanceKm }</span>
        </Card>
    );
};


const Alert: React.FC<{
    isOpen?: boolean
    error: string | ReactNode | undefined
}> = ({ isOpen: isOpenInitial, error }) => {
    const [ isOpen, setOpen ] = useState(isOpenInitial || false)
    let content = <span/>;
    if (error) {
        content =
            <div className="alert alert-warning hover-hand" onClick={ () => setOpen(!isOpen) }>
                { error }
            </div>;
    }
    return (
        <ReactCollapse isOpened={ isOpen }>
            { content }
        </ReactCollapse>
    );
}


const ViewFavorites: React.FC<{}> = () => {
    const { dispatch, favorites, location } = useRuteStore('favorites', 'location');
    useEffect(() => {
        dispatch('location/enableLocation')
        // findLocation();
    }, [ dispatch ]);

    if (!location || location.loading) {
        return (<div className="favorites"><Spinner/></div>)
    }
    const faveList = toList(favorites)
        .sort((favA, favB) => {
            if (location && location.position) {
                return latLongDistance(favA.location, location.position) - latLongDistance(favB.location, location.position);
            } else {
                return favA.name.localeCompare(favB.name);
            }
        });

    return (
        <div className="favorites">
            <Alert error={ location.error }/>
            {
                faveList
                    .map((fav) => <FavCard key={ fav.ID } favorite={ fav } position={ location.position }/>)
            }
        </div>
    );
};

const toList = (favoritter: FavorittStoreType) => {
    return Object.keys(favoritter.stops)
        .filter((key) => key !== 'last_saved')
        .map((key) => Object.assign({}, favoritter.stops[key], { ID: key }));
};

export default ViewFavorites;
