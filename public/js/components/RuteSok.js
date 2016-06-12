import React from 'react';
const PropTypes = React.PropTypes;

import {Link} from 'react-router';

import Spinner from './spinner';

const createRuteResult = (gotoRute) =>
  (rute) => {
    return (
      <tr key={rute.ID}>
        <td onClick={() => gotoRute(rute.ID)} className="hover-hand">
          <Link to={`/routes/${rute.ID}`}>{`${rute.Name}`}</Link>
        </td>
        <td>{`${rute.District}`}</td>
      </tr>
    )
  };

const RuteSok = ({gotoRute, hasSearched, ruter, sok}) => {
  const results = ruter || [];
  if (sok.isFetching) {
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
        <table className="u-full-width">
          <tbody>
          {results.map(createRuteResult(gotoRute))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

RuteSok.propTypes = {
  gotoRute: React.PropTypes.func.isRequired,
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