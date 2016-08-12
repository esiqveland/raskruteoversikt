import React from 'react';
import {Link} from 'react-router';
import DocumentTitle from 'react-document-title';

const Header = (props) => <header className="header"><h2><Link to="/">Rask Rute</Link></h2></header>;
const Footer = (props) => <footer>{' © 2015-' + new Date().getFullYear() + ' Eivind Larsen'}</footer>;

const Navigation = React.createClass({
  render() {
    return (
      <nav>
          <span className="navbar-item"><Link to="/" className="navbar-link">Søk</Link></span>
          <span className="navbar-item"><Link to="/favorites" className="navbar-link">Favoritter</Link></span>
          <span className="navbar-item"><Link to="/about" className="navbar-link">Om</Link></span>
      </nav>
    );
  }
});


const App = React.createClass({
  render() {
    return (
      <DocumentTitle title="Rask Rute">
        <div className="app">
          <Header />
          <Navigation />
          <section className="main-content">
            {this.props.children}
          </section>
          <Footer />
        </div>
      </DocumentTitle>
    );
  }
});

export default App;
