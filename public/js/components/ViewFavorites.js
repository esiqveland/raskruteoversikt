import React from 'react';
const PropTypes = React.PropTypes;
import {connect} from 'react-redux';
import {Link} from 'react-router';

import {ToggleFavoriteAndSave} from '../action/actions';
import {latLongDistance} from '../util/ruteutils';

import Spinner from './spinner';
import Card from './Card';

const FavCard = ({favorite, position}) => {
  let distance = undefined;
  if (position && favorite.location && position.coords) {
    distance = latLongDistance(position.coords, favorite.location);
  }
  distance = distance || 0.0;

  return (
    <Card key={favorite.ID}>
      <Link to={`/routes/${favorite.ID}`}>{favorite.name}</Link>
      <span className="float-right">{`${distance.toFixed(1)}km`}</span>
    </Card>
  );
};

const ViewFavorites = ({favorites, location}) => {
  if (location.isFetching) {
    return (<div className="favorites"><Spinner /></div>)
  }
  return (
    <div className="favorites">
      {
        favorites
          .sort((favA, favB) => {
            if (location && location.position) {
              return latLongDistance(favA.location, location.position.coords) - latLongDistance(favB.location, location.position.coords);
            } else {
              return -1;
            }
          })
          .map(fav => <FavCard key={fav.ID} favorite={fav} position={location.position}/>)
      }
    </div>
  );
};

ViewFavorites.propTypes = {
  toggleFavoritt: PropTypes.func.isRequired,
  favorites: PropTypes.arrayOf(PropTypes.shape({
    ID: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    location: PropTypes.shape({
      latitude: PropTypes.number.isRequired,
      longitude: PropTypes.number.isRequired,
    }),
  })).isRequired,
  location: PropTypes.shape({
    isFetching: PropTypes.bool.isRequired,
    error: PropTypes.object,
    position: PropTypes.shape({
      coords: PropTypes.shape({
        latitude: PropTypes.number.isRequired,
        longitude: PropTypes.number.isRequired,
      }),
    }),
  }).isRequired,
};

const toList = (favoritter) => {
  return Object.keys(favoritter)
    .filter((key) => key !== 'last_saved')
    .map((key) => Object.assign({}, favoritter[key], {ID: key}));
};

const mapStateToProps = (state) => {
  return {
    favorites: toList(state.app.favoritter),
    location: state.app.position,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    toggleFavoritt: (routeId, name) => {
      dispatch(ToggleFavoriteAndSave(routeId, name))
    }
  }
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ViewFavorites);
