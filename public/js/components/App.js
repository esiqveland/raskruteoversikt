import React from 'react';
import {Link} from 'react-router';
import DocumentTitle from 'react-document-title';

const Header = (props) => <header className="header"><h2><Link to="/">Rask Rute</Link></h2></header>;
const Footer = (props) => <footer>{' © 2015-' + new Date().getFullYear() + ' Eivind Larsen'}</footer>;
const Navigation = (props) => <nav>Navigation - <Link to="/" activeClassName="active">Home</Link></nav>;

const Nav2 = React.createClass({
  // componentDidMount() {
  //   window.addEventListener('scroll', this.handleScroll);
  // },
  // componentWillUnmount() {
  //   window.removeEventListener('scroll', this.handleScroll)
  // },
  // handleScroll() {
  //   if (!this._navbar) {
  //     return;
  //   }
  //   console.log('navbar', this._navbar.classList);
  //   console.log('navbar', this._navbar.scrollTop);
  //   console.log('navbar', this._navbar.getBoundingClientRect());
  //   console.log('document.scrollTop', document.scrollTop);
  //   console.log('document.body.scrollTop', document.body.scrollTop);
  //   console.log('window.height', window.height);
  //   console.log('window.scrollTop', window.scrollTop);
  //   if (this._navbar.getBoundingClientRect().top < 1) {
  //     this._navbar.setAttribute('class', 'navbar has-docked-nav');
  //   }
  //   if (document.body.scrollTop > ) {
  //
  //   }
  // },
  render() {
    return (
      <nav className="navbar has-docked-nav" ref={(ref) => this._navbar = ref }>
        <div className="container">
          <ul className="navbar-list">
            <li className="navbar-item"><Link to="/" className="navbar-link">Søk</Link></li>
            <li className="navbar-item"><Link to="/favorites" className="navbar-link">Favoritter</Link></li>
            <li className="navbar-item"><Link to="/about" className="navbar-link">Om</Link></li>
          </ul>
        </div>
      </nav>
    );
  }
});


const App = React.createClass({
  render() {
    return (
      <DocumentTitle title="Rask Rute">
        <div className="container">
          <Header />
          <div className="navbar-spacer has-docked-nav"></div>
          <Nav2 />
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
