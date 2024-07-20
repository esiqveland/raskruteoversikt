import React from 'react';

import { Link, useNavigate } from 'react-router-dom';

import Spinner from './Spinner';
import { SearchState } from "../store/searchstore";
import { Rute } from "../api/types";

const CreateRuteResult: React.FC<{rute: Rute}> = ({ rute }) => {
    const navigate = useNavigate();
    const distance = rute.distance ? `${(rute.distance).toFixed(1)}km` : undefined;

    const lastField = distance || rute.District;
    const lastFieldAlignment = distance ? 'right' : 'left';

    return (
      <tr>
          <td className='hover-hand' onClick={ ev => navigate(`/routes/${ rute.id }`) }>
              <Link to={ `/routes/${ rute.id }` } style={ { width: '100%' } }>
                  { `${ rute.name }` }
              </Link>
          </td>
          <td style={ { textAlign: lastFieldAlignment } }>{ lastField }</td>
      </tr>
    );
  };

interface RuteSokParams {
    // gotoRute: (ruteId: string) => void;
    hasSearched: boolean;
    isLoading: boolean;
    ruter?: Array<Rute>;
    sok: SearchState;
}

const RuteSok: React.FC<RuteSokParams> = ({
    isLoading,
    hasSearched,
    ruter,
    sok
}) => {
  const results = ruter || [];
  if (isLoading) {
    return <section><Spinner /></section>
  }
  if (!hasSearched) {
    return <section />;
  }
  if (results.length === 0) {
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
          {results.map(res => <CreateRuteResult key={res.id} rute={res} />)}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default RuteSok;
