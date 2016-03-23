import React from 'react';

import {Link} from 'react-router';

const createRuteResult = (rute) => {
  return (
    <div key={rute.ID} className="rute">
      <div><Link to={`/routes/${rute.ID}`}>{rute.Name}</Link></div>
    </div>
  )
};

const RuteSok = ({hasSearched, ruter}) => {
  const results = ruter || [];
  if (!hasSearched) {
    return <section></section>;
  }
  if (results.length == 0) {
    return <section className="row rute-list">{'Ingen treff!'}</section>;
  }
  return (
    <section className="row rute-list">
      <div className="large-12 columns">
        <h4>Ser du etter...</h4>
      </div>
      <div className="large-12 columns">
        {results.map(createRuteResult)}
      </div>
    </section>
  );
};

RuteSok.propTypes = {
  ruter: React.PropTypes.arrayOf(React.PropTypes.shape({
    ID: React.PropTypes.number.isRequired,
    Name: React.PropTypes.string.isRequired,
  })).isRequired,
  hasSearched: React.PropTypes.bool.isRequired,
};

export default RuteSok;