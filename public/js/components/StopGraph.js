import React from 'react';
import PropTypes from 'prop-types';

const StopDefaults = {
  armWidth: 10,
  barWidth: 15,
  fontFamily: 'Raleway,helvetica',
  fontSize: 20,
};
const StopProps = {
  stop: PropTypes.shape({
    Name: PropTypes.string.isRequired,
  }).isRequired,
  colour: PropTypes.string.isRequired,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
};

const Stop = ({fontSize, fontFamily, armWidth, barWidth, colour, stop, x, y, height=100, width=150}) => {
  // console.log('Stop', {stop: stop, x: x, y: y, height: height});
  const armLen = 40;
  const textpadding = 10;
  const textX = x + armLen + textpadding;
  return (
    <g>
      <rect fill={colour} x={x} y={y} width={barWidth} height={height}/>
      <rect fill={colour} x={x} y={y+height/2} width={armLen} height={armWidth}/>
      <text x={textX} y={y+armWidth+height/2} fontSize={fontSize} fontFamily={fontFamily}>{stop.Name}</text>
    </g>
  );
};
Stop.defaultProps = StopDefaults;
Stop.propTypes = StopProps;

const StartStop = ({fontSize, fontFamily, armWidth, barWidth, colour, stop, x, y, height=25, width=150}) => {
  // console.log('StartStop', {stop: stop, x: x, y: y, height: height});
  const armLen = 40 + barWidth;
  const textpadding = 10;
  const textX = x + armLen + textpadding;
  return (
    <g>
      <rect fill={colour} x={x+10} y={y} width={barWidth} height={height}/>
      <rect fill={colour} x={x-barWidth/2} y={y} width={armLen} height={armWidth}/>
      <text x={textX} y={y+armWidth} fontSize={fontSize} fontFamily={fontFamily}>{stop.Name}</text>
    </g>
  );
};
StartStop.propTypes = StopProps;
StartStop.defaultProps = StopDefaults;

const FinalStop = ({fontSize, fontFamily, armWidth, barWidth, colour, stop, x, y, height=100, width=150}) => {
  // console.log('FinalStop', {stop: stop, x: x, y: y, height: height});
  const armLen = 40 + barWidth;
  const textpadding = 10;
  const textX = x + armLen + textpadding;
  return (
    <g>
      <rect fill={colour} x={x+10} y={y} width={barWidth} height={height}/>
      <rect fill={colour} x={x-barWidth/2} y={y+height} width={armLen} height={armWidth}/>
      <text x={textX} y={y+height+barWidth/2} fontSize={fontSize} fontFamily={fontFamily}>{stop.Name}</text>
    </g>
  );
};
FinalStop.propTypes = StopProps;
FinalStop.defaultProps = StopDefaults;

const StopsBody = ({colour, stops, height, x, y}) => {
  const stopSize = height / stops.length;
  return (
    <g>
      { stops.map((stop, idx) => 
        <Stop key={idx} colour={colour} x={x} y={y+(stopSize*idx)} height={50} stop={stop}/>)}
    </g>
  );
};

const StopGraph = ({
   height = 800,
   width = 320,
   colour = 'orange',
    ...props,
}) => ({
  render() {
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
      <svg {...props} height={totalHeight}>
        <StartStop colour={colour} stop={start} x={startX} y={startY} height={stopHeight/2}/>
        <StopsBody colour={colour} stops={rest} x={2*startX} y={bodyY} height={bodyHeight}/>
        <FinalStop colour={colour} stop={final} x={finalX} y={finalY} height={stopHeight/2}/>
      </svg>
    );
  }
});

StopGraph.propTypes = {
  colour: PropTypes.string, // The SVG colour to fill chart elements with
  height: PropTypes.number, // Total height of this SVG
  width: PropTypes.number,  // Total width of this SVG
  stops: PropTypes.arrayOf(StopProps.stop).isRequired,
};

export default StopGraph;
