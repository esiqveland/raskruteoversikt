import React from 'react';
import cx from 'classnames';

import RelativeTime from './RelativeTime';
import Card from './Card';

const Deviations = ({deviations}) =>
  <div>
    <h5 style={{marginBottom: '1rem'}}>Avvik</h5>
    {deviations.map((avvik) => <article key={avvik.ID} className="avvik">{avvik.Header}</article>)}
  </div>;

const Avgang = React.createClass({
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

    const renderDelayed = (avgang) => <span className="delayed">{avgang.AimedDepartureTime.format('H:mm')}</span>;
    const hasDeviances = avgang.Extensions.Deviations.length > 0;
    return (
      <Card onClick={this._onClick.bind(this, hasDeviances)} className={cx({'hover-hand': hasDeviances})}>
        <div className="linje">Linje: {avgang.PublishedLineName} mot {avgang.DestinationName}</div>
        <div className="klokke">
          {avgang.ExpectedDepartureTime.format('H:mm')} {avgang.isDelayed ? renderDelayed(avgang) : null}
          { hasDeviances ?
            <span style={{paddingLeft: '1rem'}}><i className="warning fa fa-exclamation-triangle"></i></span>
            : null }
        </div>
        <div className="omtid"><RelativeTime timestamp={avgang.ExpectedDepartureTime} refreshRate={30000}/></div>
        { showDeviations ? <Deviations deviations={avgang.Extensions.Deviations}/> : null }
      </Card>
    );
  }
});

export default Avgang;
