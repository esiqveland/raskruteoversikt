import React from 'react';
const PropTypes = React.PropTypes;
import {connect} from 'react-redux';
import {Link} from 'react-router';

import {ToggleFavoriteAndSave} from '../action/actions';
import Card from './Card';

const ViewFavorites = ({favorites}) =>
  <div className="favorites">
    {favorites
      .map((fav) => <Card key={fav.ID}><Link to={`/routes/${fav.ID}`}>{fav.name}</Link></Card>)}
  </div>;

ViewFavorites.propTypes = {
  toggleFavoritt: PropTypes.func.isRequired,
  favorites: PropTypes.arrayOf(PropTypes.shape({
    ID: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  })).isRequired,
};

const toList = (favoritter) => {
  return Object.keys(favoritter)
    .filter((key) => key !== 'last_saved')
    .map((key) => Object.assign({}, favoritter[key], {ID: key}));
};

const mapStateToProps = (state) => {
  return {
    favorites: toList(state.app.favoritter)
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
