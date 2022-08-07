// Node modules
import React, { Component } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

// Components
import Navbar from './Navbar/Navigation';
import NavbarAdmin from './Navbar/NavigationAdmin';
import UserHome from './UserHome';
import StartEnd from './StartEnd';
import DetectionStatus from './DetectionStatus';

// Contract
import getWeb3 from '../getWeb3';
import newsDetection from '../contracts/newsDetection.json';

// CSS
import './Home.css';

// const buttonRef = React.createRef();
export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newsDetectionInstance: undefined,
      account: null,
      web3: null,
      isAdmin: false,
      elStarted: false,
      elEnded: false,
      elDetails: {},
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

      const admin = await this.state.newsDetectionInstance.methods
        .getAdmin()
        .call();
      if (this.state.account === admin) {
        this.setState({ isAdmin: true });
      }

      // Get newsDetection start and end values
      const start = await this.state.newsDetectionInstance.methods
        .getStart()
        .call();
      this.setState({ elStarted: start });
      const end = await this.state.newsDetectionInstance.methods
        .getEnd()
        .call();
      this.setState({ elEnded: end });

      // Getting newsDetection details from the contract
      const adminName = await this.state.newsDetectionInstance.methods
        .getAdminName()
        .call();
      const adminEmail = await this.state.newsDetectionInstance.methods
        .getAdminEmail()
        .call();

      const newsdetectionTitle = await this.state.newsDetectionInstance.methods
        .getnewsDetectionTitle()
        .call();

      this.setState({
        elDetails: {
          adminName: adminName,
          adminEmail: adminEmail,
          newsdetectionTitle: newsdetectionTitle,
        },
      });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };
  // end newsDetection
  endnewsDetection = async () => {
    await this.state.newsDetectionInstance.methods
      .endnewsDetection()
      .send({ from: this.state.account, gas: 1000000 });
    window.location.reload();
  };
  // register and start newsDetection
  registernewsDetection = async (data) => {
    await this.state.newsDetectionInstance.methods
      .setnewsDetectionDetails(
        data.adminFName.toLowerCase() + ' ' + data.adminLName.toLowerCase(),
        data.adminEmail.toLowerCase(),
        data.newsdetectionTitle.toLowerCase()
      )
      .send({ from: this.state.account, gas: 1000000 });
    window.location.reload();
  };

  render() {
    if (!this.state.web3) {
      return (
        <>
          <Navbar />
          <center>Loading Web3, accounts, and contract...</center>
        </>
      );
    }
    return (
      <div className="md:ml-64 mt-10">
        {this.state.isAdmin ? <NavbarAdmin /> : <Navbar />}
        <div
          className="flex items-center justify-center flex-col w-full m-auto p-10"
          style={{ maxWidth: 900 }}
        >
          <div className="rounded-md bg-emerald-500 p-4 w-full">
            <div className="flex">
              <div className="ml-3 overflow-hidden">
                <h3 className="text-lg font-medium text-white">
                  Your Account: {this.state.account}
                </h3>
              </div>
            </div>
          </div>
          {!this.state.elStarted & !this.state.elEnded ? (
            <div className="rounded-md bg-teal-500 p-4 w-full mt-10">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-white">
                    The news Detection has not been initialize.
                    {this.state.isAdmin ? (
                      <p>Set up the news Detection.</p>
                    ) : (
                      <p>Please wait..</p>
                    )}
                  </h3>
                </div>
              </div>
            </div>
          ) : null}
        </div>
        {this.state.isAdmin ? (
          <>
            <this.renderAdminHome />
          </>
        ) : this.state.elStarted ? (
          <>
            <UserHome el={this.state.elDetails} />
          </>
        ) : !this.state.isElStarted && this.state.isElEnded ? (
          <>
            <div className="container-item attention">
              <center>
                <h3>The news Detection ended.</h3>
                <br />
                <Link
                  to="/Outcomes"
                  style={{ color: 'black', textDecoration: 'underline' }}
                >
                  See Outcomes
                </Link>
              </center>
            </div>
          </>
        ) : null}
      </div>
    );
  }

  renderAdminHome = () => {
    const EMsg = (props) => {
      return <span style={{ color: 'tomato' }}>{props.msg}</span>;
    };

    const AdminHome = () => {
      // Contains of Home page for the Admin
      const {
        handleSubmit,
        register,
        formState: { errors },
      } = useForm();

      const onSubmit = (data) => {
        this.registernewsDetection(data);
      };

      return (
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            {!this.state.elStarted & !this.state.elEnded ? (
              <div className="container-main">
                {/* about-admin */}
                <div className="about-admin">
                  <h3 className="text-2xl text-white">About Admin</h3>
                  <div className="center-items bg-slate-700 py-10 px-2 rounded-lg">
                    <div className="w-full max-w-xs">
                      <label className="label-home text-white">
                        Full Name{' '}
                        {errors.adminFName && <EMsg msg="*required" />}
                        <input
                          className="bg-slate-900 shadow-md rounded p-5 block mt-2 w-full"
                          type="text"
                          placeholder="First Name"
                          {...register('adminFName', {
                            required: true,
                          })}
                        />
                        <input
                          className="bg-slate-900 shadow-md rounded p-5 block mt-2 w-full"
                          type="text"
                          placeholder="Last Name"
                          {...register('adminLName')}
                        />
                      </label>

                      <label className="label-home text-white">
                        Email{' '}
                        {errors.adminEmail && (
                          <EMsg msg={errors.adminEmail.message} />
                        )}
                        <input
                          className="bg-slate-900 shadow-md rounded p-5 block mt-2 w-full"
                          placeholder="eg. you@example.com"
                          name="adminEmail"
                          {...register('adminEmail', {
                            required: '*Required',
                            pattern: {
                              value: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/, // email validation using RegExp
                              message: '*Invalid',
                            },
                          })}
                        />
                      </label>
                    </div>
                  </div>
                </div>
                {/* about-news Detection */}
                <div className="about-news Detection mt-5">
                  <h3 className="text-2xl text-white">About news Detection</h3>
                  <div className="container-item center-items bg-slate-700 py-10 px-2 rounded-lg">
                    <div>
                      <label className="label-home text-white">
                        newsDetection Title{' '}
                        {errors.newsdetectionTitle && <EMsg msg="*required" />}
                        <input
                          className="bg-slate-900 shadow-md rounded p-5 block mt-2 w-full"
                          type="text"
                          placeholder="eg. School newsDetection"
                          {...register('newsdetectionTitle', {
                            required: true,
                          })}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ) : this.state.elStarted ? (
              <UserHome el={this.state.elDetails} />
            ) : null}
            <StartEnd
              elStarted={this.state.elStarted}
              elEnded={this.state.elEnded}
              endElFn={this.endnewsDetection}
            />
            <DetectionStatus
              elStarted={this.state.elStarted}
              elEnded={this.state.elEnded}
            />
          </form>
        </div>
      );
    };
    return <AdminHome />;
  };
}
