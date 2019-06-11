import React from 'react';
const createReactClass = require('create-react-class');
import { PullToRefresh, PullDownContent, ReleaseContent, RefreshContent } from "react-js-pull-to-refresh";

import {connect} from 'react-redux';
import cx from 'classnames';
import moment from 'moment';
import DocumentTitle from 'react-document-title';

import PropTypes from 'prop-types';

import {loadRouteWithId, ToggleFavoriteAndSave} from '../action/actions';

import {apiKey} from '../util/constants';
import Avgang from './avgang';
import Spinner from './spinner';
import Card from './Card';
import SelfUpdating from './common/SelfUpdating';
import ErrorMessage from './common/ErrorMessage';
import FavIcon from './common/FavIcon';

const ViewRoute = createReactClass({
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
  onRefresh() {
    const { loadRouteData, routeId } = this.props;

    return new Promise((resolve, reject) => {
      loadRouteData(routeId)
        .then(resolve)
        .catch(reject);
    });
  },
  render() {
    const {rute={ID: -1, location: {}}, routeId, avganger, loadRouteData, toggleFavoritt, isFavoritt} = this.props;
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
        <PullToRefresh
          pullDownContent={<PullDownContent height={'100px'} />}
          releaseContent={<ReleaseContent height={'100px'} />}
          refreshContent={<RefreshContent height={'100px'} />}
          pullDownThreshold={150}
          onRefresh={this.onRefresh}
          triggerHeight={250}
          backgroundColor='white'
          startInvisible
        >
          <section style={{marginRight: '5px'}}>
            <h5 onClick={() => toggleFavoritt(routeId, rute.Name, rute.location)} className="hover-hand">
              <FavIcon isFavourite={isFavoritt}/> {rute.Name}
            </h5>
            { this._renderError(rute) }
            <div id="avgangliste">
              {avgangList.map((avgang, idx) => <Avgang key={`${idx}-${avgang.ID}`} avgang={avgang}/>)}
            </div>
            <section onClick={() => this._toggleMap()} style={{ marginLeft: '3px' }}>
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
                    src={gmaps_iframe_src}
                  />
                </div>
              }
            </section>
          </section>
        </PullToRefresh>
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
  const routeId = props.match.params.routeId;
  return {
    routeId: routeId,
    isFavoritt: isFavoritt(routeId, state.app.favoritter),
    rute: state.app.ruter[routeId],
    avganger: getAvganger(state.app.ruter[routeId]),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loadRouteData: (routeId) => {
      return dispatch(loadRouteWithId(routeId));
    },
    toggleFavoritt: (routeId, name, location) => {
      dispatch(ToggleFavoriteAndSave(routeId, name, location))
    }
  }
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SelfUpdating(removePassedAvganger, ViewRoute, 60000));