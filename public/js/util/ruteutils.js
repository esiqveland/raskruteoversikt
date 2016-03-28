export const RuteType = {
  STOP: 'Stop',
  AREA: 'Area',
  POI: 'POI',
  STREET: 'Street',
};

export const filterRuterByType = (ruter, type) => {
  ruter = ruter || [];
  return ruter.filter((rute) => rute.PlaceType === type);
};

export const compose = (...fns) =>
  (value) => fns.reduce( (acc, fn) => fn(acc), value);
