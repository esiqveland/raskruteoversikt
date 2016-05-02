import React from 'react';
import {connect} from 'react-redux';
import cx from 'classnames';
import moment from 'moment';
const PropTypes = React.PropTypes;

import {loadRouteWithId, ToggleFavoriteAndSave} from '../action/actions';

import Avgang from './avgang';
import Spinner from './spinner';
import SelfUpdating from './common/SelfUpdating';

// <ErrorMessage isError={rute.error} errorMessage={rute.errorMessage} canReload={true} />
const ErrorMessage = ({isError, errorMessage, canReload, className}) => {
  let classes = cx(Object.assign({}, className, {
    'alert': true,
  }));

  return (
    <div className={classes}>
      <span>{errorMessage}</span>
      {canReload ? <span><button onClick={(ev) => { ev.preventDefault(); window.location.reload(); } }>Klikk her for å prøve igjen</button></span> : null}
    </div>
  );
};

const FavRoute = ({isFavoritt, rute, toggleFavoritt}) => {
  let classes = cx('gilded', 'fa', {'fa-star-o': !isFavoritt, 'fa-star': isFavoritt});
  return (
    <i className={classes}></i>
  );
};

FavRoute.propTypes = {
  isFavoritt: PropTypes.bool.isRequired,
  toggleFavoritt: PropTypes.func.isRequired,
  rute: PropTypes.shape({
    ID: PropTypes.number.isRequired,
    Name: PropTypes.string.isRequired,
  }).isRequired,
};

const ViewRoute = React.createClass({
  propTypes: {
    routeId: PropTypes.string.isRequired,
    isFavoritt: PropTypes.bool.isRequired,
    toggleFavoritt: PropTypes.func.isRequired,
    rute: PropTypes.shape({
      error: PropTypes.bool.isRequired,
      errorMessage: PropTypes.string,
    }),
    avganger: PropTypes.array,
    loadRouteData: PropTypes.func.isRequired,
  },
  componentWillMount() {
    this.props.loadRouteData(this.props.routeId);
  },
  _renderError(rute) {
    if (!rute || !rute.error) {
      return null;
    }
    return (
      <ErrorMessage isError={rute.error} errorMessage={rute.errorMessage} canReload/>
    );
  },
  _renderLoading(rute) {
    if (rute && rute.isFetching) {
      return <Spinner />
    }
  },
  render() {
    const {rute={}, routeId, avganger, loadRouteData, toggleFavoritt, isFavoritt} = this.props;

    if (!rute || rute.isFetching) {
      return (
        <section>{ this._renderLoading(rute) }</section>
      );
    }

    let avgangList = avganger || [];
    return (
      <section>
        <h5 onClick={() => toggleFavoritt(routeId, rute.Name)} className="hover-hand">
          <FavRoute isFavoritt={isFavoritt} toggleFavoritt={toggleFavoritt} rute={rute}/> {rute.Name}
        </h5>
        { this._renderError(rute) }
        <div id="avgangliste">
          {avgangList.map((avgang) => <Avgang key={avgang.ID} avgang={avgang}/>)}
        </div>
      </section>
    );
  }
});

const removePassedAvganger = (props, state) => {
  const {avganger} = props;
  const {now} = state;
  const hasNotPassed = avganger.filter(avgang => now.isBefore(avgang.ExpectedDepartureTime));
  return Object.assign({}, props, {avganger: hasNotPassed});
};

const getAvganger = (rute) => rute ? rute.avganger || [] : [];

const isFavoritt = (routeId, favoritter = {}) => favoritter.hasOwnProperty(routeId.toString());

const mapStateToProps = (state, props) => {
  return {
    routeId: props.params.routeId,
    isFavoritt: isFavoritt(props.params.routeId, state.app.favoritter),
    rute: state.app.ruter[props.params.routeId],
    avganger: getAvganger(state.app.ruter[props.params.routeId]),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loadRouteData: (routeId) => {
      dispatch(loadRouteWithId(routeId));
    },
    toggleFavoritt: (routeId, name) => {
      dispatch(ToggleFavoriteAndSave(routeId, name))
    }
  }
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SelfUpdating(removePassedAvganger, ViewRoute, 60000));