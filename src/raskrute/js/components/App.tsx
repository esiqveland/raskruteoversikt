import React, { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import DocumentTitle from 'react-document-title';

const Header: React.FC = () => <header className="header"><h2><Link to="/">Rask Rute</Link></h2></header>;
const Footer: React.FC = () => <footer>{ ' © 2015-' + new Date().getFullYear() + ' Eivind Larsen' }</footer>;

const Navigation: React.FC = () =>
    <nav>
        <span className="navbar-item"><Link to="/" className="navbar-link">Søk</Link></span>
        <span className="navbar-item"><Link to="/favorites" className="navbar-link">Favoritter</Link></span>
        <span className="navbar-item"><Link to="/about" className="navbar-link">Om</Link></span>
    </nav>;


const App: React.FC<PropsWithChildren> = ({ children }) =>
    <DocumentTitle title="Rask Rute">
        <div className="app">
            <Header/>
            <Navigation/>
            <section className="main-content">
                { children }
            </section>
            <Footer/>
        </div>
    </DocumentTitle>;

export default App;
