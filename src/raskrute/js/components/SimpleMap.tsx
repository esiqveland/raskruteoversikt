import * as React from 'react';
import { useEffect, useRef } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import { apiKey } from '../util/constants';

const initialZoom = 17;

export const GoogleMap: React.FC<{
    latitude: number,
    longitude: number,
}> = ({ latitude, longitude }) => {
    const gmaps_iframe_src =
        `https://www.google.com/maps/embed/v1/view?key=${ apiKey }&zoom=17&center=${ latitude },${ longitude }`;

    return (
        <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            style={ { border: 0 } }
            src={ gmaps_iframe_src }
        />
    );
};

export interface CreateMapArgs {
    latitude: number,
    longitude: number,
    navigator: Navigator,
}

export const createMapLink: (a: CreateMapArgs) => string = ({
                                                                latitude,
                                                                longitude,
                                                                navigator,
                                                            }): string => {
    if ((navigator.platform.indexOf("iPhone") !== -1) ||
        (navigator.platform.indexOf("iPad") !== -1) ||
        (navigator.platform.indexOf("iPod") !== -1)) {

        /* if we're on iOS, open in Apple Maps */
        return `https://www.google.com/maps/search/?api=1&query=${ latitude },${ longitude }&zoom=17`;
    } else {
        // return `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&zoom=17&travelmode=transit`;
        return `https://www.google.com/maps/search/?api=1&query=${ latitude },${ longitude }&zoom=17`;
    }
}

const SimpleMap: React.FC<{
    latitude: number,
    longitude: number,
    zoom?: number,
}> = ({ latitude, longitude, zoom = initialZoom }) => {
    const position = { lat: latitude, lng: longitude };
    const divRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        if (divRef.current) {
            L.DomEvent.disableClickPropagation(divRef.current);
        }
    }, [ divRef.current ]);
    return (
        <div
            ref={ divRef }
            onClick={ev => ev.stopPropagation()}
            onMouseDown={ev => ev.stopPropagation()}
            //onMouseUp={ev => ev.stopPropagation()}
            //onDrag={ev => ev.stopPropagation()}
            //onDragEnd={ev => ev.stopPropagation()}
            //onDragStart={ev => ev.stopPropagation()}
            style={{ width: '100%', height: '100%', position: 'absolute'}}
        >
            <MapContainer closePopupOnClick={ false } center={ position } zoom={ zoom }>
                <TileLayer
                    // attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={ position }>
                    <Popup>
                        A pretty CSS3 popup. <br/> Easily customizable.
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    )
}

export default SimpleMap;
