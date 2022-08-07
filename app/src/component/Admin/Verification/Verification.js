import React, { Component } from "react";

import Navbar from "../../Navbar/Navigation";
import NavbarAdmin from "../../Navbar/NavigationAdmin";

import AdminOnly from "../../AdminOnly";

import getWeb3 from "../../../getWeb3";
import newsDetection from "../../../contracts/newsDetection.json";

import "./Verification.css";

export default class Registration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newsDetectionInstance: undefined,
      account: null,
      web3: null,
      isAdmin: false,
      evaluatorCount: undefined,
      evaluators: [],
    };
  }

  // refreshing once
  componentDidMount = async () => {
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
      this.setState({ web3, newsDetectionInstance: instance, account: accounts[0] });

      // Total number of news
      const newsCount = await this.state.newsDetectionInstance.methods
        .getTotalNews()
        .call();
      this.setState({ newsCount: newsCount });

      // Admin account and verification
      const admin = await this.state.newsDetectionInstance.methods.getAdmin().call();
      if (this.state.account === admin) {
        this.setState({ isAdmin: true });
      }
      // Total number of evaluators
      const evaluatorCount = await this.state.newsDetectionInstance.methods
        .getTotalEvaluator()
        .call();
      this.setState({ evaluatorCount: evaluatorCount });

      // Loading all the evaluators
      for (let i = 0; i < this.state.evaluatorCount; i++) {
        const evaluatorAddress = await this.state.newsDetectionInstance.methods
          .evaluators(i)
          .call();
        const evaluator = await this.state.newsDetectionInstance.methods
          .evaluatorDetails(evaluatorAddress)
          .call();
        this.state.evaluators.push({
          address: evaluator.evaluatorAddress,
          name: evaluator.name,
          profession: evaluator.profession,
          idn: evaluator.idn,
          hasVoted: evaluator.hasVoted,
          isVerified: evaluator.isVerified,
          isRegistered: evaluator.isRegistered,
        });
      }
      this.setState({ evaluators: this.state.evaluators });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };
  renderUnverifiedEvaluators = (evaluator) => {
    const verifyEvaluator = async (verifiedStatus, address) => {
      await this.state.newsDetectionInstance.methods
        .verifyEvaluator(verifiedStatus, address)
        .send({ from: this.state.account, gas: 1000000 });
      window.location.reload();
    };
    return (
      <>
        {evaluator.isVerified ? (
          <div className="container-list success">
            <p style={{ margin: "7px 0px" }}>AC: {evaluator.address}</p>
            <table>
              <tr>
                <th>Name</th>
                <th>Profession</th>
                <th>Id</th>
                <th>Voted</th>
              </tr>
              <tr>
                <td>{evaluator.name}</td>
                <td>{evaluator.profession}</td>
                <td>{evaluator.idn}</td>
                <td>{evaluator.hasVoted ? "True" : "False"}</td>
              </tr>
            </table>
          </div>
        ) : null}
        <div
          className="container-list attention"
          style={{ display: evaluator.isVerified ? "none" : null }}
        >
          <table>
            <tr>
              <th>Account address</th>
              <td>{evaluator.address}</td>
            </tr>
            <tr>
              <th>Name</th>
              <td>{evaluator.name}</td>
            </tr>
            <tr>
            <th>Profession</th>
            <td>{evaluator.profession}</td>
          </tr>
            <tr>
              <th>Id</th>
              <td>{evaluator.idn}</td>
            </tr>
            <tr>
              <th>Voted</th>
              <td>{evaluator.hasVoted ? "True" : "False"}</td>
            </tr>
            <tr>
              <th>Verified</th>
              <td>{evaluator.isVerified ? "True" : "False"}</td>
            </tr>
            <tr>
              <th>Registered</th>
              <td>{evaluator.isRegistered ? "True" : "False"}</td>
            </tr>
          </table>
          <div style={{}}>
            <button
              className="btn-verification approve"
              disabled={evaluator.isVerified}
              onClick={() => verifyEvaluator(true, evaluator.address)}
            >
              Approve
            </button>
          </div>
        </div>
      </>
    );
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
          <AdminOnly page="Verification Page." />
        </>
      );
    }
    return (
      <div className="md:ml-64 mt-10">
        <NavbarAdmin />
        <div className="container-main">
          <h3 className="text-2xl text-white">Verification</h3>
          <small className="text-lg text-grey">
            Total evaluators: {this.state.evaluators.length}
          </small>
          {this.state.evaluators.length < 1 ? (
            <div className="container-item bg-slate-900 p-5 text-sky-600">
              None has registered yet.
            </div>
          ) : (
            <>
              <div className="container-item bg-slate-900 p-5 text-white">
                <center className="text-sky-600">
                  List of registered evaluators
                </center>
              </div>
              {this.state.evaluators.map(this.renderUnverifiedEvaluators)}
            </>
          )}
        </div>
      </div>
    );
  }
}
