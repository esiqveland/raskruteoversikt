import React, { useState } from 'react';
import cx from 'classnames';
import { Link } from 'react-router-dom';
import { Collapse as ReactCollapse } from 'react-collapse';

import SimpleMap, { createMapLink } from "./SimpleMap";
import RelativeTime from './RelativeTime';
import Card from './Card';
import { JourneyDateTimePattern } from '../util/journey';
import { RouteAvgangType } from "../api/types";


type IAvang = RouteAvgangType
type Deviation = IAvang['Extensions']['Deviations'][0]

export interface AvgangProps {
    avgang: IAvang
}

const Deviations: React.FC<{ deviations: Array<Deviation> }> = ({ deviations = [] }) =>
    <div>
        <h5 style={ { marginBottom: '1rem' } }>Avvik</h5>
        { deviations.map((avvik) =>
            <article key={ avvik.id } className="avvik">
                <strong>{ avvik.summary?.no || avvik.summary?.en || '' }</strong>
                <p>{ avvik.description?.no || avvik.description?.en || '' }</p>
                <p>{ avvik.advice?.no || avvik.advice?.en || '' }</p>
            </article>
        ) }
    </div>;

const HideableMap: React.FC<{
    id: string
    name: string
    latitude: number
    longitude: number
}> = ({ id, name, latitude, longitude }) => {
    const [ showMap, setShowMap ] = useState(false);

    return (
        <section>
            <Card
                className="hover-hand center"
                onMouseDown={ e => e.stopPropagation() }
                onClick={ e => {
                    e.stopPropagation();
                    setShowMap(!showMap);
                } }
            >
                <a>Vis kart</a>
            </Card>
            { !showMap
                ? null
                : <div className="display-fullscreen">
                    <div
                        className="map-close hover-hand"
                        onMouseDown={ e => e.stopPropagation() }
                        onClick={ e => {
                            e.stopPropagation();
                            setShowMap(!showMap);
                        } }>
                        <Card><a>Lukk</a></Card>
                    </div>
                    <SimpleMap longitude={ longitude } latitude={ latitude }/>
                </div>
            }
        </section>
    );
};

const Avgang: React.FC<AvgangProps> = (props) => {
    const [ showDeviations, setShowDeviations ] = useState(false);
    const { avgang } = props;
    const { quay } = avgang;
    const { latitude, longitude, id, name } = quay;
    const mapLink = createMapLink({ latitude, longitude, navigator: window.navigator });

    const monitoredVehicleJourney = avgang.MonitoredVehicleJourney;
    const VehicleJourneyName = monitoredVehicleJourney.VehicleJourneyName;
    const timestamp = avgang.aimedDepartureTime.format(JourneyDateTimePattern);
    const avgangName = `Linje: ${ monitoredVehicleJourney.PublishedLineName } mot ${ monitoredVehicleJourney.DestinationName }`;

    const hasDeviances = avgang.Extensions.Deviations.length > 0;

    var style = {
        borderLeftColor: '' + avgang.LineColour,
        borderLeftWidth: '0.5rem',
        borderLeftStyle: 'solid'
    };

    return (
        <Card style={ style } onClick={ (ev) => setShowDeviations(!showDeviations) }
              className={ cx({ 'hover-hand': true }) }>
            <div className="avgang">
                <div className="linje">
                    <Link to={ `/journey/${ VehicleJourneyName }/${ timestamp }` }>{ avgangName }</Link>
                </div>
                <div className="avgang-ikon">
                    { avgang.realtime
                        ? <i className="fa fa-wifi"/>
                        : null
                    }
                </div>
                <div className="klokke">
                    { avgang.expectedDepartureTime.format('HH:mm') + ' ' }
                    { avgang.isDelayed
                        ? <span className="delayed">{ avgang.aimedDepartureTime.format('HH:mm') }</span>
                        : null
                    }
                    { hasDeviances
                        ? <span style={ { paddingLeft: '1rem' } }>
                            <i className="warning fa fa-exclamation-triangle"/>
                          </span>
                        : null
                    }
                </div>
                <div className="omtid">
                    <RelativeTime timestamp={ avgang.expectedDepartureTime } refreshRate={ 30000 }/>
                </div>
            </div>
            <ReactCollapse isOpened={ showDeviations }>
                {
                    hasDeviances
                        ? <Deviations deviations={ avgang.Extensions.Deviations }/>
                        : null
                }
                <HideableMap id={ id } name={ name } latitude={ latitude } longitude={ longitude }/>
                <Card className={ 'center' }>
                    <a href={ mapLink } target="_blank">Open in Maps</a>
                </Card>
            </ReactCollapse>
        </Card>
    );
};

export default Avgang;
