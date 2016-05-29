import React from 'react';
import {connect} from 'react-redux';

import RuteSok from './RuteSok';
import {searchRute} from '../action/actions';
import {RuteType, filterRuterByType} from '../util/ruteutils';

const filterRuteStopp = ((type) =>
    (ruter) => filterRuterByType(ruter, type))(RuteType.STOP);


const Home = React.createClass({
  propTypes: {
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
    const {onSearchRute, sok} = this.props;

    return (
      <article>
        <section style={{marginBottom: '3rem', marginTop: '2rem'}}>
          Rask Rute lar deg slå opp direkte på ditt stopp og viser deg avgangene der i sanntid.
        </section>
        <form onSubmit={this.onSearch.bind(this, onSearchRute)}>
          <div className="row">
            <div className="ten columns">
              <label htmlFor="sokefelt">Søk etter stoppested</label>
              <input className="u-full-width"  ref={(c) => this._searchField = c} type="text" placeholder="Jernbanetorget" id="sokefelt" autoFocus required/>
            </div>
            <div className="two columns">
              <input id="go-sok" type="submit" className="u-full-width button-primary" value="Gå!"/>
            </div>
          </div>
        </form>
        <RuteSok ruter={filterRuteStopp(sok.result)} sok={sok} hasSearched={sok.hasSearched}/>
      </article>
    );
  }
});

const mapStateToProps = (state) => {
  return {
    sok: state.app.sok
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    onSearchRute: (text) => {
      dispatch(searchRute(text));
    }
  }
};


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
