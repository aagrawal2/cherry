import cloneDeep from 'lodash/cloneDeep';

const initialState = {
    cherry: {
        isSigninOpen: true,
        isSignupOpen: false,
        isSignIn: false,
        isSignUp: false,
        renderProvider: false,
        renderAccounts: false,
        renderAccount: false,
        renderTransactions: false
    },
    signInBox: {
        error: ''
    },
    signUpBox: {
        errors: [],
        pwdState: null,
        userAlreadyExist: false,
        btnDisabled: false
    },
    accounts: [],
    account: {
        formData: [],
        visible: false,
        success: false,
        error: false,
        message: '',
        icon: '',
        activeItem: 'Show Transactions',
    },
    transactions: {
        txnRecords: [],
        modalOpen: false,
        nestedModalOpen: false,
        searchQuery: '',
        // 90 days back is initial start date
        startDate: new Date().setDate(new Date().getDate() - 90),
        endDate: new Date() // now
    },
    transaction: {
        formData: [],
        visible: false,
        success: false,
        error: false,
        message: '',
        icon: '',
        activeItem: 'Logout'
    }
};

// custom deep copy for an Array 
// const cloneArray = items => items.map(item => Array.isArray(item) ? cloneArray(item) : item);

const reducer = (state = initialState, action) => {
    const newState = cloneDeep(state);
    if (action.type === 'SHOW_SIGNIN_BOX' || action.type === 'SHOW_SIGNUP_BOX') {
        newState.cherry.isSigninOpen = action.payload.isSigninOpen;
        newState.cherry.isSignupOpen = action.payload.isSignupOpen;
    }
    else if (action.type === 'SIGN_IN') {
        newState.cherry.isSignIn = action.payload;
    }
    else if (action.type === 'SIGN_IN_SUCCESS') {
        newState.cherry.isSignIn = true;
        newState.cherry.renderProvider = true;
    }
    else if (action.type === 'SIGN_UP') {
        newState.cherry.isSignUp = action.payload;
    }
    else if (action.type === 'SIGN_UP_SUCCESS') {
        newState.cherry.isSignUp = true;
        newState.cherry.renderProvider = true;
    }
    else if (action.type === 'RENDER_PROVIDER') {
        newState.cherry.renderProvider = action.payload;
    }
    else if (action.type === 'RENDER_ACCOUNTS') {
        newState.cherry.renderAccounts = action.payload;
    }
    else if (action.type === 'RENDER_ACCOUNT') {
        newState.cherry.renderAccount = action.payload;
    }
    else if (action.type === 'RENDER_TRANSACTIONS') {
        newState.cherry.renderTransactions = action.payload;
    }
    else if (action.type === 'LOGOUT') {
        newState.cherry.isSignIn = false;
        newState.cherry.isSignUp = false;
    }
    else if (action.type === 'SIGNIN_ERROR') {
        newState.signInBox.error = action.payload;
    }
    else if (action.type === 'SIGNUP_PWDSTATE') {
        newState.signUpBox.pwdState = action.payload;
    }
    else if (action.type === 'SIGNUP_ERRORS') {
        newState.signUpBox.errors = action.payload;
    }
    else if (action.type === 'SIGNUP_BTN_DISABLED') {
        newState.signUpBox.btnDisabled = action.payload;
    }
    else if (action.type === 'SIGNUP_USER_ALREADY_EXIST') {
        newState.signUpBox.userAlreadyExist = action.payload;
    }
    else if (action.type === 'EXISTING_ACCOUNTS' || action.type === 'ACCOUNTS_POST_ADD'
        || action.type === 'ACCOUNTS_POST_DELETE') {
        newState.accounts = action.payload;
    }
    else if (action.type === 'ACTIVE_ITEM') {
        newState.account.activeItem = action.payload;
    }
    else if (action.type === 'GET_ACCOUNT' || action.type === 'FORM_DATA_POST_CHANGE') {
        newState.account.formData = action.payload;
    }
    else if (action.type === 'PUT_ACCOUNT_FLASH_START') {
        newState.account.visible = action.payload.visible;
        newState.account.success = action.payload.success;
        newState.account.error = action.payload.error;
        newState.account.message = action.payload.message;
        newState.account.icon = action.payload.icon;
    }
    else if (action.type === 'PUT_ACCOUNT_FLASH_END') {
        newState.account.visible = action.payload.visible;
    }
    else if (action.type === 'EXISTING_TRANSACTIONS' || action.type === 'TRANSACTIONS_POST_ADD'
        || action.type === 'TRANSACTIONS_POST_DELETE') {
        newState.transactions.txnRecords = action.payload;
    }
    else if (action.type === 'INPUT_NUM_TXNS') {
        newState.transactions.searchQuery = action.payload;
    }
    else if (action.type === 'SET_MODAL_OPEN') {
        newState.transactions.modalOpen = action.payload;
    }
    else if (action.type === 'SET_NESTED_MODAL_OPEN') {
        newState.transactions.nestedModalOpen = action.payload;
    }
    else if (action.type === 'SET_START_DATE') {
        newState.transactions.startDate = action.payload;
    }
    else if (action.type === 'SET_END_DATE') {
        newState.transactions.endDate = action.payload;
    }
    else if (action.type === 'GET_TRANSACTION' || action.type === 'TXN_FORM_DATA_POST_CHANGE') {
        newState.transaction.formData = action.payload;
    }
    else if (action.type === 'PUT_TRANSACTION_FLASH_START') {
        newState.transaction.visible = action.payload.visible;
        newState.transaction.success = action.payload.success;
        newState.transaction.error = action.payload.error;
        newState.transaction.message = action.payload.message;
        newState.transaction.icon = action.payload.icon;
    }
    else if (action.type === 'PUT_TRANSACTION_FLASH_END') {
        newState.transaction.visible = action.payload.visible;
    }
    return newState;
};

export default reducer;