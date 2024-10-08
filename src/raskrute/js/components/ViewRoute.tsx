import React, { useEffect, useMemo, useState } from 'react';
import { PullDownContent, PullToRefresh, RefreshContent, ReleaseContent } from 'react-js-pull-to-refresh';
import { Link, useParams } from 'react-router-dom';

import moment from 'moment';
import DocumentTitle from 'react-document-title';

import Avgang, { HideableMap } from './Avgang';
import Spinner from './Spinner';
import Card from './Card';
import ErrorMessage from './common/ErrorMessage';
import FavIcon from './common/FavIcon';
import SimpleMap from './SimpleMap';
import { useRuteStore } from "../store";
import { ApiRute, getRouteId } from "../action/api";
import { EstimatedCallSchemaType, GeoLocation, TransportModeType } from "../api/types";

type TransportTypes = TransportModeType
const words: Record<TransportTypes, string> = {
    all: 'Alle',
    air: 'Fly',
    tram: 'Trikk',
    bus: 'Buss',
    coach: 'Regionbuss',
    metro: 'T-bane',
    rail: 'Tog',
    water: 'Ferje',
    unknown: 'Ukjent',
    boat: 'Båt',
    ferry: 'Ferje',
    train: 'Tog',
};

const Translate = (key: TransportTypes) => {
    const word = words[key];
    if (!word) {
        console.log('Missing translate key: ', key);
    }

    return word || key;
};

interface SomeError {
    error: boolean
    errorMessage?: string | undefined
}

function _renderError(rute: SomeError) {
    if (!rute || !rute.error) {
        return null;
    } else {
        return <ErrorMessage errorMessage={ rute.errorMessage || '' } disabled={ !rute.errorMessage } canReload/>;
    }
}

interface IsLoading {
    isFetching: boolean
}

function _renderLoading(rute?: IsLoading) {
    if (rute && rute.isFetching) {
        return <Spinner/>
    } else {
        return null;
    }
}

export interface ITranportRoute {
    id: string
    name: string
    location?: GeoLocation
    // modes: Array<TransportTypes>
    // avganger: Array<RouteAvgangType>
    estimatedCalls: Array<EstimatedCallSchemaType>
}

export interface TransportRouteInnerProps {
    routeState: RouteLoadingState,
    routeId: string,
    transportMode?: TransportTypes,
    isFavoritt: boolean,
    toggleFavoritt: (rute: ITranportRoute, isFavoritt: boolean) => void,
    onRefresh: () => Promise<void>,
    avganger?: (EstimatedCallSchemaType)[]
}

const ViewRouteInner: React.FC<TransportRouteInnerProps> = props => {
    const {
        routeState,
        routeId,
        transportMode = 'all',
        avganger,
        toggleFavoritt,
        isFavoritt,
        onRefresh,
    } = props;

    if (routeState.error && !routeState.rute) {
        return (
            <section>
                { _renderError(routeState) }
            </section>
        );
    }
    if (routeState.isFetching || !routeState.rute) {
        return (
            <section>
                { _renderLoading(routeState) }
                { _renderError(routeState) }
            </section>
        );
    }
    const rute = routeState.rute;
    const location = rute.location;
    const currentMode = transportMode;

    const avgangList = (avganger || [])
        .filter(avg => {
            if (currentMode === 'all') {
                return true;
            } else {
                const mode = avg.serviceJourney.line.transportMode || '';
                return mode === currentMode;
            }
        })
        .map((avgang, idx) => <Avgang key={ `${ idx }-${ avgang.serviceJourney.id }` } avgang={ avgang }/>);

    const transportModes = (rute.modes || [])
        .sort((a, b) => a.localeCompare(b));

    let modeSection = null;
    if (transportModes.length > 1) {
        modeSection =
            (
                <section className="flex-row center">
                    {
                        transportModes.map((m: string) => {
                            const isActive = m === currentMode;
                            const nextMode = isActive ? 'all' : m;
                            const style = {
                                backgroundColor: isActive ? 'rgb(51, 196, 240)' : '',
                            };
                            return (
                                <Card style={ { marginLeft: '2px', marginRight: '2px', ...style } }
                                      className="flex-item capitalize" key={ m }>
                                    <Link to={ { pathname: `/routes/${ routeId }/${ nextMode }` } }
                                          style={ { textDecoration: 'none' } }>
                                        <div
                                            style={ { color: isActive ? '#FFF' : '' } }>{ Translate(m as TransportTypes) }</div>
                                    </Link>
                                </Card>
                            )
                        }) }
                </section>
            )
    }

    return (
        <DocumentTitle title={ rute.name || 'Rask Rute' }>
            <PullToRefresh
                pullDownContent={ <PullDownContent height={ '100px' }/> }
                releaseContent={ <ReleaseContent height={ '100px' }/> }
                refreshContent={ <RefreshContent height={ '100px' }/> }
                pullDownThreshold={ 150 }
                onRefresh={ onRefresh }
                triggerHeight={ 250 }
                backgroundColor='white'
                startInvisible
            >
                <section style={ { marginRight: '5px' } }>
                    <h5 onClick={ () => toggleFavoritt(rute, !isFavoritt) }
                        className="hover-hand">
                        <FavIcon isFavourite={ isFavoritt }/> { rute.name }
                    </h5>
                    { _renderError(routeState) }
                    { modeSection }
                    <div id="avgangliste">
                        { avgangList }
                    </div>
                    <section style={ { marginLeft: '3px' } }>
                        <HideableMap
                            longitude={location?.longitude || 0}
                            latitude={location?.latitude || 0}
                        />
                    </section>
                </section>
            </PullToRefresh>
        </DocumentTitle>
    );
};


export interface TransportRouteProps {
}

interface RouteLoadingState {
    rute?: ApiRute
    isFetching: boolean
    error: boolean
    errorMessage?: string | undefined
}

function loadRoute(
    routeId: string,
    setRouteState: (value: (((prevState: RouteLoadingState) => RouteLoadingState) | RouteLoadingState)) => void,
    isMounted: {
        isMounted: boolean
    },
    force: boolean,
) {
    return getRouteId(routeId)
        .then(ruteData => {
            if (!isMounted.isMounted) {
                return
            }
            setRouteState(state => {
                return {
                    ...state,
                    isFetching: false,
                    error: false,
                    rute: ruteData,
                }
            })
        })
        .catch(err => {
            setRouteState(state => {
                return {
                    ...state,
                    isFetching: false,
                    error: true,
                    errorMessage: err.message || err.errorMessage || 'Something went wrong.',
                    rute: undefined,
                }
            })
            if (!isMounted.isMounted) {
                return
            }
        })

}

const ViewRoute: React.FC<TransportRouteProps> = (props: TransportRouteProps) => {
    const { routeId = '', transportMode = 'all' } = useParams();
    const { dispatch, favorites } = useRuteStore('favorites');
    const transportType = transportMode as TransportTypes
    const [ routeState, setRouteState ] = useState<RouteLoadingState>({
        isFetching: false,
        error: false,
    })

    const start = useMemo(() => new Date(), [ routeId ]);
    const [ now, setNow ] = useState(start);
    const [ refreshCount, setRefreshCount ] = useState(0);
    useEffect(() => {
        const interval = setInterval(
            () => setNow(new Date()),
            60_000,
        );
        return () => {
            clearInterval(interval);
        }
    }, []);

    useEffect(() => {
        let isMounted = {
            isMounted: true,
        };
        if (!routeState.isFetching && !routeState.rute) {
            setRouteState({
                isFetching: true,
                error: false,
            })
            loadRoute(routeId, setRouteState, isMounted, false)
        }
        return () => {
            isMounted.isMounted = false;
        }
    }, [ routeId, setRouteState, refreshCount ]);

    console.log(`routeState=`, routeState);
    const rute = routeState.rute;

    // const avganger: Array<RouteAvgangType> = rute?.avganger || [];
    const avganger = rute?.estimatedCalls || [];
    console.log(`avganger=`, avganger);

    const avgangerLocal = removePassedAvganger(avganger, moment(now));
    console.log(`avgangerLocal=`, avgangerLocal);
    const isFavoritt = Boolean(favorites.stops[routeId]);

    return <ViewRouteInner
        avganger={ avgangerLocal }
        transportMode={ transportType }
        routeId={ routeId }
        routeState={ routeState }
        toggleFavoritt={ (rute1, enable) => {
            dispatch('favorites/update', {
                stop: {
                    ID: rute1.id,
                    name: rute1.name,
                    location: rute1.location,
                },
                isFavorited: enable,
            })
        } }
        isFavoritt={ isFavoritt }
        onRefresh={ async () => {
            console.log('refresh ' + routeId);
            setRefreshCount(refreshCount + 1)
            return loadRoute(routeId, setRouteState, { isMounted: true }, true)
        } }
    />;
};

export interface IAvgang {
    expectedDepartureTime: moment.Moment
}

function removePassedAvganger<T extends IAvgang>(avganger: Array<T>, then?: moment.Moment) {
    const now = then || moment();
    const hasNotPassed = avganger.filter(avgang => now.isBefore(avgang.expectedDepartureTime));
    return hasNotPassed
};

export default ViewRoute;
