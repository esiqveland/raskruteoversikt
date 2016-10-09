import React from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux'
import { withState } from 'recompose'
import ReactCollapse from 'react-collapse'

import RuteSok from './RuteSok';
import { searchRute, ruteSearchRequest, getClosestRequest, trackLocation } from '../action/actions';
import { RuteType, filterRuterByType } from '../util/ruteutils';

const filterRuteStopp = ((type) =>
  (ruter) => filterRuterByType(ruter, type))(RuteType.STOP);


const Alert = withState('isOpen', 'setOpen', true)(({ isOpen, setOpen, error }) => {
  let content = <span />;
  if (error) {
    content =
      <div className="alert alert-warning hover-hand" onClick={() => setOpen(!isOpen)}>
        {error}
      </div>;
  }
  return (
    <ReactCollapse isOpened={isOpen}>
      { content }
    </ReactCollapse>
  );
});


const Home = React.createClass({
  propTypes: {
    findClosest: React.PropTypes.func.isRequired,
    gotoRute: React.PropTypes.func.isRequired,
    onSearchRute: React.PropTypes.func.isRequired,
    position: React.PropTypes.shape({
      error: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.bool,
      ]).isRequired,
    }),
    sok: React.PropTypes.shape({
      hasSearched: React.PropTypes.bool.isRequired,
    }).isRequired,
  },
  onSearch(event) {
    const { onSearchRute } = this.props;
    if (typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    const text = this._searchField.value;
    if (text) {
      onSearchRute(text);
    }
  },
  render() {
    const { gotoRute, onSearchRute, sok, findClosest, position } = this.props;
    const { hasSearched } = sok;

    return (
      <article>
        <section style={{ marginBottom: '3rem', marginTop: '2rem' }}>
          Rask Rute lar deg slå opp direkte på ditt stopp og viser deg avgangene der i sanntid.
        </section>
        <form className='form sok' onSubmit={(ev) => onSearch(ev)}>
            <div className='form-item sok-item'>
              <label htmlFor='sokefelt'>Søk etter stoppested</label>
              <input ref={(c) => this._searchField = c} className="u-full-width" type='text'
                     placeholder='Jernbanetorget' id='sokefelt' autoFocus required/>
            </div>
            <div className='form-item sok-item'>
              <label id='sok-btn-label' htmlFor='go-sok'>&nbsp;</label>
              <input id='go-sok' type='submit' className='button-primary u-full-width' value='Finn stopp!'/>
            </div>
        </form>
        <form onSubmit={(ev) => { ev.preventDefault(); findClosest(); }}>
          <div className="form-item">
            <button type="submit" className="button-primary u-full-width">
              {'Nær meg nå'}
              <i className="fa fa-location-arrow u-pull-right" style={{fontSize: '18px', lineHeight: '34px'}} aria-hidden="true"></i>
            </button>
          </div>
          <Alert error={hasSearched && position.error} />
        </form>
        <RuteSok ruter={filterRuteStopp(sok.result)} sok={sok} gotoRute={gotoRute} hasSearched={sok.hasSearched}/>
      </article>
    );
  }
});

const mapStateToProps = state => {
  return {
    sok: state.app.sok,
    position: state.app.position,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    findClosest: () => {
      dispatch(trackLocation())
        .then(data => {
          console.log('trackLocation, starting getClosestRequest', data);
          if (data.error) {
          } else {
            dispatch(getClosestRequest());
          }
        })
    },
    gotoRute: routeId => dispatch(push(`/routes/${routeId}`)),
    onSearchRute: (text) => dispatch(searchRute(text))
  };
}


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
