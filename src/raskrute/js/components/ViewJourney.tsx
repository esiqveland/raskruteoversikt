import React, { useEffect, useState } from 'react';
import Spinner from './Spinner';
import StopGraph from './StopGraph';
import { useParams } from "react-router-dom";
import { getJourneyRef, JourneySchemaTypeWithDiff } from "../action/api";
import { Alert } from "./Home";

interface JourneyState {
    loading: boolean;
    journey?: JourneySchemaTypeWithDiff
    error?: string | null
}

const ViewJourney: React.FC<ViewJourneyProps> = () => {
    const { journeyRef = '', timestamp = '' } = useParams();
    const [ journeyState, setJourneyState ] = useState<JourneyState>({ loading: false });

    useEffect(() => {
        let isMounted = true;
        setJourneyState({ loading: true });

        getJourneyRef(journeyRef, timestamp)
            .then(journey => {
                if (!isMounted) {
                    return;
                }
                setJourneyState({ journey: journey, loading: false, error: null });
            })
            .catch(err => {
                console.log('error loading journey: ', err);
                if (!isMounted) {
                    return;
                }
                setJourneyState({ loading: false, error: err.message || err.errorMessage });
            })
        return () => {
            isMounted = false;
        }
    }, [ journeyRef, setJourneyState, timestamp ]);

    // const journey = findJourney(journeys[journeyRef]);
    const journey = journeyState.journey;
    if (journeyState.error) {
        const error = journeyState.error;
        return <div><Alert error={<div>{error}</div>}></Alert></div>;
    }
    if (!journey || journeyState.loading) {
        return <div><Spinner/></div>;
    }
    const stops = journey.Stops || [];

    return (
        <div><StopGraph height={ 800 } width={ 320 } colour={ 'orange' } stops={ stops }/></div>
    );
};

export interface ViewJourneyProps {}
export default ViewJourney;
