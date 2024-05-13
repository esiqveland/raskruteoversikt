import React, { useEffect, useState } from 'react';
import moment from 'moment';

const SelfUpdating: (SomeComponent: React.JSXElementConstructor<any>) => React.FC<{}> = (SomeComponent) => (props) => {
    const newProps = {
        ...props,
        now: new Date(),
    }
    return (
        <React.Fragment>
            <SomeComponent { ...newProps } />
        </React.Fragment>
    )
}

const SelfUpdatingRoute: (transform: any, MyComponent: any, intervalMs: number) => React.FC =
    (propsTransform: any, MyComponent: any, intervalMs = 60000): React.FC => {
        return (props) => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const [ now, setNow ] = useState(moment());

            // eslint-disable-next-line react-hooks/rules-of-hooks
            useEffect(() => {
                const interval = setInterval(
                    () => setNow(moment()),
                    intervalMs
                );

                return () => {
                    clearInterval(interval);
                };
            }, [ setNow ]);

            const newProps = propsTransform(props, { now: now });

            return (
                <MyComponent { ...newProps } />
            );
        }
    }

export const create = SelfUpdatingRoute;
export default SelfUpdatingRoute;
