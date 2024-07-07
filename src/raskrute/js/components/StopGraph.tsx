import React from 'react';
import { JourneySchemaStopWithDiff } from "../action/api";

interface StopData extends JourneySchemaStopWithDiff {
}

export interface StopProps {
    fontFamily?: string
    fontSize?: number
    armWidth?: number
    barWidth?: number
    stop: StopData
    colour: string
    x: number
    y: number
    height?: number
    width?: number
}

const defaultFont: string = 'Raleway,helvetica';
const defaultBarWidth = 15;
const defaultArmWidth = 10;

const Stop: React.FC<StopProps> = ({
                                       fontFamily = defaultFont,
                                       armWidth = defaultArmWidth,
                                       barWidth = defaultBarWidth,
                                       fontSize = 20,
                                       colour,
                                       stop,
                                       x,
                                       y,
                                       height = 100,
                                   }) => {
    // console.log('Stop', {stop: stop, x: x, y: y, height: height});
    const armLen = 40;
    const textpadding = 10;
    const textX = x + armLen + textpadding;
    let durationText = '';
    if (stop.durationShort) {
        durationText = durationText + stop.durationShort + ' ';
    }
    if (stop.depTime) {
        durationText = durationText + `[${ stop.depTime }]`;
    }
    const link = stop.quay?.stopPlace?.id ? `/routes/${ stop.quay.stopPlace?.id }` : `/search/${ stop.quay.name }`;

    return (
        <g>
            <rect fill={ colour } x={ x } y={ y } width={ barWidth } height={ height }/>
            <rect fill={ colour } x={ x } y={ y + height / 2 } width={ armLen } height={ armWidth }/>
            <text x={ textX + 10 } y={ y + armWidth - (height * 0.10) } fontSize={ fontSize - 10 } fontFamily={ 'Helvetica' } fill={ 'grey' }>{ durationText }</text>
            <a href={ link }>
                <text x={ textX } y={ y + armWidth + height / 2 } fontSize={ fontSize } fontFamily={ fontFamily }>{ stop.quay.name }</text>
            </a>
        </g>
    );
};

const StartStop: React.FC<StopProps> = ({
                                            fontSize = 20,
                                            fontFamily = defaultFont,
                                            armWidth = defaultArmWidth,
                                            barWidth = defaultBarWidth,
                                            colour,
                                            stop,
                                            x,
                                            y,
                                            height = 25,
                                        }) => {
    // console.log('StartStop', {stop: stop, x: x, y: y, height: height});
    const armLen = 40 + barWidth;
    const textpadding = 10;
    const textX = x + armLen + textpadding;
    const link = stop.quay?.stopPlace?.id ? `/routes/${ stop.quay.stopPlace?.id }` : `/search/${ stop.quay.name }`;

    return (
        <g>
            <rect fill={ colour } x={ x + 10 } y={ y } width={ barWidth } height={ height }/>
            <rect fill={ colour } x={ x - barWidth / 2 } y={ y } width={ armLen } height={ armWidth }/>
            <a href={link}>
                <text x={ textX } y={ y + armWidth } fontSize={ fontSize } fontFamily={ fontFamily }>{ stop.quay.name }</text>
            </a>
        </g>
    );
};

const FinalStop: React.FC<StopProps> = ({
                                            fontSize = 20,
                                            fontFamily = defaultFont,
                                            armWidth = defaultArmWidth,
                                            barWidth = defaultBarWidth,
                                            colour,
                                            stop,
                                            x,
                                            y,
                                            height = 100,
                                        }) => {
    // console.log('FinalStop', {stop: stop, x: x, y: y, height: height});
    const armLen = 40 + barWidth;
    const textpadding = 10;
    const textX = x + armLen + textpadding;
    let durationText = '';
    if (stop.durationShort) {
        durationText = durationText + stop.durationShort + ' ';
    }
    if (stop.depTime) {
        durationText = durationText + `[${ stop.depTime }]`;
    }
    const link = stop.quay?.stopPlace?.id ? `/routes/${ stop.quay.stopPlace?.id }` : `/search/${ stop.quay.name }`;

    return (
        <g>
            <rect fill={ colour } x={ x + 10 } y={ y } width={ barWidth } height={ height }/>
            <rect fill={ colour } x={ x - barWidth / 2 } y={ y + height } width={ armLen } height={ armWidth }/>
            <text x={ textX + 10 } y={ y + armWidth - (height * 0.15) } fontSize={ fontSize - 10 }
                  fontFamily={ 'Helvetica' } fill={ 'grey' }>{ durationText }</text>
            <a href={link}>
                <text x={ textX } y={ y + height + barWidth / 2 } fontSize={ fontSize } fontFamily={ fontFamily }>{ stop.quay.name }</text>
            </a>
        </g>
    );
};

interface StopsBodyProps {
    colour: string
    x: number
    y: number
    height: number
    width: number
    stops: Array<StopData>
}

const StopsBody: React.FC<Omit<StopsBodyProps, "width">> = ({ colour, stops, height, x, y }) => {
    const stopSize = height / stops.length;
    return (
        <g>
            { stops.map((stop, idx) =>
                <Stop key={ idx } colour={ colour } x={ x } y={ y + (stopSize * idx) } height={ 50 } stop={ stop }/>) }
        </g>
    );
};

export interface StopGraphProps {
    colour: string; // The SVG colour to fill chart elements with
    height: number; // Total height of this SVG
    width: number;  // Total width of this SVG
    // stops: Array<{ Name: string }>;
    stops: Array<StopData>;
}

const StopGraph: React.FC<StopGraphProps> = ({
                                                 height = 800,
                                                 width = 320,
                                                 colour = 'orange',
                                                 ...props
                                             }) => {
    const stopHeight = 50;
    const startY = 10;
    const startX = 10;
    const finalX = 10;
    const totalHeight = props.stops ? (props.stops.length + 3) * stopHeight : height;

    const stops = props.stops || [];
    const start = stops[0];
    const final = stops[stops.length - 1];
    const rest = stops
        .filter((stop, idx) => idx !== stops.length - 1 && idx !== 0);

    const bodyHeight = rest.length * stopHeight;
    const bodyY = startY + stopHeight / 2;
    const finalY = bodyY + bodyHeight;

    return (
        <svg { ...props } height={ totalHeight }>
            <StartStop colour={ colour } stop={ start } x={ startX } y={ startY } height={ stopHeight / 2 }/>
            <StopsBody colour={ colour } stops={ rest } x={ 2 * startX } y={ bodyY } height={ bodyHeight }/>
            <FinalStop colour={ colour } stop={ final } x={ finalX } y={ finalY } height={ stopHeight / 2 }/>
        </svg>
    );
};

export default StopGraph;
