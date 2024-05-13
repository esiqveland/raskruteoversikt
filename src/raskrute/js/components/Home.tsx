import React, { FormEvent, useState } from 'react';
import { useDispatch } from 'react-redux';
import { push } from '@lagunovsky/redux-react-router';
import { Collapse as ReactCollapse } from 'react-collapse';

import RuteSok from './RuteSok';
import { filterRuterByType } from '../util/ruteutils';
import { Position, Rute, RuteType } from "../api/types";
import { useRuteStore } from "../store";

const filterRuteStopp = ((type: RuteType) => (ruter: Array<Rute>) => filterRuterByType(ruter, type))(RuteType.STOP);

export const Alert: React.FC<{ error: string | undefined | React.ReactNode }> = ({ error }) => {
    const [ isOpen, setOpen ] = useState(true);

    let content = <span/>;
    if (error) {
        content = (
            <div className="alert alert-warning hover-hand" onClick={ () => setOpen(!isOpen) }>
                { error }
            </div>
        );
    }
    return (
        <ReactCollapse isOpened={ isOpen }>
            { content }
        </ReactCollapse>
    );
};

interface HomeProps {}

const Home: React.FC<HomeProps> = (props) => {
    const reduxDispatch = useDispatch();
    const { dispatch, search, location } = useRuteStore('search', 'location');

    const setSearchResults = (ruter: Array<Rute> | undefined) => dispatch('search/setSearch', ruter);
    const setSearchTerm = (val: string) => dispatch('search/search', val);
    const onSearchRute = (ev: FormEvent) => {
        ev.preventDefault();
        if (search.searchTerm) {
            dispatch('location/setClosest', undefined);
            dispatch('search/api/search', search.searchTerm);
        }
    };
    const onFindClosest = (pos?: Position) => {
        dispatch('search/search', '');
        dispatch('search/setSearch', undefined);
        dispatch('location/getClosest', pos);
    };
    const gotoRute = (routeId: string) => {
        reduxDispatch(push(`/routes/${routeId}`))
    }
    const { hasSearched, searchTerm, result: sokResults } = search;

    const stoppList = filterRuteStopp(location.closest || sokResults || []);

    return (
        <article>
            <section style={ { marginBottom: '3rem', marginTop: '2rem' } }>
                Rask Rute lar deg slå opp direkte på ditt stopp og viser deg avgangene der i sanntid.
            </section>
            <form className='form sok' onSubmit={ onSearchRute }>
                <div className='form-item sok-item'>
                    <label htmlFor='sokefelt'>Søk etter stoppested</label>
                    <input
                        className="u-full-width"
                        type='text'
                        value={ searchTerm }
                        onChange={ ev => setSearchTerm(ev.target.value) }
                        placeholder='Jernbanetorget'
                        id='sokefelt'
                        autoFocus
                        required
                    />
                </div>
                <div className='form-item sok-item'>
                    <label id='sok-btn-label' htmlFor='go-sok'>&nbsp;</label>
                    <button id='go-sok' type='submit' className='button-primary center u-full-width'>
                        { 'Finn stopp!' }
                    </button>
                </div>
            </form>
            <form
                onSubmit={ (ev) => {
                    ev.preventDefault();
                    setSearchResults(undefined);
                    onFindClosest(location.position);
                } }>
                <div className='form-item'>
                    <button type='submit' className='button-primary u-full-width'>
                        { 'Nær meg nå' }
                        <i
                            className='fa fa-location-arrow u-pull-right'
                            style={ { fontSize: '18px', lineHeight: '34px' } }
                        />
                    </button>
                </div>
                <Alert error={ hasSearched && (location.error || search.error) }/>
            </form>
            <RuteSok
                ruter={ stoppList }
                isLoading={ location.loading || search.isFetching }
                sok={ search }
                gotoRute={ gotoRute }
                hasSearched={ search.hasSearched || (location.closest && true) || false }
            />
        </article>
    );
};

export { Home };
export default Home;
