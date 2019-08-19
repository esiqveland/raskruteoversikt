import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import ReactCollapse from 'react-collapse'
import PropTypes from 'prop-types';

import RuteSok from './RuteSok';
import {searchRute, getClosestRequest, trackLocation} from '../action/actions';
import {RuteType, filterRuterByType} from '../util/ruteutils';

const filterRuteStopp = ((type) =>
    (ruter) => filterRuterByType(ruter, type))(RuteType.STOP);


let Alert = ({ error }) => {
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

const Home = (props) => {
    function onSearch(event, searchTerm, onSearchRute) {
        if (typeof event.preventDefault === 'function') {
            event.preventDefault();
        }
        if (searchTerm) {
            onSearchRute(searchTerm);
        }
    }

    const { gotoRute, onSearchRute, sok, findClosest, position } = props;
    const { hasSearched } = sok;

    const [ searchTerm, setSearchTerm ] = useState('');

    return (
        <article>
            <section style={{ marginBottom: '3rem', marginTop: '2rem' }}>
                Rask Rute lar deg slå opp direkte på ditt stopp og viser deg avgangene der i sanntid.
            </section>
            <form className='form sok' onSubmit={(ev) => onSearch(ev, searchTerm, onSearchRute)}>
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
                    <input id='go-sok' type='submit' className='button-primary u-full-width' value='Finn stopp!'/>
                </div>
            </form>
            <form onSubmit={(ev) => {
                ev.preventDefault();
                findClosest();
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
                <Alert error={hasSearched && position.error}/>
            </form>
            <RuteSok
                ruter={filterRuteStopp(sok.result)}
                sok={sok}
                gotoRute={gotoRute}
                hasSearched={sok.hasSearched}
            />
        </article>
    );
};

Home.propTypes = {
    findClosest: PropTypes.func.isRequired,
    gotoRute: PropTypes.func.isRequired,
    onSearchRute: PropTypes.func.isRequired,
    position: PropTypes.shape({
        error: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.bool,
        ]).isRequired,
    }),
    sok: PropTypes.shape({
        hasSearched: PropTypes.bool.isRequired,
    }).isRequired,
};

const mapStateToProps = state => {
    return {
        sok: state.app.sok,
        position: state.app.position,
    };
};

import ReactGA from 'react-ga';

const mapDispatchToProps = (dispatch) => {
    return {
        findClosest: () => {
            ReactGA.event({
                category: 'Clicks',
                action: 'Find closest',
                label: 'Button',
            });
            dispatch(trackLocation())
                .then(data => {
                    console.log('trackLocation, starting getClosestRequest', data);
                    if (data.error) {
                    } else {
                        dispatch(getClosestRequest());
                    }
                })
                .catch(err => { console.log('err', err) })
        },
        gotoRute: routeId => dispatch(push(`/routes/${routeId}`)),
        onSearchRute: (text) => {
            ReactGA.event({
                category: 'Search',
                action: 'Search route',
                label: 'Search',
                value: text,
            });
            return dispatch(searchRute(text))
        }
    };
};

export {Home};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Home);
