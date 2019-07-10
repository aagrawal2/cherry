import log from 'loglevel';
import Axios from 'axios';

export const setError = error => {
    return {
        type: 'SIGNIN_ERROR',
        payload: error
    };
};

export const signIn = (url, config, history) => {
    // return function to make use of redux-thunk middleware for handling async logic here
    return (dispatch) => {
        Axios.get(url, config)
            .then(response => {
                if (response.status === 200 && !response.data.error) {
                    // navigate to provider component
                    history.push('/provider');
                    dispatch({
                        type: 'SIGN_IN_SUCCESS'
                    });
                }
                else if (response.status === 200) {
                    // render error message in red
                    dispatch({
                        type: 'SIGNIN_ERROR',
                        payload: response.data.error
                    });
                }
                else {
                    log.error(`SignIn failed with server status:${response.status} statusText:${response.statusText} error=${response.data}`);
                    dispatch({
                        type: 'ERROR',
                        payload: response.data
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
            });
    };
};