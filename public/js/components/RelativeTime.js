import React from 'react';

import Moment from 'moment';

const RelativeTime = React.createClass({
  propTypes: {
    refreshRate: React.PropTypes.number.isRequired, // refresh rate in millis.
    timestamp: React.PropTypes.any.isRequired,
  },
  _startRefresh() {
    this.setState({timer: setTimeout(() => this._startRefresh(), this.props.refreshRate)});
  },
  componentWillUnmount(){
    try {
      clearTimeout(this.state.timer);
    } catch (e) {
    }
  },
  componentWillMount() {
    const {timestamp} = this.props;
    var datetime = Moment.isMoment(timestamp) ? timestamp : moment(timestamp);
    this.setState({datetime: datetime});
    this._startRefresh();
  },
  render() {
    const {datetime} = this.state;
    return (
      <span>{datetime.fromNow()}</span>
    );
  }
});

export default RelativeTime;