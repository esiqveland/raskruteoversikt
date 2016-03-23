export const RuteType = {
  STOP: 0,
  AREA: 1,
  POI: 2,
  ADDR: 3
};

export const filterRuterByType = (ruter, type) => {
  ruter = ruter || [];
  return ruter.filter((rute) => rute.Type === type);
};

export const compose = (...fns) =>
  (value) => fns.reduce( (acc, fn) => fn(acc), value);
