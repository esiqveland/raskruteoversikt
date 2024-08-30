import React, { useState } from 'react';
import cx from 'classnames';
import { Link } from 'react-router-dom';
import { Collapse as ReactCollapse } from 'react-collapse';

import SimpleMap, { createMapLink } from "./SimpleMap";
import RelativeTime from './RelativeTime';
import Card from './Card';
import { JourneyDateTimePattern } from '../util/journey';
import { DeviationSchemaType, EstimatedCallSchemaType } from "../api/types";


export interface AvgangProps {
    avgang: EstimatedCallSchemaType
}

const Deviations: React.FC<{ deviations: Array<DeviationSchemaType> }> = ({ deviations = [] }) =>
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

function getLineName(avgang: EstimatedCallSchemaType): string {
    const frontText = avgang.destinationDisplay.frontText;
    const lineName = avgang.serviceJourney.line.publicCode || avgang.serviceJourney.line.name || '';
    if (avgang.serviceJourney.line.transportMode === 'air') {
        const operatorName = avgang.serviceJourney.line.operator.name;
        // Example id for 'air' travel:
        // id: 'AVI:ServiceJourney:WF873-01-185860967'
        // id: 'AVI:ServiceJourney:SK4083-05-152867944'
        let flightId = avgang.serviceJourney.id || '';
        const parts = flightId.split(':');
        if (parts.length >= 3) {
            const part3 = parts[2] || '';
            const v = part3.split('-');
            flightId = v[0];
        }
        const id = avgang.serviceJourney.line.publicCode || flightId;
        return `✈️ ${ operatorName } (${ id }) til ${ frontText }`;
    }
    if (avgang.serviceJourney.line.transportMode === 'rail') {
        return `Linje: ${ lineName } til ${ frontText }`;
    }
    return `Linje: ${ lineName } mot ${ frontText }`;
}

const Avgang: React.FC<AvgangProps> = (props) => {
    const [ showDeviations, setShowDeviations ] = useState(false);
    const { avgang } = props;
    const { quay } = avgang;
    const { latitude, longitude, id, name } = quay;
    const mapLink = createMapLink({ latitude, longitude, navigator: window.navigator });

    const VehicleJourneyName = avgang.serviceJourney.id;
    const timestamp = avgang.aimedDepartureTime.format(JourneyDateTimePattern);
    const lineName = getLineName(avgang);

    const hasDeviances = avgang.Deviations.length > 0;

    const lineColour = avgang.serviceJourney.line.presentation
        ? '#' + avgang.serviceJourney.line.presentation.colour
        : '';

    var style = {
        borderLeftColor: lineColour,
        borderLeftWidth: '0.5rem',
        borderLeftStyle: 'solid'
    };

    return (
        <Card style={ style } onClick={ (ev) => setShowDeviations(!showDeviations) }
              className={ cx({ 'hover-hand': true }) }>
            <div className="avgang">
                <div className="linje">
                    <Link to={ `/journey/${ VehicleJourneyName }/${ timestamp }` }>{ lineName }</Link>
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
                        ? <Deviations deviations={ avgang.Deviations }/>
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
