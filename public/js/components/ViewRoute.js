import React from 'react';
import {connect} from 'react-redux';
import cx from 'classnames';
import moment from 'moment';
import DocumentTitle from 'react-document-title';

const PropTypes = React.PropTypes;

import {loadRouteWithId, ToggleFavoriteAndSave} from '../action/actions';

import {apiKey} from '../util/constants.js';
import Avgang from './avgang';
import Spinner from './spinner';
import Card from './Card';
import SelfUpdating from './common/SelfUpdating';
import ErrorMessage from './common/ErrorMessage';
import FavIcon from './common/FavIcon';

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
      <ErrorMessage errorMessage={rute.errorMessage} disabled={!rute.errorMessage} canReload/>
    );
  },
  _renderLoading(rute) {
    if (rute && rute.isFetching) {
      return <Spinner />
    }
  },
  getInitialState() {
    return {
      showMap: false,
    };
  },
  _toggleMap() {
    this.setState({showMap: !this.state.showMap})
  },
  render() {
    const {rute={ID: -1}, routeId, avganger, loadRouteData, toggleFavoritt, isFavoritt} = this.props;
    const showMap = this.state.showMap;

    if (!rute || rute.isFetching) {
      return (
        <section>{ this._renderLoading(rute) }</section>
      );
    }

    const {location} = rute;
    const gmaps_iframe_src =
      `https://www.google.com/maps/embed/v1/view?key=${apiKey}&zoom=17&center=${location.latitude},${location.longitude}`;

    let avgangList = avganger || [];
    return (
      <DocumentTitle title={rute.Name || 'Rask Rute'}>
        <section>
          <h5 onClick={() => toggleFavoritt(routeId, rute.Name)} className="hover-hand">
            <FavIcon isFavourite={isFavoritt}/> {rute.Name}
          </h5>
          { this._renderError(rute) }
          <div id="avgangliste">
            {avgangList.map(avgang => <Avgang key={avgang.ID} avgang={avgang}/>)}
          </div>
          <section onClick={() => this._toggleMap()}>
            <Card className="hover-hand"><a>Vis kart</a></Card>
            {!showMap ? null :
              <div className="display-fullscreen">
                <div className="map-close hover-hand" onClick={ e => this._toggleMap() }>
                  <Card><a>Lukk</a></Card>
                </div>
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{border:0}}
                  src={gmaps_iframe_src}>
                </iframe>
              </div>
            }
          </section>
        </section>
      </DocumentTitle>
    );
  }
});

const removePassedAvganger = (props = {avganger: []}, state = {now: moment()}) => {
  const {avganger} = props;
  const {now} = state;
  const hasNotPassed = avganger.filter(avgang => now.isBefore(avgang.ExpectedDepartureTime));
  return Object.assign({}, props, {avganger: hasNotPassed});
};

const getAvganger = rute => rute ? rute.avganger || [] : [];

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