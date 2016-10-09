
export const position = state => state.app.position;
export const location = state => {
  const { position } = state.app.position;
  if (!position) {
    return { latitude: undefined, longitude: undefined };
  }
  const { coords } = position;
  if (!coords) {
    return { latitude: undefined, longitude: undefined };
  }
  const { latitude, longitude } = coords;

  return { latitude, longitude };
};
