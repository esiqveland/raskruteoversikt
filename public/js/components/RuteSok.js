import React from 'react';
const PropTypes = React.PropTypes;

import {Link} from 'react-router';

import Spinner from './spinner';

const createRuteResult = (rute) => {
  return (
    <div key={rute.ID} className="row rute">
      <div className="twelve columns"><Link to={`/routes/${rute.ID}`}>{rute.Name}</Link></div>
    </div>
  )
};

const RuteSok = ({hasSearched, ruter, sok}) => {
  const results = ruter || [];
  if(sok.isFetching) {
    return <section><Spinner /></section>
  }
  if (!hasSearched) {
    return <section></section>;
  }
  if (results.length == 0) {
    return <section className="rute-list">{'Ingen treff!'}</section>;
  }
  return (
    <section className="rute-list">
      <div>
        <h4>Ser du etter...</h4>
      </div>
      <div className="sok-result">
        {results.map(createRuteResult)}
      </div>
    </section>
  );
};

RuteSok.propTypes = {
  sok: React.PropTypes.shape({
    isFetching: PropTypes.bool.isRequired,
  }),
  ruter: React.PropTypes.arrayOf(React.PropTypes.shape({
    ID: React.PropTypes.number.isRequired,
    Name: React.PropTypes.string.isRequired,
  })).isRequired,
  hasSearched: React.PropTypes.bool.isRequired,
};

export default RuteSok;