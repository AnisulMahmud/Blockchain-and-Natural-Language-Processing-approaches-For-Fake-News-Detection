// Node modules
import React, { Component } from 'react';

// Components
import Navbar from '../Navbar/Navigation';
import NavbarAdmin from '../Navbar/NavigationAdmin';
import NotInit from '../NotInit';

// CSS
import './Registration.css';

// Contract
import getWeb3 from '../../getWeb3';
import newsDetection from '../../contracts/newsDetection.json';

export default class Registration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newsDetectionInstance: undefined,
      web3: null,
      account: null,
      isAdmin: false,
      isElStarted: false,
      isElEnded: false,
      evaluatorCount: undefined,
      evaluatorName: '',
      evaluatorIdn: '',
      evaluatorProfession: '',
      evaluators: [],
      currentEvaluator: {
        address: undefined,
        name: null,
        idn: null,
        profession:null,
        hasVoted: false,
        isVerified: false,
        isRegistered: false,
      },
    };
  }

  // refreshing once
  componentDidMount = async () => {
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
        web3: web3,
        newsDetectionInstance: instance,
        account: accounts[0],
      });

      // Admin account and verification
      const admin = await this.state.newsDetectionInstance.methods
        .getAdmin()
        .call();
      if (this.state.account === admin) {
        this.setState({ isAdmin: true });
      }

      // Get start and end values
      const start = await this.state.newsDetectionInstance.methods
        .getStart()
        .call();
      this.setState({ isElStarted: start });
      const end = await this.state.newsDetectionInstance.methods
        .getEnd()
        .call();
      this.setState({ isElEnded: end });

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
          idn: evaluator.idn,
          profession: evaluator.profession,
          hasVoted: evaluator.hasVoted,
          isVerified: evaluator.isVerified,
          isRegistered: evaluator.isRegistered,
        });
      }
      this.setState({ evaluators: this.state.evaluators });

      // Loading current evaluators
      const evaluator = await this.state.newsDetectionInstance.methods
        .evaluatorDetails(this.state.account)
        .call();
      this.setState({
        currentEvaluator: {
          address: evaluator.evaluatorAddress,
          name: evaluator.name,
          idn: evaluator.idn,
          profession: evaluator.profession,
          hasVoted: evaluator.hasVoted,
          isVerified: evaluator.isVerified,
          isRegistered: evaluator.isRegistered,
        },
      });
    } catch (error) {
      // Catch any errors for any of the above operations.
      console.error(error);
      alert(
        `Failed to load web3, accounts, or contract. Check console for details (f12).`
      );
    }
  };
  updateEvaluatorName = (event) => {
    this.setState({ evaluatorName: event.target.value });
  };
  updateEvaluatorIdn = (event) => {
    this.setState({ evaluatorIdn: event.target.value });
  };
  updateEvaluatorProfession = (event) => {
    this.setState({ evaluatorProfession: event.target.value });
  };  
  registerAsEvaluator = async () => {
    await this.state.newsDetectionInstance.methods
      .registerAsEvaluator(this.state.evaluatorName, this.state.evaluatorIdn, this.state.evaluatorProfession)
      .send({ from: this.state.account, gas: 1000000 });
    window.location.reload();
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
        {/* {
				// !this.state.isElStarted && !this.state.isElEnded ? (
        //   <NotInit />
        // ) : ( */}
          <div className="overflow-hidden">
            <div className="container-item bg-slate-700 text-sky-600">
              <p>Total registered evaluators: {this.state.evaluators.length}</p>
            </div>
            <div className="container-main">
              <h3 className="text-2xl text-white">Registration</h3>
              <small className="text-grey">Register to evaluate.</small>
              <div className="container-item">
                <form>
                  <div className="div-li">
                    <label className={'label-r text-white'}>
                      Account Address
                      <input
                        className="bg-slate-900 shadow-md rounded p-5 block mt-2 w-full"
                        type="text"
                        value={this.state.account}
                        style={{ width: '400px' }}
                      />{' '}
                    </label>
                  </div>
                  <div className="div-li">
                    <label className={'label-r text-white'}>
                      Name
                      <input
                        className="bg-slate-900 shadow-md rounded p-5 block mt-2 w-full"
                        type="text"
                        placeholder="eg. Anis"
                        value={this.state.evaluatorName}
                        onChange={this.updateEvaluatorName}
                      />{' '}
                    </label>
                  </div>
                  <div className="div-li">
                    <label className={'label-r text-white'}>
                      Profession
                      <input
                        className="bg-slate-900 shadow-md rounded p-5 block mt-2 w-full"
                        type="text"
                        placeholder="eg. journalist"
                        value={this.state.evaluatorProfession}
                        onChange={this.updateEvaluatorProfession}
                      />{' '}
                    </label>
                  </div>
                  <div className="div-li">
                    <label className={'label-r text-white'}>
                      ID <span style={{ color: 'tomato' }}>*</span>
                      <input
                        className="bg-slate-900 shadow-md rounded p-5 block mt-2 w-full"
                        type="number"
                        placeholder="eg. 192130"
                        value={this.state.evaluatorIdn}
                        onChange={this.updateEvaluatorIdn}
                      />
                    </label>
                  </div>

                  <p className="note">
                    <span style={{ color: 'tomato' }}> Note: </span>
                    <br />{' '}
                    <span className="text-sky-600">
                      Correctly fill up your Account address, name , profession and id [ must be 6 digit]

                    </span>
                  </p>
                  <button
                    className="bg-sky-500 hover:bg-blue-700 text-white font-bold py-2 px-5 mt-5 rounded"
                    disabled={
                      this.state.evaluatorIdn.length !== 6 ||
                      this.state.currentEvaluator.isVerified
                    }
                    onClick={this.registerAsEvaluator}
                  >
                    {this.state.currentEvaluator.isRegistered
                      ? 'Update'
                      : 'Register'}
                  </button>
                </form>
              </div>
            </div>
            <div
              className="container-main"
              style={{
                borderTop: this.state.currentEvaluator.isRegistered
                  ? null
                  : '1px solid',
              }}
            >
              {loadCurrentEvaluator(
                this.state.currentEvaluator,
                this.state.currentEvaluator.isRegistered
              )}
            </div>
            {this.state.isAdmin ? (
              <div
                className="container-main"
                style={{ borderTop: '1px solid' }}
              >
                <small>TotalEvaluators: {this.state.evaluators.length}</small>
                {loadAllEvaluators(this.state.evaluators)}
              </div>
            ) : null}
          </div>

      </div>
    );
  }
}
export function loadCurrentEvaluator(evaluator, isRegistered) {
  return (
    <>
      <div className={'container-item bg-sky-600'}>
        <center className="text-white font-semibold text-lg">
          Your Registered Info
        </center>
      </div>
      <div className={'container-list bg-slate-900 text-sky-600'}>
        <table className="overflow-scroll">
          <tr>
            <th>Your Account Address :</th>
            <td>{evaluator.address}</td>
          </tr>
          <tr>
            <th>Your Name :</th>
            <td>{evaluator.name}</td>
          </tr>
          <tr>
          <th>Your Profession :</th>
          <td>{evaluator.profession}</td>
        </tr>
          <tr>
            <th>Your Id :</th>
            <td>{evaluator.idn}</td>
          </tr>
          <tr>
            <th>Voted</th>
            <td>{evaluator.hasVoted ? 'True' : 'False'}</td>
          </tr>
          <tr>
            <th>Verification</th>
            <td>{evaluator.isVerified ? 'True' : 'False'}</td>
          </tr>
          <tr>
            <th>Registered</th>
            <td>{evaluator.isRegistered ? 'True' : 'False'}</td>
          </tr>
        </table>
      </div>
    </>
  );
}
export function loadAllEvaluators(evaluators) {
  const renderAllEvaluators = (evaluator) => {
    return (
      <>
        <div className="container-list bg-slate-900 text-sky-600">
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
              <th>ID</th>
              <td>{evaluator.idn}</td>
            </tr>
            <tr>
              <th>Voted</th>
              <td>{evaluator.hasVoted ? 'True' : 'False'}</td>
            </tr>
            <tr>
              <th>Verified</th>
              <td>{evaluator.isVerified ? 'True' : 'False'}</td>
            </tr>
            <tr>
              <th>Registered</th>
              <td>{evaluator.isRegistered ? 'True' : 'False'}</td>
            </tr>
          </table>
        </div>
      </>
    );
  };
  return (
    <>
      <div className="container-item bg-sky-600 text-white font-semibold text-lg">
        <center>List of evaluators</center>
      </div>
      {evaluators.map(renderAllEvaluators)}
    </>
  );
}
