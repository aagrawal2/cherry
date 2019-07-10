import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Switch from 'react-router-dom/Switch';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Grid, Image, Header } from 'semantic-ui-react';

import {
    showSigninBox, showSignupBox, setIsSignIn, setIsSignUp, setRenderProvider,
    setRenderAccounts, setRenderAccount, setRenderTransactions, logout
} from '../redux/actions/ActionCherry';
import SigninBox from './SigninBox';
import SignupBox from './SignupBox';
import Provider from './Provider';
import Accounts from './Accounts';
import Account from './Account';
import Transactions from './Transactions';
import Transaction from './Transaction';

import 'semantic-ui-css/semantic.min.css';
import '../scss/_loginSty.scss';

import BofaLogo from '../images/bofa.jpg';
import CitiLogo from '../images/citi.jpg';
import AmexLogo from '../images/amex.jpg';
import ComcastLogo from '../images/comcast.jpg';
import FirstTechLogo from '../images/firsttech.jpg';
import WellsFargoLogo from '../images/wellsfargo.jpg';
import PgeLogo from '../images/pge.jpg';
import ChaseLogo from '../images/chase.jpg';
import UsBankLogo from '../images/usbank.png';
import PncLogo from '../images/pnc.png';
import CapOneLogo from '../images/capitalone.png';


const mapStateToProps = (state) => ({
    cherry: state.cherry
});

const mapDispatchToProps = (dispatch) => ({
    showSigninBox: () => dispatch(showSigninBox()),
    showSignupBox: () => dispatch(showSignupBox()),
    setIsSignIn: flag => dispatch(setIsSignIn(flag)),
    setIsSignUp: flag => dispatch(setIsSignUp(flag)),
    setRenderProvider: flag => dispatch(setRenderProvider(flag)),
    setRenderAccounts: flag => dispatch(setRenderAccounts(flag)),
    setRenderAccount: flag => dispatch(setRenderAccount(flag)),
    setRenderTransactions: flag => dispatch(setRenderTransactions(flag)),
    logout: () => dispatch(logout())
});

const logosInGrid = _.times(12, (i) => {
    switch (i) {
        case 1:
            return (
                <Grid.Column key={i}>
                    <Image src={BofaLogo} />
                </Grid.Column>
            );
        case 2:
            return (
                <Grid.Column key={i}>
                    <Image src={CitiLogo} />
                </Grid.Column>
            );
        case 3:
            return (
                <Grid.Column key={i}>
                    <Image src={AmexLogo} />
                </Grid.Column>
            );
        case 4:
            return (
                <Grid.Column key={i}>
                    <Image src={ComcastLogo} />
                </Grid.Column>
            );
        case 5:
            return (
                <Grid.Column key={i}>
                    <Image src={PgeLogo} />
                </Grid.Column>
            );
        case 6:
            return (
                <Grid.Column key={i}>
                    <Image src={FirstTechLogo} />
                </Grid.Column>
            );
        case 7:
            return (
                <Grid.Column key={i}>
                    <Image src={WellsFargoLogo} />
                </Grid.Column>
            );
        case 8:
            return (
                <Grid.Column key={i}>
                    <Image src={CapOneLogo} />
                </Grid.Column>
            );
        case 9:
            return (
                <Grid.Column key={i}>
                    <Image src={ChaseLogo} />
                </Grid.Column>
            );
        case 10:
            return (
                <Grid.Column key={i}>
                    <Image src={PncLogo} />
                </Grid.Column>
            );
        case 11:
            return (
                <Grid.Column key={i}>
                    <Image src={UsBankLogo} />
                </Grid.Column>
            );
        default:
            return '';
    }
});

const clickHandlerSignIn = (props) => {
    props.showSigninBox();
};

const clickHandlerSignUp = (props) => {
    props.showSignupBox();
};

let username;
let providerName;
let accountId;
let accountType;

const setUsername = (uname) => {
    username = uname;
};

const setProviderName = pname => {
    providerName = pname;
};

const setAccountType = (type) => {
    accountType = type;
};

const setAccountId = id => {
    accountId = id;
};

const logoutProp = (props) => {
    props.logout();
};

const SignUpSignInBox = props => {
    const { rootProps } = props;
    const { isSigninOpen, isSignupOpen } = rootProps.cherry;

    return (
        <div>
            <Grid textAlign="center"
                style={{ marginTop: '20px' }}>{logosInGrid}
            </Grid>
            <Header as="h2"
                textAlign="center"
                style={{ marginBottom: '50px' }}>
                <Header.Content>
                    Cherry
                    <Header.Subheader>Cultivation of FI/Non-FI data</Header.Subheader>
                </Header.Content>
            </Header>
            <div className="root-container">
                <div className="box-controller">
                    <div
                        className={`controller${isSigninOpen ? ' selected-controller' : ''}`}
                        onClick={() => clickHandlerSignIn(rootProps)}
                    >
                        Signin
                    </div>
                    <div
                        className={`controller${isSignupOpen ? ' selected-controller' : ''}`}
                        onClick={() => clickHandlerSignUp(rootProps)}
                    >
                        Signup
                    </div>
                </div>
                <div className="box-container">
                    {isSigninOpen && <SigninBox setUname={setUsername} />}
                    {isSignupOpen && <SignupBox setUname={setUsername} />}
                </div>
            </div>
        </div>
    );
};

const redirectToLogin = ({ history }) => {
    history.push('/login');
    return null;
};

const CherryRedux = (props) => {
    const { cherry } = props;
    const { isSignIn, isSignUp } = cherry;

    return (
        <BrowserRouter>
            <>
                <Switch>
                    <Route exact
                        path="/"
                        component={redirectToLogin} />
                    <Route exact
                        path="/login"
                        render={() => <SignUpSignInBox rootProps={props} />} />
                    {(isSignIn || isSignUp) && (
                        <Route
                            exact
                            path="/provider"
                            render={propsMLH => (
                                <Provider
                                    {...propsMLH}
                                    username={username}
                                    providerName={setProviderName}
                                />
                            )}
                        />
                    )}
                    {(isSignIn || isSignUp) && (
                        <Route
                            exact
                            path="/provider/accounts"
                            render={propsMLH => (
                                <Accounts
                                    {...propsMLH}
                                    providerName={providerName}
                                    username={username}
                                    accountType={setAccountType}
                                    accountId={setAccountId}
                                    logout={() => logoutProp(props)}
                                />
                            )}
                        />
                    )}
                    {(isSignIn || isSignUp) && (
                        <Route
                            exact
                            path="/provider/account/transactions"
                            render={propsMLH => (
                                <Transactions
                                    {...propsMLH}
                                    providerName={providerName}
                                    username={username}
                                    accountId={accountId}
                                    accountType={accountType}
                                    logout={() => logoutProp(props)}
                                />
                            )}
                        />
                    )}
                    {(isSignIn || isSignUp) && (
                        <Route
                            exact
                            path="/provider/account/:accountId"
                            render={propsMLH => (
                                <Account
                                    {...propsMLH}
                                    providerName={providerName}
                                    username={username}
                                    accountType={accountType}
                                    accountId={accountId}
                                    logout={() => logoutProp(props)}
                                />
                            )}
                        />
                    )}
                    {(isSignIn || isSignUp) && (
                        <Route
                            exact
                            path="/provider/account/:accountId/transaction/:transactionId"
                            render={propsMLH => (
                                <Transaction
                                    {...propsMLH}
                                    providerName={providerName}
                                    username={username}
                                    accountType={accountType}
                                    logout={() => logoutProp(props)}
                                />
                            )}
                        />
                    )}
                    <Route render={
                        () => <center><h5>You are not signed in or Page Not Found</h5></center>
                    } />
                </Switch>
            </>
        </BrowserRouter>
    );
};

SignUpSignInBox.propTypes = {
    rootProps: PropTypes.object.isRequired,
};

CherryRedux.propTypes = {
    cherry: PropTypes.object.isRequired,
    setRenderProvider: PropTypes.func.isRequired,
    setRenderAccounts: PropTypes.func.isRequired,
    setRenderAccount: PropTypes.func.isRequired,
    setRenderTransactions: PropTypes.func.isRequired,
};

// connect requires redux store & it's corresponding actions with react component
const Cherry = connect(mapStateToProps, mapDispatchToProps)(CherryRedux);

export default Cherry;
