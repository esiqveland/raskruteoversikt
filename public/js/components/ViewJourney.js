import React from 'react';
const createReactClass = require('create-react-class');
import { connect } from 'react-redux';

import { LoadJourney } from '../action/actions';
import Spinner from './spinner';
import StopGraph from './StopGraph';

import PropTypes from 'prop-types';

const ViewJourney = createReactClass({
  propTypes: {
    loadJourney: PropTypes.func.isRequired,
    journeyRef: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
    journey: PropTypes.shape({
      isFetching: PropTypes.bool.isRequired,
      stops: PropTypes.shape({
        Stops: PropTypes.array.isRequired,
      }),
    }).isRequired,
  },
  componentDidMount() {
    this.props.loadJourney(this.props.journeyRef, this.props.timestamp);
  },
  render() {
    const {journeyRef, timestamp, journey} = this.props;
    if (journey.isFetching) {
      return <div><Spinner /></div>;
    }
    const stops = journey.stops.Stops || [];
    // stops.map((stop) => {
      // return (
      //   <div key={stop.ID}>
      //     <article className="stop-timediff">{`${durationShort}`}</article>
      //     <Card>
      //       <div className="card-content">{`${depTime}${duration} - ${stop.Name}`}</div>
      //     </Card>
      //   </div>
      // );
    // });
    return (
      <div>
        <StopGraph stops={stops}/>
      </div>
    );
  }
});

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
