import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { stringNullEmptySpace } from '../shared/utility';
import Backend from '../conf/backend.json';
import { setUserAlreadyExist, setPwdState, clearValidationError, setValidationError, signUp }
    from '../redux/actions/ActionSignupBox';

const mapStateToProps = state => ({
    signUpBox: state.signUpBox
});

const mapDispatchToProps = dispatch => ({
    setPwdState: pwdState => dispatch(setPwdState(pwdState)),
    setUserAlreadyExist: flag => dispatch(setUserAlreadyExist(flag)),
    setValidationError: err => dispatch(setValidationError(err)),
    clearValidationError: elm => dispatch(clearValidationError(elm)),
    signUp: (url, reqBody, config, setUname, history) =>
        dispatch(signUp(url, reqBody, config, setUname, history))
});

const onUsernameChange = (props, setUsername, e) => {
    const { userAlreadyExist } = props.signUpBox;
    if (userAlreadyExist) {
        props.setUserAlreadyExist(false);
    }

    setUsername(e.target.value);
    props.clearValidationError('username');
};

const onPasswordChange = (props, setPassword, e) => {
    const { userAlreadyExist } = props.signUpBox;
    if (userAlreadyExist) {
        props.setUserAlreadyExist(false);
    }

    setPassword(e.target.value);
    props.clearValidationError('password');

    props.setPwdState('weak');
    if (e.target.value.length > 4) {
        props.setPwdState('medium');
    }
    if (e.target.value.length > 8) {
        props.setPwdState('strong');
    }
};

const submitSignup = (props, username, password) => {
    const { setUname, history } = props;
    if (stringNullEmptySpace(username) && stringNullEmptySpace(password)) {
        props.setValidationError({ elm: 'username', msg: 'username can\'t be empty' });
        props.setValidationError({ elm: 'password', msg: 'password can\'t be empty' });
    }
    else if (stringNullEmptySpace(username)) {
        props.setValidationError({ elm: 'username', msg: 'username can\'t be empty' });
    }
    else if (stringNullEmptySpace(password)) {
        props.setValidationError({ elm: 'password', msg: 'password can\'t be empty' });
    }
    else {
        // create user by calling backend /user api - XMLHttpRequest instance
        const config = {
            timeout: Backend.timeout
        };
        if (Backend.graphQL) {
            const reqBody = {
                // eslint-disable-next-line quotes
                query: `mutation{createUser(input:{username:"${username}",password:"${password}"})
                        {_id}}`
            };
            const url = `${Backend.baseURL}/graphql`;

            props.signUp(url, reqBody, config, setUname, history);
        }
        else {
            const reqBody = {
                username,
                password
            };
            const url = `${Backend.baseURL}/user`;

            props.signUp(url, reqBody, config, setUname, history);
        }

    }
};

const SignupBoxRedux = props => {
    const { signUpBox } = props;
    const { errors, pwdState, userAlreadyExist, btnDisabled } = signUpBox;

    // use React-Hook to inject local state username & password
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    let usernameErr = null; let passwordErr = null;

    errors.forEach(err => {
        if (err.elm === 'username') {
            usernameErr = err.msg;
        }
        else if (err.elm === 'password') {
            passwordErr = err.msg;
        }
    });

    let pwdWeak = false; let pwdMedium = false; let pwdStrong = false;
    if (pwdState === 'weak') {
        pwdWeak = true;
    }
    else if (pwdState === 'medium') {
        pwdWeak = true;
        pwdMedium = true;
    }
    else if (pwdState === 'strong') {
        pwdWeak = true;
        pwdMedium = true;
        pwdStrong = true;
    }

    return (
        <div className="inner-container">
            <div className="header">
                Signup
            </div>
            <div className="box">
                <div className="input-group">
                    <label htmlFor="username">Username</label>
                    <input type="text"
                        name="username"
                        className="login-input"
                        placeholder="Username"
                        onChange={e => onUsernameChange(props, setUsername, e)} />
                    <small className="danger-error">{usernameErr || ''}</small>
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input type="password"
                        name="password"
                        className="login-input"
                        placeholder="Password"
                        onChange={e => onPasswordChange(props, setPassword, e)} />
                    <small className="danger-error">{passwordErr || ''}</small>
                    {password &&
                        <div className="password-state">
                            <div className={`pwd pwd-weak ${pwdWeak ? 'show' : ''}`}></div>
                            <div className={`pwd pwd-medium ${pwdMedium ? 'show' : ''}`}></div>
                            <div className={`pwd pwd-strong ${pwdStrong ? 'show' : ''}`}></div>
                        </div>
                    }
                </div>
                {userAlreadyExist &&
                    <small className="danger-error">User already exist</small>
                }
                <button type="button"
                    className="login-btn"
                    disabled={btnDisabled}
                    onClick={() => submitSignup(props, username, password)}>Signup</button>
            </div>
        </div>
    );

};

SignupBoxRedux.propTypes = {
    signUpBox: PropTypes.object.isRequired
};

// connect requires redux store & it's corresponding actions with react component
const SignupBox = withRouter(connect(mapStateToProps, mapDispatchToProps)(SignupBoxRedux));

export default SignupBox;