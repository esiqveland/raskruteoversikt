import React from 'react';

import Moment from 'moment';

const RelativeTime = React.createClass({
  propTypes: {
    // refresh rate in millis.
    refreshRate: React.PropTypes.number.isRequired,
    timestamp: function (props, propName, componentName) {
      if (!Moment.isMoment(props[ propName ])) {
        return new Error(`Invalid prop '${propName}' supplied to '${componentName}'. 
        Object must be a moment object and satisfy Moment.isMoment(obj).`);
      }
    },
  },
  _startRefresh() {
    this.setState({ timer: setTimeout(() => this._startRefresh(), this.props.refreshRate) });
  },
  componentWillUnmount(){
    try {
      clearTimeout(this.state.timer);
    } catch (e) {
    }
  },
  componentWillMount() {
    this._startRefresh();
  },
  render() {
    const { timestamp } = this.props;

    return (
      <span>{timestamp.fromNow()}</span>
    );
  }
});

export default RelativeTime;