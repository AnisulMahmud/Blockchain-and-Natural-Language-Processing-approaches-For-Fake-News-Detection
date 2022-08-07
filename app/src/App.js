import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import Home from './component/Home';

import Voting from './component/Voting/Voting';
import Outcomes from './component/Outcomes/Outcomes';
import Registration from './component/Registration/Registration';

import AddNews from './component/Admin/AddNews/AddNews';
import Verification from './component/Admin/Verification/Verification';
import test from './component/test';
// import StartEnd from "./component/Admin/StartEnd/StartEnd";

//import Footer from "./component/Footer/Footer         <Footer />";

import './App.css';

export default class App extends Component {
  render() {
    return (
      <div className="App">
        <Router>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/AddNews" component={AddNews} />
            <Route exact path="/Voting" component={Voting} />
            <Route exact path="/Outcomes" component={Outcomes} />
            <Route exact path="/Registration" component={Registration} />
            <Route exact path="/Verification" component={Verification} />
            <Route exact path="/test" component={test} />
            <Route exact path="*" component={NotFound} />
          </Switch>
        </Router>
      </div>
    );
  }
}
class NotFound extends Component {
  render() {
    return (
      <>
        <h1>404 NOT FOUND!</h1>
        <center>
          <p>
            The page your are looking for doesn't exist.
            <br />
            Go to{' '}
            <Link
              to="/"
              style={{ color: 'black', textDecoration: 'underline' }}
            >
              Home
            </Link>
          </p>
        </center>
      </>
    );
  }
}
