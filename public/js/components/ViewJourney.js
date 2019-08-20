import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { LoadJourney } from '../action/actions';
import Spinner from './spinner';

import StopGraph from './StopGraph';

const ViewJourney = ({ loadJourney, journeyRef, timestamp, journey }) => {
  useEffect(() => {
    loadJourney(journeyRef, timestamp);
  }, [ journeyRef ]);

  if (journey.isFetching) {
    return <div><Spinner/></div>;
  }

  const stops = journey.stops.Stops || [];

  return (
      <div>
        <StopGraph stops={stops}/>
      </div>
  );
};

ViewJourney.propTypes = {
  loadJourney: PropTypes.func.isRequired,
  journeyRef: PropTypes.string.isRequired,
  timestamp: PropTypes.string.isRequired,
  journey: PropTypes.shape({
    isFetching: PropTypes.bool.isRequired,
    stops: PropTypes.shape({
      Stops: PropTypes.array.isRequired,
    }),
  }).isRequired,
};

const findJourney = (journeyData = {isFetching: true}) => {
  return journeyData;
};

const mapStateToProps = (state, props) => {
  const journeyRef = props.match.params.journeyRef;
  const timestamp = props.match.params.timestamp;

  return {
    journeyRef: journeyRef,
    timestamp: timestamp,
    journey: findJourney(state.app.journey[journeyRef]),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loadJourney: (journeyRef, timestamp) => {
      dispatch(LoadJourney(journeyRef, timestamp));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ViewJourney);
