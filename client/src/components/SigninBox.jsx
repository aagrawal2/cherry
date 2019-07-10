import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { setError, signIn } from '../redux/actions/ActionSigninBox';
import { stringNullEmptySpace } from '../shared/utility';
import Backend from '../conf/backend.json';

const mapStateToProps = state => {
    return {
        signInBox: state.signInBox
    };
};

const mapDispatchToProps = dispatch => {
    return {
        // setUsername: username => dispatch(setUsername(username)),
        // setPassword: password => dispatch(setPassword(password)),
        setError: error => dispatch(setError(error)),
        signIn: (url, config, history) => dispatch(signIn(url, config, history))
    };
};

const changeHandlerUsername = (props, setUsername, e) => {
    const { error } = props.signInBox;
    if (error) {
        props.setError('');
    }
    setUsername(e.target.value);
};

const changeHandlerPassword = (props, setPassword, e) => {
    const { error } = props.signInBox;
    if (error) {
        props.setError('');
    }
    setPassword(e.target.value);
};

const clickHandlerSubmitLogin = (props, username, password) => {
    const { setUname, history } = props;

    // Validate username & password before calling backend api
    if (stringNullEmptySpace(username) && stringNullEmptySpace(password)) {
        props.setError('username & password can\'t be empty');
    }
    else if (stringNullEmptySpace(username)) {
        props.setError('username can\'t be empty');
    }
    else if (stringNullEmptySpace(password)) {
        props.setError('password can\'t be empty');
    }
    else {
        setUname(username);

        // call backend /user api to signin
        const url = `${Backend.baseURL}/user/?username=${username}&password=${password}`;
        const config = {
            timeout: Backend.timeout
        };
        // dispatch an action to redux-store 
        props.signIn(url, config, history);
    }
};

const SigninBoxRedux = props => {
    const { signInBox } = props;
    const { error } = signInBox;
    // use of React-Hook to inject local state in functional component
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    return (
        <div className="inner-container">
            <div className="header">
                Signin
            </div>
            <div className="box">
                <div className="input-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        name="username"
                        className="login-input"
                        placeholder="Username"
                        onChange={e => changeHandlerUsername(props, setUsername, e)}
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        name="password"
                        className="login-input"
                        placeholder="Password"
                        onChange={e => changeHandlerPassword(props, setPassword, e)}
                    />
                </div>
                {error && (
                    <div>
                        <small className="danger-error">{error}</small>
                    </div>
                )}
                <button type="button"
                    className="login-btn"
                    onClick={
                        () => clickHandlerSubmitLogin(props, username, password)
                    }
                > Signin
                </button>
            </div>
        </div>
    );
};

SigninBoxRedux.propTypes = {
    signInBox: PropTypes.object.isRequired
};

// connect requires redux store & it's corresponding actions with react component
const SigninBox = withRouter(connect(mapStateToProps, mapDispatchToProps)(SigninBoxRedux));

export default SigninBox;

