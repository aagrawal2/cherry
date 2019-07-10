import Axios from 'axios';
import log from 'loglevel';
import randomstring from 'randomstring';
import ProviderTransactions from '../../conf/provider-details.json';
import Backend from '../../conf/backend.json';

export const inputNumOfTxns = num => {
    return {
        type: 'INPUT_NUM_TXNS',
        payload: num
    };
};

export const setModalOpen = flag => {
    return {
        type: 'SET_MODAL_OPEN',
        payload: flag
    };
};

export const setNestedModalOpen = flag => {
    return {
        type: 'SET_NESTED_MODAL_OPEN',
        payload: flag
    };
};

export const setStartDate = date => {
    return {
        type: 'SET_START_DATE',
        payload: date
    };
};

export const setEndDate = date => {
    return {
        type: 'SET_END_DATE',
        payload: date
    };
};

export const getTransactions = (url, config) => {
    // return function to make use of redux-thunk middleware for handling async logic here
    return (dispatch) => {
        Axios.get(url, config)
            .then(response => {
                if (response.status === 200 && !response.data.error) {
                    const existingTransactions = response.data;
                    const action = {
                        type: 'EXISTING_TRANSACTIONS',
                        payload: existingTransactions
                    };
                    dispatch(action);
                }
                else {
                    log.error(`GET /transactions failed with server status=${response.status} and error:${response.data.error}`);
                    const action = {
                        type: 'ERROR',
                        payload: response.data.error
                    };
                    dispatch(action);
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

// Func to build txn object
const buildTxnObject = (props, txnStatus, dateString) => {
    const txnObject = {};
    const { providerName, accountType } = props;
    const {
        numericFields, alphabeticFields, currencyFields, dateFields,
    } = ProviderTransactions;
    const txnFields = ProviderTransactions[providerName].transactions[accountType.toLowerCase()];

    txnFields.forEach((element) => {
        const { field } = element;

        // handle nested fields using . operator
        const rootObj = {};
        let subObj = rootObj;
        let nestedFieldName;
        let rootFieldName;
        if (field.includes('.')) {
            const fields = field.split('.');
            let i = 1;
            for (; i < fields.length - 1; i++) {
                subObj[fields[i]] = {};
                subObj = subObj[fields[i]];
            }
            nestedFieldName = fields[i];
            rootFieldName = fields[0];
        }

        // Logic to assign default values to either nestedField or simpleField
        // assign status as selected from dropdown posted/pending
        if (field.toLowerCase() === 'status') {
            if (nestedFieldName) {
                subObj[nestedFieldName] = txnStatus;
                txnObject[rootFieldName] = rootObj;
            } else {
                txnObject[field] = txnStatus;
            }
        } else if (
            dateFields.find(subField => field.toLowerCase().includes(subField.toLowerCase()))
        ) {
            if (dateString) {
                if (nestedFieldName) {
                    subObj[nestedFieldName] = dateString;
                    txnObject[rootFieldName] = rootObj;
                } else {
                    txnObject[field] = dateString;
                }
            } else if (!dateString && !field.toLowerCase().includes('posted')) {
                if (nestedFieldName) {
                    subObj[nestedFieldName] = new Date().toISOString();
                    txnObject[rootFieldName] = rootObj;
                } else {
                    txnObject[field] = new Date().toISOString();
                }
            }
        } else if (
            numericFields.find(subField => field.toLowerCase()
                .includes(subField.toLowerCase()))
        ) {
            const numericOnly = randomstring.generate({
                length: 5,
                charset: 'numeric',
            });
            if (nestedFieldName) {
                subObj[nestedFieldName] = numericOnly;
                txnObject[rootFieldName] = rootObj;
            } else {
                txnObject[field] = numericOnly;
            }
        } else if (
            alphabeticFields.find(subField => field.toLowerCase()
                .includes(subField.toLowerCase()))
        ) {
            const alphabeticOnly = randomstring.generate({
                length: 7,
                charset: 'alphabetic',
            });
            if (nestedFieldName) {
                subObj[nestedFieldName] = alphabeticOnly;
                txnObject[rootFieldName] = rootObj;
            } else {
                txnObject[field] = alphabeticOnly;
            }
        } else if (
            currencyFields.find(subField => field.toLowerCase()
                .includes(subField.toLowerCase()))
        ) {
            if (nestedFieldName) {
                subObj[nestedFieldName] = 'USD';
                txnObject[rootFieldName] = rootObj;
            } else {
                txnObject[field] = 'USD';
            }
        } else {
            const alphanumeric = randomstring.generate(7);
            if (nestedFieldName) {
                subObj[nestedFieldName] = alphanumeric;
                txnObject[rootFieldName] = rootObj;
            } else {
                txnObject[field] = alphanumeric;
            }
        }
    });
    return txnObject;
};

// Func to return range of dates
const getDates = (startDate, endDate) => {
    const dates = [];
    const date = new Date(startDate);
    while (date <= endDate) {
        dates.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }
    return dates;
};

// construct txn payload based on provider-details.json configuration
const buildTxnsPayload = (props, txnStatus, totalTxns) => {
    const txnsPayload = [];
    const { transactions } = props;
    const { startDate, endDate } = transactions;

    // Create txnPayload based on posted/pending selection by user
    if (txnStatus.toLowerCase() === 'posted') {
        // generate posted date between selected startDate & endDate    
        const dates = getDates(startDate, endDate);

        let dateIndex = dates.length - 1;
        for (let i = 1; i <= totalTxns; i++) {
            if (dateIndex < 0) {
                dateIndex = dates.length - 1;
            }
            const date = dates[dateIndex];
            dateIndex -= 1;
            const txnObject = buildTxnObject(props, txnStatus, date.toISOString());
            txnsPayload.push(txnObject);
        }
    } else {
        // pending
        for (let i = 1; i <= totalTxns; i++) {
            const txnObject = buildTxnObject(props, txnStatus);
            txnsPayload.push(txnObject);
        }
    }

    return txnsPayload;
};

export const addTransactions = (props, txnStatus, totalTxns) => {
    const { username, providerName, accountId } = props;
    // build txnPayload 
    const txnsPayload = buildTxnsPayload(props, txnStatus, totalTxns);
    const url = `${Backend.baseURL}/user/${username}/provider/${providerName}/account/${accountId}/transactions`;
    const config = { timeout: Backend.timeout };

    // return function to make use of redux-thunk middleware for handling async logic here
    return (dispatch) => {
        Axios.post(url, txnsPayload, config)
            .then(response => {
                if (response.status === 201 && !response.data.error) {
                    const newTransactions = response.data;
                    const action = {
                        type: 'ADD_TRANSACTIONS',
                        payload: newTransactions
                    };
                    dispatch(action);
                }
                else {
                    log.error(`POST /transactions failed with server status=${response.status} and error:${response.data.error}`);
                    const action = {
                        type: 'ERROR',
                        payload: response.data.error
                    };
                    dispatch(action);
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

export const delTransaction = (url, config, row) => {
    // return function to make use of redux-thunk middleware for handling async logic here
    return (dispatch) => {
        Axios.delete(url, config)
            .then(response => {
                if (response.status === 200 && !response.data.error) {
                    // delete transaction in-memory from redux-store for ui to render
                    const action = {
                        type: 'DEL_TRANSACTION',
                        payload: row
                    };
                    dispatch(action);
                }
                else {
                    log.error(`DEL /transaction failed with server status=${response.status} and error:${response.data.error}`);
                    const action = {
                        type: 'ERROR',
                        payload: response.data.error
                    };
                    dispatch(action);
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