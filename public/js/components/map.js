import React, { useState, Component } from 'react';
import PropTypes from 'prop-types';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import { apiKey } from "../util/constants";

const initialZoom = 17;

const GoogleMap = ({ latitude, longitude }) => {
    const gmaps_iframe_src =
        `https://www.google.com/maps/embed/v1/view?key=${apiKey}&zoom=17&center=${latitude},${longitude}`;

    return (
        <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            style={{border:0}}
            src={gmaps_iframe_src}
        />
    );
};

export function createMapLink({ latitude, longitude, navigator }) {
    if ((navigator.platform.indexOf("iPhone") !== -1) ||
        (navigator.platform.indexOf("iPad")   !== -1) ||
        (navigator.platform.indexOf("iPod")   !== -1)) {

        /* if we're on iOS, open in Apple Maps */
        return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&zoom=17`;
    } else {
        // return `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&zoom=17&travelmode=transit`;
        return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&zoom=17`;
    }
}

class SimpleMap extends Component {
    render() {
        const { latitude, longitude, zoom = initialZoom } = this.props;

        const position = [ latitude, longitude ];

        return (
            <Map center={position} zoom={zoom}>
                <TileLayer
                    attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position}>
                    <Popup>
                        A pretty CSS3 popup. <br /> Easily customizable.
                    </Popup>
                </Marker>
            </Map>
        )
    }
}

SimpleMap.propTypes = {
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
    zoom: PropTypes.number,
};

export default SimpleMap;
