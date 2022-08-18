import React, { Component } from "react";

import Navbar from "../../Navbar/Navigation";
import NavbarAdmin from "../../Navbar/NavigationAdmin";

import getWeb3 from "../../../getWeb3";
import newsDetection from "../../../contracts/newsDetection.json";

import AdminOnly from "../../AdminOnly";

import "./AddNews.css";

export default class AddNews extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newsDetectionInstance: undefined,
      web3: null,
      accounts: null,
      isAdmin: false,
      newsPost: "",
      newss: [],
      newsCount: undefined
    };
  }

  componentDidMount = async () => {
    // refreshing page only once
    if (!window.location.hash) {
      window.location = window.location + "#loaded";
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
        web3: web3,
        newsDetectionInstance: instance,
        account: accounts[0],
      });

      // Total number of newss
      const newsCount = await this.state.newsDetectionInstance.methods
        .getTotalNews()
        .call();
      this.setState({ newsCount: newsCount });

      const admin = await this.state.newsDetectionInstance.methods.getAdmin().call();
      if (this.state.account === admin) {
        this.setState({ isAdmin: true });
      }

      // Loading newss details
      for (let i = 0; i < this.state.newsCount; i++) {
        const news = await this.state.newsDetectionInstance.methods
          .newsDetails(i)
          .call();
        this.state.newss.push({
          id: news.newsId,
          newsPost: news.newsPost,
        });
      }

      this.setState({ newss: this.state.newss });
    } catch (error) {
      // Catch any errors for any of the above operations.
      console.error(error);
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
    }
  };
  updateNewsPost = (event) => {
    this.setState({ newsPost: event.target.value });
  };


  addNews = async () => {
    let fromLang = 'bn';
    let toLang = 'en'; // translate to bengali
    let text = this.state.newsPost;

    const API_KEY = 'AIzaSyAuO0pDNneTzg5zgk552tUwN84OA-r9LsA';

    let url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;
    url += '&q=' + encodeURI(text);
    url += `&source=${fromLang}`;
    url += `&target=${toLang}`;

    let translatedText = '';

    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then((res) => res.json())
      .then((response) => {
        translatedText = response.data.translations[0].translatedText;
        this.state.newsDetectionInstance.methods
          .addNews(translatedText)
          .send({ from: this.state.account, gas: 1000000 });
        window.location.reload();
      })
      .catch((error) => {
        console.log('There was an error with the translation request: ', error);
      });
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
    if (!this.state.isAdmin) {
      return (
        <>
          <Navbar />
          <AdminOnly page="Add news Page." />
        </>
      );
    }
    return (
      <div className="md:ml-64 mt-10">
        <NavbarAdmin />
        <div className="container-main w-full">
          <h3 className="text-2xl text-white">Add a new news</h3>
          <small>Total news: {this.state.newsCount}</small>
          <div className="container-item bg-slate-700 rounded w-full">
            <form className="form">
              <label className="label-ac text-white">
                NewsPost
                <input
                  className="bg-slate-900 shadow-md rounded p-5 block mt-2 w-full"
                  type="text"
                  placeholder="eg. Anything"
                  value={this.state.newsPost}
                  onChange={this.updateNewsPost}
                />
              </label>

              <button
                className="bg-sky-500 hover:bg-blue-700 text-white font-bold px-10 py-3 mt-5 ml-2 rounded"
                disabled={
                  this.state.newsPost.length < 3 ||
                  this.state.newsPost.length > 1000
                }
                onClick={this.addNews}
              >
                Add
              </button>
            </form>
          </div>
        </div>
        {loadAdded(this.state.newss)}
      </div>
    );
  }
}
export function loadAdded(newss) {
  const renderAdded = (news) => {
    let fromLang = 'en';
    let toLang = 'bn'; // translate to bengali
    let text = news.newsPost;

    const API_KEY = 'AIzaSyAuO0pDNneTzg5zgk552tUwN84OA-r9LsA';

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
      
      <>
        <div className="container-list bg-slate-900 text-sky-600">
          {localStorage.getItem('translatedTextForRender') &&  (
            
            <div
            style={{
              maxHeight: "75px",
            }}
          >
            {news.id}. <strong>{localStorage.getItem('translatedTextForRender')}</strong>{" "}
          </div>
          )}
        </div>
      </>
    );
  };
  return (
    <div className="container-main" style={{ borderTop: "1px solid" }}>
      <div className="container-item bg-slate-700 text-white">
        <center>News List</center>
      </div>
      {newss.length < 1 ? (
        <div className="container-item border border-sky-600 text-sky-600">
          <center>No news added.</center>
        </div>
      ) : (
        <div
          className="container-item bg-sky-700"
          style={{
            display: "block",
          }}
        >
          {newss.map(renderAdded)}
        </div>
      )}
    </div>
  );
}
