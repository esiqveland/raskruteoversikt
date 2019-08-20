import React, { useState, useEffect } from 'react';
import moment from 'moment';

const SelfUpdatingRoute = (propsTransform, MyComponent, intervalMs = 60000) => (props) => {
  const [ now, setNow ] = useState(moment());

  useEffect(() => {
    const interval = setInterval(
        () => setNow(moment()),
        intervalMs
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  const newProps = propsTransform(props, { now: now });

  return (
      <MyComponent {...newProps} />
  );
};

export const create = SelfUpdatingRoute;
export default SelfUpdatingRoute;
