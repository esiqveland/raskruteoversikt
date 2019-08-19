import React, { useState } from 'react';
const createReactClass = require('create-react-class');
import { PullToRefresh, PullDownContent, ReleaseContent, RefreshContent } from "react-js-pull-to-refresh";
import { Link } from 'react-router-dom';

import { connect } from 'react-redux';
import cx from 'classnames';
import moment from 'moment';
import DocumentTitle from 'react-document-title';

import PropTypes from 'prop-types';

const words = {
  'tram': 'Trikk',
  'bus': 'Buss',
  'metro': 'T-bane',
  'rail': 'Tog',
};

const Translate = (key) => {
  const word = words[key];
  if (!word) {
    console.log('Missing translate key: ', key);
  }

  return word || key;
};

import { loadRouteWithId, ToggleFavoriteAndSave } from '../action/actions';

import Avgang from './avgang';
import Spinner from './spinner';
import Card from './Card';
import SelfUpdating from './common/SelfUpdating';
import ErrorMessage from './common/ErrorMessage';
import FavIcon from './common/FavIcon';
import SimpleMap from './map';

function _renderError(rute) {
  if (!rute || !rute.error) {
    return null;
  } else {
    return <ErrorMessage errorMessage={rute.errorMessage} disabled={!rute.errorMessage} canReload/>;
  }
}

function _renderLoading(rute) {
  if (rute && rute.isFetching) {
    return <Spinner/>
  } else {
    return null;
  }
}

function ViewRouteInner(props) {
  const {
    rute = { ID: -1, location: {} },
    routeId,
    transportMode,
    avganger,
    toggleFavoritt,
    isFavoritt,
    onRefresh,
  } = props;

  const { location } = rute;
  const currentMode = transportMode || 'all';
  const [ showMap, setShowMap ] = useState(false);

  if (!rute || rute.isFetching) {
    return (
        <section>{ _renderLoading(rute) }</section>
    );
  }

  const avgangList = (avganger || [])
      .filter(avg => {
        if (currentMode === 'all') {
          return true;
        } else {
          const mode = avg.serviceJourney.line.transportMode || '';
          return mode === currentMode;
        }
      })
      .map((avgang, idx) => <Avgang key={`${idx}-${avgang.ID}`} avgang={avgang}/>);

  const transportModes = (rute.modes || [])
      .sort((a, b) => a >= b);

  let modeSection = null;
  if (transportModes.length > 1) {
    modeSection =
        <section className="flex-row center">
          { transportModes.map(m => {
            const isActive = m === currentMode;
            const nextMode = isActive ? 'all' : m;
            const style = {
              backgroundColor: isActive ? 'rgb(51, 196, 240)' : '',
            };
            return (
              <Card style={{ marginLeft: '2px', marginRight: '2px', ...style }} className="flex-item capitalize" key={m}>
                <Link to={{ pathname: `/routes/${routeId}/${nextMode}` }} style={{textDecoration: 'none'}}>
                  <div style={{ color: isActive ? '#FFF' : '' }}>{Translate(m)}</div>
                </Link>
              </Card>
          ) })}
        </section>
  }

  return (
      <DocumentTitle title={rute.Name || 'Rask Rute'}>
        <PullToRefresh
            pullDownContent={<PullDownContent height={'100px'} />}
            releaseContent={<ReleaseContent height={'100px'} />}
            refreshContent={<RefreshContent height={'100px'} />}
            pullDownThreshold={150}
            onRefresh={onRefresh}
            triggerHeight={250}
            backgroundColor='white'
            startInvisible
        >
          <section style={{marginRight: '5px'}}>
            <h5 onClick={() => toggleFavoritt(routeId, rute.Name, rute.location)} className="hover-hand">
              <FavIcon isFavourite={isFavoritt}/> {rute.Name}
            </h5>
            { _renderError(rute) }
            { modeSection }
            <div id="avgangliste">
              { avgangList }
            </div>
            <section onClick={() => setShowMap(!showMap) } style={{ marginLeft: '3px' }}>
              <Card className="hover-hand center"><a>Vis kart</a></Card>
              {!showMap ? null :
                  <div className="display-fullscreen">
                    <div className="map-close hover-hand" onClick={ e => setShowMap(!showMap) }>
                      <Card><a>Lukk</a></Card>
                    </div>
                    <SimpleMap
                        latitude={location.latitude}
                        longitude={location.longitude}
                        zoom={16}
                    />
                  </div>
              }
            </section>
          </section>
        </PullToRefresh>
      </DocumentTitle>
  );
}

const ViewRoute = createReactClass({
  propTypes: {
    routeId: PropTypes.string.isRequired,
    transportMode: PropTypes.string,
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
  onRefresh() {
    const { loadRouteData, routeId } = this.props;

    return new Promise((resolve, reject) => {
      loadRouteData(routeId)
        .then(resolve)
        .catch(reject);
    });
  },
  render() {
    const props = {
      ...this.props,
      onRefresh: () => this.onRefresh(),
    };

    return <ViewRouteInner {...props} />;
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
  const transportMode = props.match.params.transportMode;
  return {
    routeId: routeId,
    transportMode: transportMode,
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
