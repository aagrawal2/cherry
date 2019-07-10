export const showSigninBox = () => {
    return {
        type: 'SHOW_SIGNIN_BOX',
        payload: {
            isSigninOpen: true,
            isSignupOpen: false
        }
    };
};

export const showSignupBox = () => {
    return {
        type: 'SHOW_SIGNUP_BOX',
        payload: {
            isSigninOpen: false,
            isSignupOpen: true
        }
    };
};

export const setIsSignIn = flag => {
    return {
        type: 'SIGN_IN',
        payload: flag
    };
};

export const setIsSignUp = flag => {
    return {
        type: 'SIGN_UP',
        payload: flag
    };
};

export const setRenderProvider = flag => {
    return {
        type: 'RENDER_PROVIDER',
        payload: flag
    };
};

export const setRenderAccounts = flag => {
    return {
        type: 'RENDER_ACCOUNTS',
        payload: flag
    };
};

export const setRenderAccount = flag => {
    return {
        type: 'RENDER_ACCOUNT',
        payload: flag
    };
};

export const setRenderTransactions = flag => {
    return {
        type: 'RENDER_TRANSACTIONS',
        payload: flag
    };
};

export const logout = () => {
    return {
        type: 'LOGOUT'
    };
};