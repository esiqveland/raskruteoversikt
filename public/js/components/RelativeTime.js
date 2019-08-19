import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Moment from 'moment';

const RelativeTime = ({ refreshRate, timestamp }) => {
  const [ count, setCount ] = useState(1);

  useEffect(() => {
    const interval = setInterval(
        () => setCount(count + 1),
        refreshRate
    );

    return () => {
      clearInterval(interval)
    };
  }, []);

  return (
      <span>{timestamp.fromNow()}</span>
  );
};

RelativeTime.propTypes = {
    // refresh rate in millis.
    refreshRate: PropTypes.number.isRequired,
    timestamp: function (props, propName, componentName) {
        if (!Moment.isMoment(props[propName])) {
            return new Error(`Invalid prop '${propName}' supplied to '${componentName}'. 
        Object must be a moment object and satisfy Moment.isMoment(obj).`);
        }
    }
};

export default RelativeTime;
