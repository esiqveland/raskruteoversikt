import moment from 'moment';

export const JourneyDateTimePattern = 'DDMMYYYYHHmmss';

export const parseJourneyTimestamps = (journey) => {
  journey.Stops = journey.Stops.map(stop => {
    stop.ArrivalTime = moment(stop.ArrivalTime);
    stop.DepartureTime = moment(stop.DepartureTime);
    return stop;
  });
  return journey;
};

export const calculateDepartureDiffs = (journey) => {
  let prev = undefined;
  let elapsed = 0;
  journey.Stops = journey.Stops.map((stop) => {
    const depTime = stop.DepartureTime.format('HH:mm');
    let diffTime = undefined;
    if (prev) {
      diffTime = moment.duration(stop.DepartureTime.diff(prev.DepartureTime)).minutes();
      elapsed += diffTime;
    }
    let duration = '';
    diffTime ? duration = ` (${elapsed} min)` : duration = '';
    let durationShort = '';
    diffTime ? durationShort = `+ ${diffTime} min` : duration = '';

    prev = stop;
    return Object.assign({}, stop, {duration: duration, durationShort: durationShort, diffTime: diffTime, elapsed: elapsed, depTime: depTime});
  });
  return journey;
};
