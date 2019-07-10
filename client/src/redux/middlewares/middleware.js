import cloneDeep from 'lodash/cloneDeep';

// TODO: refactor this middleware to multiple middlewares - one for each component
const middlewareAction = ({ getState, dispatch }) => {
    return next => {
        return action => {
            if (action.type === 'SIGNUP_SET_VALIDATION_ERROR') {
                const error = action.payload;
                const errors = cloneDeep(getState().signUpBox.errors);
                const existingErrObj = errors.some(err => {
                    if (err.elm === error.elm) {
                        err.msg = error.msg;
                        return true;
                    }
                    return false;
                });
                if (!existingErrObj) {
                    errors.push(error);
                }
                action.type = 'SIGNUP_ERRORS';
                action.payload = errors;
                return dispatch(action);
            }
            if (action.type === 'SIGNUP_CLEAR_VALIDATION_ERROR') {
                const elm = action.payload;
                const { errors } = getState().signUpBox;
                const errorsFiltered = errors.filter(err => elm !== err.elm);
                action.type = 'SIGNUP_ERRORS';
                action.payload = errorsFiltered;
                return dispatch(action);
            }
            if (action.type === 'ADD_ACCOUNT') {
                action.type = 'ACCOUNTS_POST_ADD';
                const copyCurrentStateAccounts = [...getState().accounts];
                copyCurrentStateAccounts.push(action.payload);
                action.payload = copyCurrentStateAccounts;
                return dispatch(action);
            }
            if (action.type === 'DEL_ACCOUNT') {
                const currentState = getState();
                const filteredAccounts = currentState.accounts.filter(
                    account => account._id !== action.payload._id
                );
                action.type = 'ACCOUNTS_POST_DELETE';
                action.payload = filteredAccounts;
                return dispatch(action);
            }
            if (action.type === 'ADD_TRANSACTIONS') {
                action.type = 'TRANSACTIONS_POST_ADD';
                const copyCurrentStateTxns = [...getState().transactions.txnRecords];
                action.payload.forEach(transaction =>
                    copyCurrentStateTxns.push(transaction)
                );
                action.payload = copyCurrentStateTxns;
                return dispatch(action);
            }
            if (action.type === 'DEL_TRANSACTION') {
                const currentState = getState();
                const filteredTxns = currentState.transactions.txnRecords.filter(
                    transaction => transaction._id !== action.payload._id
                );
                action.type = 'TRANSACTIONS_POST_DELETE';
                action.payload = filteredTxns;
                return dispatch(action);
            }
            if (action.type === 'FORM_DATA_CHANGE') {
                const data = action.payload;
                const currentState = getState();
                const formDataCopy = cloneDeep(currentState.account.formData);
                formDataCopy.some(element => {
                    if (element.label === data.name) {
                        element.value = data.value;
                        return true;
                    }
                    return false;
                });
                action.type = 'FORM_DATA_POST_CHANGE';
                action.payload = formDataCopy;
                return dispatch(action);
            }
            return next(action);
        };
    };
};

export default middlewareAction;
