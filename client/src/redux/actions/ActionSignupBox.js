import Axios from 'axios';
import log from 'loglevel';

export const setPwdState = pwdState => ({
    type: 'SIGNUP_PWDSTATE',
    payload: pwdState
});

export const setUserAlreadyExist = flag => ({
    type: 'SIGNUP_USER_ALREADY_EXIST',
    payload: flag
});

export const setValidationError = err => ({
    type: 'SIGNUP_SET_VALIDATION_ERROR',
    payload: err
});

export const clearValidationError = elm => ({
    type: 'SIGNUP_CLEAR_VALIDATION_ERROR',
    payload: elm
});

export const signUp = (url, reqBody, config, setUname, history) => {
    // return function to make use of redux-thunk middleware for handling async logic here
    return (dispatch) => {
        // disable submit button first
        dispatch({
            type: 'SIGNUP_BTN_DISABLED',
            payload: true
        });
        Axios.post(url, reqBody, config)
            .then(response => {
                if (response.status === 201) {
                    setUname(reqBody.username);
                    // navigate to provider component
                    history.push('/provider');
                    dispatch({
                        type: 'SIGN_UP_SUCCESS'
                    });
                    // enable submit button 
                    dispatch({
                        type: 'SIGNUP_BTN_DISABLED',
                        payload: false
                    });
                }
                else if (response.status === 200) {
                    // render error message in red
                    dispatch({
                        type: 'SIGNUP_USER_ALREADY_EXIST',
                        payload: true
                    });
                    // enable submit button 
                    dispatch({
                        type: 'SIGNUP_BTN_DISABLED',
                        payload: false
                    });
                }
                else {
                    log.error(`Unexpected response with status:${response.status}, statusText:${response.statusText}, data:${response.data}`);
                    dispatch({
                        type: 'ERROR',
                        payload: response.data
                    });
                    // enable submit button 
                    dispatch({
                        type: 'SIGNUP_BTN_DISABLED',
                        payload: false
                    });
                }
            })
            .catch(error => {
                log.error(`client-server communication error:${error.stack}`);
                const action = {
                    type: 'ERROR',
                    payload: error.stack
                };
                dispatch(action);
                // enable submit button 
                dispatch({
                    type: 'SIGNUP_BTN_DISABLED',
                    payload: false
                });
            });
    };
};