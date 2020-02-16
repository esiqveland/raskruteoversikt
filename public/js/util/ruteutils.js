import { UtmToLatLong, DegToRad, LatLonToUTMXY } from './utmToLatLong';

// BIG thanks to: http://home.hiwaay.net/~taylorc/toolbox/geography/geoutm.html
export const utmToLatLong = (UTMNorthing, UTMEasting) => {
  return UtmToLatLong(UTMEasting, UTMNorthing, 32, false);
};

export const latLonToUTM = (lat, lon) => {
  var xy = new Array(2);

  let latitude = Number(lat.toFixed(6));
  let longitude = Number(lon.toFixed(6));

  // Compute the UTM zone.
  const zone = Math.floor ((lon + 180.0) / 6) + 1;

  LatLonToUTMXY(DegToRad(latitude), DegToRad(longitude), zone, xy);

  return {
    X: parseInt(xy[0], 10),
    Y: parseInt(xy[1], 10),
  }
};

export const filterRuterByType = (ruter, type) => {
  ruter = ruter || [];
  return ruter.filter((rute) => rute.PlaceType === type);
};

export const compose = (...fns) =>
  value => fns.reduce((acc, fn) => fn(acc), value);

export const euclidDistance = (x1, y1, x2, y2) => {
  const dX = x1 - x2;
  const dY = y1 - y2;

  return Math.sqrt(dX * dX + dY * dY);
};

function toRadians(num) {
  return num * Math.PI / 180;
}

/*
 Taken from: http://www.movable-type.co.uk/scripts/latlong.html

 Haversine
 formula:	a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
 c = 2 ⋅ atan2( √a, √(1−a) )
 d = R ⋅ c
 where	φ is latitude, λ is longitude, R is earth’s radius (mean radius = 6,371km);
 note that angles need to be in radians to pass to trig functions!

 JavaScript:
 var R = 6371e3; // metres


 var φ1 = lat1.toRadians();
 var φ2 = lat2.toRadians();
 var Δφ = (lat2-lat1).toRadians();
 var Δλ = (lon2-lon1).toRadians();

 var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
 Math.cos(φ1) * Math.cos(φ2) *
 Math.sin(Δλ/2) * Math.sin(Δλ/2);
 var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

 var d = R * c;

 */
// R is radius of earth (mean radius = 6371km)
// const R = 6371e3; // metres
const R = 6371; // kilometres

export const latLongDistance = (a = { latitude: 100, longitude: 100 }, b = { latitude: -100, longitude: -100 }) => {
  let x1 = toRadians(a.latitude);
  let x2 = toRadians(b.latitude);
  let y1 = toRadians(a.longitude);
  let y2 = toRadians(b.longitude);

  let dx = toRadians(b.latitude - a.latitude);
  let dy = toRadians(b.longitude - a.longitude);

  let ar = Math.sin(dx / 2) * Math.sin(dx / 2) +
    Math.cos(x1) * Math.cos(x2) * Math.sin(dy / 2) * Math.sin(dy / 2);

  let c = 2 * Math.atan2(Math.sqrt(ar), Math.sqrt(1 - ar));

  let distance = R * c;
  return distance;
};

