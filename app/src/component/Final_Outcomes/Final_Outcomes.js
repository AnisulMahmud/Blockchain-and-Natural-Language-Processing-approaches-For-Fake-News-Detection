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
import './Final_Outcomes.css';

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

export function displayOutcomes(newss) {
  const renderOutcomes1 = (news) => {
    const nlpResult = localStorage.getItem('nlpResults')
    

    const prevAuth  = (parseInt(news.voteCount) / (parseInt(news.voteCount) +
    parseInt(news.fakeCount))) * 100
    const newAuth = (100 + prevAuth ) / 2

    const prevFake = (parseInt(news.fakeCount) / (parseInt(news.voteCount) +
    parseInt(news.fakeCount))) * 100
    const newFake = (100 + prevFake ) / 2

    const translatedTextForRender = localStorage.getItem('translatedTextForRender')

    return (
      <tr>
        <td>{news.id}</td>
        <td>{translatedTextForRender}</td>
        <td>{`Authentic: ${nlpResult ? (parseInt(nlpResult) === 1 ? newAuth : (0 + prevAuth) / 2) : prevAuth}%`}</td>
      <td>{`Fake: ${nlpResult ? (parseInt(nlpResult) === 0 ? newFake : (0 + prevFake) / 2) : prevFake }%`} </td>
      </tr>
    );
  };

  function displayNews(news) {

    function voteNews(id, vote) {
      localStorage.setItem('nlpResults', vote)
      window.location.reload()
    }
    let fromLang = 'en';
    let toLang = 'bn'; // translate to bengali
    let text = newss[0].newsPost;
    let translatedText = '';

    const API_KEY = '';

    let url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;
    url += '&q=' + encodeURI(text);
    url += `&source=${fromLang}`;
    url += `&target=${toLang}`;

    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then((res) => res.json())
      .then((response) => {
        localStorage.setItem('translatedTextForRender', response.data.translations[0].translatedText)
      })
      .catch((error) => {
        console.log('There was an error with the translation request: ', error);
      });


      return (
        <tr>
          <td>{news.id}</td>
          <td>{localStorage.getItem('translatedTextForRender')}</td>
          <td>
            <div className='flex items-center'>
              <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-5"
                onClick={() => voteNews(news.id, 1)}
              >
                Authentic
              </button>
              <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-5"
              onClick={() => voteNews(news.id, 0)}
              >
                Fake
              </button>
            </div>
          </td>
        </tr>
      );
  }


  return (
    <>
      {newss.length > 0 ? (
        <div className="container-main">
        <div className='flex justify-end'>
          <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-5"
          >
            <a href='https://calm-donuts-jump-34-136-60-122.loca.lt/' target="_blank" rel="noreferrer">NLP MODEL</a>
          </button>

        </div>
          <div className="text-white mb-3">What do you get from NLP model:</div>
          <div className="container-item bg-slate-900 text-sky-600">
              <table>
                <tr>
                  <th>Id</th>
                  <th>News</th>
                  <th>Authenticity or Fake </th>
                </tr>
                {newss.map(news => displayNews(news))}
              </table>
            </div>
          
        </div>
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
          <div className="container-item border border-sky-600 text-sky-600">
          <center>BlockChain and NLP Integrated Final Outcome</center>
        </div>
            <div className="container-item bg-slate-900 text-sky-600">
              <table>
                <tr>
                  <th>Id</th>
                  <th>News</th>
                  <th>Authenticity Percentage </th>
                  <th>Fake Percentage </th>
                </tr>
                {newss.map(renderOutcomes1)}
              </table>
            </div>
            <div className="container-item border border-sky-600 text-sky-600">
              <center>That is all.</center>
            </div>
          </>
        )}
      </div>
    </>
  );
}