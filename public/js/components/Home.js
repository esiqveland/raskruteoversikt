import React from 'react';
import {connect} from 'react-redux';
import { push } from 'react-router-redux'

import RuteSok from './RuteSok';
import {searchRute} from '../action/actions';
import {RuteType, filterRuterByType} from '../util/ruteutils';

const filterRuteStopp = ((type) =>
    (ruter) => filterRuterByType(ruter, type))(RuteType.STOP);


const Home = React.createClass({
  propTypes: {
    gotoRute: React.PropTypes.func.isRequired,
    onSearchRute: React.PropTypes.func.isRequired,
    sok: React.PropTypes.shape({
      hasSearched: React.PropTypes.bool.isRequired,
    }).isRequired,
  },
  onSearch(onSearchRute, event) {
    if (typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    let text = this._searchField.value;
    if (text) {
      onSearchRute(text);
    }
  },
  render() {
    const {gotoRute, onSearchRute, sok} = this.props;

    return (
      <article>
        <section style={{marginBottom: '3rem', marginTop: '2rem'}}>
          Rask Rute lar deg slå opp direkte på ditt stopp og viser deg avgangene der i sanntid.
        </section>
        <form onSubmit={this.onSearch.bind(this, onSearchRute)}>
          <div className='form sok'>
            <div className='form-item sok-item'>
              <label htmlFor='sokefelt'>Søk etter stoppested</label>
              <input ref={(c) => this._searchField = c} className="u-full-width" type='text' placeholder='Jernbanetorget' id='sokefelt' autoFocus required/>
            </div>
            <div className='form-item sok-item'>
              <label id='sok-btn-label' htmlFor='go-sok'>&nbsp;</label>
              <input id='go-sok' type='submit' className='button-primary u-full-width' value='Gå!'/>
            </div>
          </div>
        </form>
        <RuteSok ruter={filterRuteStopp(sok.result)} sok={sok} gotoRute={gotoRute} hasSearched={sok.hasSearched}/>
      </article>
    );
  }
});

const mapStateToProps = state => {
  return {
    sok: state.app.sok
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    gotoRute: routeId => {
      dispatch(push(`/routes/${routeId}`))
    },
    onSearchRute: (text) => {
      dispatch(searchRute(text));
    }
  }
};


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
