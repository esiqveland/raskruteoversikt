import React, { useState, useEffect, FormEvent } from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { Collapse as ReactCollapse } from 'react-collapse';
import PropTypes from 'prop-types';

import RuteSok from './RuteSok';
import {searchRute, getClosestRequest, trackLocation} from '../action/actions';
import { filterRuterByType } from '../util/ruteutils';

import ReactGA from 'react-ga';
import { Position, Rute, RuteType } from "../api/types";
import { SearchState } from "../store/searchstore";
import useStoreon from "storeon/react";
import { AppEvents, AppState } from "../store";

const filterRuteStopp = ((type : RuteType) => (ruter: Array<Rute>) => filterRuterByType(ruter, type))(RuteType.STOP);

const Alert: React.FC<{ error: any }> = ({ error }) => {
    const [ isOpen, setOpen ] = useState(true);

    let content = <span />;
    if (error) {
        content = (
            <div className="alert alert-warning hover-hand" onClick={() => setOpen(!isOpen)}>
                {error}
            </div>
        );
    }
    return (
        <ReactCollapse isOpened={isOpen}>
            { content }
        </ReactCollapse>
    );
};

interface HomeProps {
    gotoRute: (id: string) => void,
    findClosest: () => void,
}

type SearchHandler = (q: string) => void

function onSearch(event : FormEvent<HTMLFormElement>, searchTerm : string, onSearchRute : SearchHandler) {
    event.preventDefault();
    if (searchTerm) {
        onSearchRute(searchTerm)
    }
}

const Home: React.FC<HomeProps> = (props) => {
    const { dispatch, search, location } = useStoreon<AppState, AppEvents>('search', 'location');

    const setSearchResults = (ruter : Array<Rute> | undefined) => dispatch('search/setSearch', ruter);
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

    const { gotoRute } = props;
    const { hasSearched, searchTerm, result: sokResults } = search;

    const stoppList = filterRuteStopp(location.closest || sokResults || []);

    const setSearchTerm = (val: string) => dispatch('search/search', val);

    return (
        <article>
            <section style={{ marginBottom: '3rem', marginTop: '2rem' }}>
                Rask Rute lar deg slå opp direkte på ditt stopp og viser deg avgangene der i sanntid.
            </section>
            <form className='form sok' onSubmit={onSearchRute}>
                <div className='form-item sok-item'>
                    <label htmlFor='sokefelt'>Søk etter stoppested</label>
                    <input className="u-full-width"
                           type='text'
                           value={searchTerm}
                           onChange={ev => setSearchTerm(ev.target.value)}
                           placeholder='Jernbanetorget'
                           id='sokefelt'
                           autoFocus
                           required
                    />
                </div>
                <div className='form-item sok-item'>
                    <label id='sok-btn-label' htmlFor='go-sok'>&nbsp;</label>
                    <button id='go-sok' type='submit' className='button-primary center u-full-width'>
                        {'Finn stopp!'}
                    </button>
                </div>
            </form>
            <form onSubmit={(ev) => {
                ev.preventDefault();
                setSearchResults(undefined);
                onFindClosest(location.position);
            }}>
                <div className='form-item'>
                    <button type='submit' className='button-primary u-full-width'>
                        {'Nær meg nå'}
                        <i
                            className='fa fa-location-arrow u-pull-right'
                            style={{ fontSize: '18px', lineHeight: '34px' }}
                        />
                    </button>
                </div>
                <Alert error={hasSearched && (location.error || search.error)}/>
            </form>
            <RuteSok
                ruter={stoppList}
                isLoading={location.loading || search.isFetching}
                sok={search}
                gotoRute={gotoRute}
                hasSearched={search.hasSearched || (location.closest && true)}
            />
        </article>
    );
};

const mapDispatchToProps = (dispatch: any) => {
    return {
        gotoRute: (routeId: string) => dispatch(push(`/routes/${routeId}`)),
    };
};

export { Home };

function mapStateToProps() {
    return {};
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Home);
