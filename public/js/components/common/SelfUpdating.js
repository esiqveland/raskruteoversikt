import React from 'react';
import moment from 'moment';

const SelfUpdatingRoute = (propsTransform, MyComponent, intervalMs = 60000) => React.createClass({
  getInitialState: function () {
    return {
      now: moment(),
    };
  },
  componentDidMount: function () {
    this.interval = setInterval(this.tick, intervalMs);
  },
  componentWillUnmount: function () {
    clearInterval(this.interval);
  },
  tick: function () {
    this.setState({now: moment()});
  },
  render: function () {
    const newProps = propsTransform(this.props, this.state);
    return (
      <MyComponent {...newProps} />
    );
  }
});

export const create = SelfUpdatingRoute;
export default SelfUpdatingRoute;
