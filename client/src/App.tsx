import React from 'react';
import logo from './logo.svg';
import './App.css';
import {Card} from 'grommet';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a> */}
      <Card>
        <iframe
          width="600"
          height="450"
          style={{border: 0}}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src="https://www.google.com/maps/embed/v1/place?key=AIzaSyCLrvLo1Bm9dFugRbLxDhWFn8oGlHhTlpI
            &q=Space+Needle,Seattle+WA">
        </iframe>
        </Card>
      </header>
    </div>
  );
}

export default App;
