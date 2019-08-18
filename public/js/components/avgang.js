import React from 'react';
import cx from 'classnames';
import { Link } from 'react-router-dom';
import ReactCollapse from 'react-collapse';

import RelativeTime from './RelativeTime';
import Card from './Card';
import { JourneyDateTimePattern } from '../util/Journey';


import createReactClass from "create-react-class";

const Deviations = ({deviations}) =>
  <div>
    <h5 style={{marginBottom: '1rem'}}>Avvik</h5>
      {deviations.map((avvik) =>
          <article key={avvik.id} className="avvik">
            <strong>{avvik.summary['no'] || ''}</strong>
            <p>{avvik.description['no'] || ''}</p>
            <p>{avvik.advice['no'] || ''}</p>
          </article>
      )}
  </div>;

const Avgang = createReactClass({
  getInitialState() {
    return {showDeviations: false}
  },
  _onClick(hasDeviances, ev) {
    ev.preventDefault();
    if (!hasDeviances) {
      return;
    }
    this.setState({showDeviations: !this.state.showDeviations});
  },
  render(){
    const {avgang} = this.props;
    const {showDeviations} = this.state;

    const {VehicleJourneyName} = avgang;
    const timestamp = avgang.AimedDepartureTime.format(JourneyDateTimePattern);
    const avgangName = `Linje: ${avgang.PublishedLineName} mot ${avgang.DestinationName}`;
    const renderDelayed = (avgang) => <span className="delayed">{avgang.AimedDepartureTime.format('HH:mm')}</span>;
    const hasDeviances = avgang.Extensions.Deviations.length > 0;
    var style = {
      borderLeftColor: '#'+avgang.LineColour,
      borderLeftWidth: '0.5rem',
      borderLeftStyle: 'solid'
    };
    return (
      <Card style={style} onClick={this._onClick.bind(this, hasDeviances)} className={cx({'hover-hand': hasDeviances})}>
        <div className="linje">
          <Link to={`/journey/${VehicleJourneyName}/${timestamp}`}>{avgangName}</Link>
        </div>
        <div className="klokke">
          {avgang.ExpectedDepartureTime.format('HH:mm') + ' '}
          {avgang.isDelayed ? renderDelayed(avgang) : null}
          { hasDeviances ?
            <span style={{paddingLeft: '1rem'}}><i className="warning fa fa-exclamation-triangle" /></span>
            : null }
        </div>
        <div className="omtid"><RelativeTime timestamp={avgang.ExpectedDepartureTime} refreshRate={30000}/></div>
        <ReactCollapse isOpened={showDeviations}>
          <Deviations deviations={avgang.Extensions.Deviations}/>
        </ReactCollapse>
      </Card>
    );
  }
});

export default Avgang;
