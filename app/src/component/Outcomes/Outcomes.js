// Node modules
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

// Components
import Navbar from '../Navbar/Navigation';
import NavbarAdmin from '../Navbar/NavigationAdmin';
import NotInit from '../NotInit';

// Contract
import getWeb3 from '../../getWeb3';
import newsDetection from '../../contracts/newsDetection.json';

// CSS
import './Outcomes.css';

export default class Result extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newsDetectionInstance: undefined,
      account: null,
      web3: null,
      isAdmin: false,
      newsCount: undefined,
      newss: [],
      isElStarted: false,
      isElEnded: false,
    };
  }
  componentDidMount = async () => {
   // console.log(news)
    // refreshing once
    if (!window.location.hash) {
      window.location = window.location + '#loaded';
      window.location.reload();
    }
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = newsDetection.networks[networkId];
      const instance = new web3.eth.Contract(
        newsDetection.abi,
        deployedNetwork && deployedNetwork.address
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({
        web3,
        newsDetectionInstance: instance,
        account: accounts[0],
      });

      // Get total number of newss
      const newsCount = await this.state.newsDetectionInstance.methods
        .getTotalNews()
        .call();
      this.setState({ newsCount: newsCount });

      // Get start and end values
      const start = await this.state.newsDetectionInstance.methods
        .getStart()
        .call();
      this.setState({ isElStarted: start });
      const end = await this.state.newsDetectionInstance.methods
        .getEnd()
        .call();
      this.setState({ isElEnded: end });

      // Loadin newss detials
      for (let i = 1; i <= this.state.newsCount; i++) {
        const news = await this.state.newsDetectionInstance.methods
          .newsDetails(i - 1)
          .call();
        this.state.newss.push({
          id: news.newsId,
          newsPost: news.newsPost,
          voteCount: news.voteCount,
          fakeCount: news.fakeCount,
        });
      }

      this.setState({ newss: this.state.newss });

      // Admin account and verification
      const admin = await this.state.newsDetectionInstance.methods
        .getAdmin()
        .call();
      if (this.state.account === admin) {
        this.setState({ isAdmin: true });
      }
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  render() {
    if (!this.state.web3) {
      return (
        <>
          {this.state.isAdmin ? <NavbarAdmin /> : <Navbar />}
          <center>Loading Web3, accounts, and contract...</center>
        </>
      );
    }

    return (
      <div className="md:ml-64 mt-10">
        {this.state.isAdmin ? <NavbarAdmin /> : <Navbar />}
        <br />
        <div>
          {!this.state.isElStarted && !this.state.isElEnded ? (
            <NotInit />
          ) : this.state.isElStarted && !this.state.isElEnded ? (
            <div className="container-item bg-slate-700 text-white">
              <center>
                <h3>The news Detection is being conducted at the movement.</h3>
                <p>
                  Outcome will be displayed once the newsDetection has ended.
                </p>
                <p>Go ahead and Verify the news.</p>
                <br />
                <Link to="/Voting" className="text-sky-600 underline">
                  Voting Page
                </Link>
              </center>
            </div>
          ) : !this.state.isElStarted && this.state.isElEnded ? (
            displayOutcomes(this.state.newss)
          ) : null}
        </div>
      </div>
    );
  }
}

function displayWinner(newss) {
  const getWinner = (newss) => {
   
    let maxVoteRecived = 0;
    let winnernews = [];
    for (let i = 0; i < newss.length; i++) {
      if (newss[i].voteCount - newss[i].fakeCount > maxVoteRecived) {
        maxVoteRecived = newss[i].voteCount;
        winnernews = [newss[i]];
      } else if (newss[i].voteCount - newss[i].fakeCount === maxVoteRecived) {
        winnernews.push(newss[i]);
      }
    }
    return winnernews;
  };
  const renderWinner = (winner) => {
    return (
      <div className="container-winner">
        <div className="winner-info">
          <p className="winner-tag">Given News</p>
          <h2> {winner.newsPost}</h2>
        </div>
        <div className="winner-votes">
          <div className="votes-tag">Total Verification for Authentic: </div>
          <div className="vote-count">{winner.voteCount}</div>
          <div className="votes-tag">Total Verification for Fake: </div>
          <div className="vote-count">{winner.fakeCount}</div>          
        </div>
      </div>
    );
  };
  const winnernews = getWinner(newss);
  return <>{winnernews.map(renderWinner)}</>;
}



export function displayOutcomes(newss) {
  const renderOutcomes = (news) => {
    return (
      <tr>
        <td>{news.id}</td>
        <td>{news.newsPost}</td>
        <td>{`Authentic: ${(parseInt(news.voteCount) / (parseInt(news.voteCount) +
          parseInt(news.fakeCount))) * 100}%`} </td>
        <td>{`Fake: ${(parseInt(news.fakeCount) / (parseInt(news.voteCount) +
          parseInt(news.fakeCount))) * 100}%`} </td>
      </tr>
    );
  };
  return (
    <>
      {newss.length > 0 ? (
        <div className="container-main">{displayWinner(newss)}</div>
      ) : null}
      <div className="container-main" style={{ borderTop: '1px solid' }}>
        <h3 className="text-2xl text-white">Outcomes</h3>
        <small>Total news: {newss.length}</small>
        {newss.length < 1 ? (
          <div className="container-item bg-slate-700">
            <center>No news.</center>
          </div>
        ) : (
          <>
            <div className="container-item bg-slate-900 text-sky-600">
              <table>
                <tr>
                  <th>Id</th>
                  <th>News</th>
                  <th>Authenticity Percentage </th>
                  <th>Fake Percentage </th>
                </tr>
                {newss.map(renderOutcomes)}
              </table>
            </div>



            <div className="container-item bg-slate-700 text-white">
            <center>
              
              <p>To see the BlockChain and NLP Integrated Outcome</p>
              <br />
              <Link to="/Final_Outcomes" className="text-sky-600 underline">
              Integrated Final Outcome
              </Link>
            </center>
          </div>

            

            
          </>
        )}
      </div>
    </>
  );
}