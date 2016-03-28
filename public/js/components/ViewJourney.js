import React from "react";
import moment from "moment";
import {connect} from "react-redux";
import {LoadJourney} from "../action/actions";
import Spinner from "./spinner";
import Card from "./Card";
import StopGraph from './StopGraph';

const PropTypes = React.PropTypes;

const ViewJourney = React.createClass({
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
      // return (
      //   <div key={stop.ID}>
      //     <article className="stop-timediff">{`${durationShort}`}</article>
      //     <Card>
      //       <div className="card-content">{`${depTime}${duration} - ${stop.Name}`}</div>
      //     </Card>
      //   </div>
      // );
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
  return {
    journeyRef: props.params.journeyRef,
    timestamp: props.params.timestamp,
    journey: findJourney(state.app.journey[props.params.journeyRef]),
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
