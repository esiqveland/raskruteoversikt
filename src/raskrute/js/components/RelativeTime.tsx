import React, { useEffect, useState } from 'react';
import Moment from 'moment';

const RelativeTime: React.FC<{
    // refresh rate in millis.
    refreshRate: number
    timestamp: Moment.Moment
}> = ({ refreshRate, timestamp }) => {

    const [ count, setCount ] = useState(1);

    useEffect(() => {
        const interval = setInterval(
            () => setCount(count + 1),
            refreshRate
        );

        return () => {
            clearInterval(interval)
        };
    }, [ refreshRate, count, setCount ]);

    if (!Moment.isMoment(timestamp)) {
        throw new Error(`Invalid prop 'timestamp' supplied to me. 
    Object must be a moment object and satisfy Moment.isMoment(obj).`);
    }

    return (
        <span>{ timestamp.fromNow() }</span>
    );
};

export default RelativeTime;
