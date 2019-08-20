import React, { useState } from 'react';
import cx from 'classnames';
import { Link } from 'react-router-dom';
import ReactCollapse from 'react-collapse';

import SimpleMap, { createMapLink } from "./map";
import RelativeTime from './RelativeTime';
import Card from './Card';
import { JourneyDateTimePattern } from '../util/Journey';

const Deviations = ({ deviations = [] }) =>
    <div>
        <h5 style={{ marginBottom: '1rem' }}>Avvik</h5>
        {deviations.map((avvik) =>
            <article key={avvik.id} className="avvik">
                <strong>{avvik.summary['no'] || ''}</strong>
                <p>{avvik.description['no'] || ''}</p>
                <p>{avvik.advice['no'] || ''}</p>
            </article>
        )}
    </div>;

const HideableMap = ({ id, name, latitude, longitude }) => {
    const [ showMap, setShowMap ] = useState(false);

    return (
        <section>
            <Card
                className="hover-hand center"
                onMouseDown={e => e.stopPropagation()}
                onClick={e => {
                    e.stopPropagation();
                    setShowMap(!showMap);
                }}
            >
                <a>Vis kart</a>
            </Card>
            {!showMap
                ? null
                : <div className="display-fullscreen">
                    <div
                        className="map-close hover-hand"
                        onMouseDown={e => e.stopPropagation()}
                        onClick={e => {
                            e.stopPropagation();
                            setShowMap(!showMap);
                        }}>
                        <Card><a>Lukk</a></Card>
                    </div>
                    <SimpleMap longitude={longitude} latitude={latitude}/>
                </div>
            }
        </section>
    );
};

const Avgang = (props) => {
    const [ showDeviations, setShowDeviations ] = useState(false);
    const { avgang } = props;
    const { quay } = avgang;
    const { latitude, longitude, id, name } = quay;
    const mapLink = createMapLink({ latitude, longitude, navigator: window.navigator });

    const { VehicleJourneyName } = avgang;
    const timestamp = avgang.AimedDepartureTime.format(JourneyDateTimePattern);
    const avgangName = `Linje: ${avgang.PublishedLineName} mot ${avgang.DestinationName}`;
    const renderDelayed = (avgang) => <span className="delayed">{avgang.AimedDepartureTime.format('HH:mm')}</span>;

    const hasDeviances = avgang.Extensions.Deviations.length > 0;

    var style = {
        borderLeftColor: '#' + avgang.LineColour,
        borderLeftWidth: '0.5rem',
        borderLeftStyle: 'solid'
    };

    return (
        <Card style={style} onClick={() => setShowDeviations(!showDeviations)} className={cx({ 'hover-hand': true })}>
            <div className="avgang">
            <div className="linje">
                <Link to={`/journey/${VehicleJourneyName}/${timestamp}`}>{avgangName}</Link>
            </div>
            <div className="avgang-ikon">
            { avgang.realtime
                ? <i className="fa fa-wifi" />
                : null
            }
            </div>
            <div className="klokke">
                {avgang.ExpectedDepartureTime.format('HH:mm') + ' '}
                {avgang.isDelayed ? renderDelayed(avgang) : null}
                {hasDeviances ?
                    <span style={{ paddingLeft: '1rem' }}><i className="warning fa fa-exclamation-triangle"/></span>
                    : null}
            </div>
            <div className="omtid"><RelativeTime timestamp={avgang.ExpectedDepartureTime} refreshRate={30000}/></div>
            </div>
            <ReactCollapse isOpened={showDeviations}>
                {
                    hasDeviances
                        ? <Deviations deviations={avgang.Extensions.Deviations}/>
                        : null
                }
                <HideableMap id={id} name={name} latitude={latitude} longitude={longitude}/>
                <Card className={'center'}>
                    <a href={mapLink} target="_blank">Open in Maps</a>
                </Card>
            </ReactCollapse>
        </Card>
    );
};

export default Avgang;
