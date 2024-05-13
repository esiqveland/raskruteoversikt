import React from 'react';


const About: React.FC = () =>
  <div className="row">
    <div className="twelve columns">
      <h5>Begrensninger</h5>
      <article>
        <section>Foreløpig kan man kun slå opp på enkeltstopp.</section>
        <section>Vi er også begrenset til kun å vise avganger som har sanntidsdata.</section>
      </article>
      <h5>Kontakt</h5>
      <article>
        <section>Har du spørsmål eller forslag, ta kontakt på <a href="https://github.com/esiqveland/raskruteoversikt/issues">GitHub</a>.</section>
      </article>
    </div>
  </div>;


export default About;