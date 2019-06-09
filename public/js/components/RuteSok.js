import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';

import Spinner from './spinner';

const createRuteResult = (gotoRute) =>
  (rute) => {
    return (
      <tr key={rute.ID}>
        <td onClick={() => gotoRute(rute.ID)} className='hover-hand'>
          <Link to={`/routes/${rute.ID}`}>{`${rute.Name}`}</Link>
        </td>
        <td>{`${rute.District}`}</td>
      </tr>
    );
  };

const RuteSok = ({gotoRute, hasSearched, ruter, sok}) => {
  const results = ruter || [];
  if (sok.isFetching) {
    return <section><Spinner /></section>
  }
  if (!hasSearched) {
    return <section />;
  }
  if (results.length == 0) {
    return <section className='rute-list'>{'Ingen treff!'}</section>;
  }
  return (
    <section className='rute-list'>
      <div>
        <h4>Ser du etter...</h4>
      </div>
      <div className='sok-result'>
        <table className='u-full-width'>
          <tbody>
          {results.map(createRuteResult(gotoRute))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

RuteSok.propTypes = {
  gotoRute: PropTypes.func.isRequired,
  sok: PropTypes.shape({
    isFetching: PropTypes.bool.isRequired,
  }),
  ruter: PropTypes.arrayOf(PropTypes.shape({
    ID: PropTypes.number.isRequired,
    Name: PropTypes.string.isRequired,
  })).isRequired,
  hasSearched: PropTypes.bool.isRequired,
};

export default RuteSok;
