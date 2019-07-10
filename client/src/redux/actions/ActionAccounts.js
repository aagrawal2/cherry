import Axios from 'axios';
import log from 'loglevel';
import randomstring from 'randomstring';
import ProviderAccounts from '../../conf/provider-details.json';

export const getAccounts = (url, config) => {
    // return function to make use of redux-thunk middleware for handling async logic here
    return (dispatch) => {
        Axios.get(url, config)
            .then(response => {
                if (response.status === 200 && !response.data.error) {
                    const existingAccounts = response.data;
                    const action = {
                        type: 'EXISTING_ACCOUNTS',
                        payload: existingAccounts
                    };
                    dispatch(action);
                }
                else {
                    log.error(`Error response from server- status:${response.status} 
                                and error:${response.data.error}`);
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

const buildAccountPayload = (providerName, accountType) => {
    // construct account payload based on provider-details.json configuration
    const accountPayload = [{}];
    const { accountTypeFields, numericFields, alphabeticFields, currencyFields, dateFields }
        = ProviderAccounts;

    const accountFields = ProviderAccounts[providerName].accounts[accountType];
    accountFields.forEach(element => {
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
        if (accountTypeFields.includes(field)) {
            if (nestedFieldName) {
                subObj[nestedFieldName] = accountType;
                accountPayload[0][rootFieldName] = rootObj;
            }
            else {
                accountPayload[0][field] = accountType;
            }
        }
        else if (field.toLowerCase() === 'status') {
            if (nestedFieldName) {
                subObj[nestedFieldName] = 'OPEN';
                accountPayload[0][rootFieldName] = rootObj;
            }
            else {
                accountPayload[0][field] = 'OPEN';
            }
        }
        else if (field.toLowerCase().includes('rate')) {
            const oneDigitValue = randomstring.generate({
                length: 1,
                charset: 'numeric'
            });
            if (nestedFieldName) {
                subObj[nestedFieldName] = `${oneDigitValue}%`;
                accountPayload[0][rootFieldName] = rootObj;
            }
            else {
                accountPayload[0][field] = `${oneDigitValue}%`;
            }
        }
        else if (dateFields.find(subField => {
            return field.toLowerCase().includes(subField.toLowerCase());
        })) {
            if (nestedFieldName) {
                subObj[nestedFieldName] = new Date().toISOString();
                accountPayload[0][rootFieldName] = rootObj;
            }
            else {
                accountPayload[0][field] = new Date().toISOString();
            }
        }
        else if (numericFields.find(subField => {
            return field.toLowerCase().includes(subField.toLowerCase());
        })) {
            const numericOnly = randomstring.generate({
                length: 5,
                charset: 'numeric'
            });
            if (nestedFieldName) {
                subObj[nestedFieldName] = numericOnly;
                accountPayload[0][rootFieldName] = rootObj;
            }
            else {
                accountPayload[0][field] = numericOnly;
            }

        }
        else if (alphabeticFields.find(subField => {
            return field.toLowerCase().includes(subField.toLowerCase());
        })) {
            const alphabeticOnly = randomstring.generate({
                length: 7,
                charset: 'alphabetic'
            });
            if (nestedFieldName) {
                subObj[nestedFieldName] = alphabeticOnly;
                accountPayload[0][rootFieldName] = rootObj;
            }
            else {
                accountPayload[0][field] = alphabeticOnly;
            }
        }
        else if (currencyFields.find(subField => {
            return field.toLowerCase().includes(subField.toLowerCase());
        })) {
            if (nestedFieldName) {
                subObj[nestedFieldName] = 'USD';
                accountPayload[0][rootFieldName] = rootObj;
            }
            else {
                accountPayload[0][field] = 'USD';
            }
        }
        else {
            const alphanumeric = randomstring.generate(7);
            if (nestedFieldName) {
                subObj[nestedFieldName] = alphanumeric;
                accountPayload[0][rootFieldName] = rootObj;
            }
            else {
                accountPayload[0][field] = alphanumeric;
            }
        }
    });

    return accountPayload;
};

export const addAccount = (providerName, accountType, url, config) => {
    // build account payload
    const accountPayload = buildAccountPayload(providerName, accountType);

    return dispatch => {
        Axios.post(url, accountPayload, config)
            .then(response => {
                if (response.status === 201) {
                    // Use of redux and middleware to make change in state in redux store
                    const account = response.data[0];
                    dispatch({
                        type: 'ADD_ACCOUNT',
                        payload: account
                    });
                }
                else {
                    log.error(`Create /account failed, server response status=${response.status} 
                                and error:${response.data.error}`);
                    dispatch({
                        type: 'ERROR',
                        payload: `Create /account failed, server response status=${response.status} 
                                and error:${response.data.error}`
                    });
                }
            })
            .catch(error => {
                log.error(`create /account failed: ${error.stack}`);
                dispatch({
                    type: 'ERROR',
                    payload: `create /account failed: ${error.stack}`
                });
            });
    };
};

// Delete account from DB filesystem  first and then delete from in-memory redux store to render it
export const deleteAccount = (url, config, accountRow) => {
    return dispatch => {
        Axios.delete(url, config)
            .then(response => {
                if (response.status === 200 && !response.data.error) {
                    log.info('Account has been successfully deleted from backend');
                    dispatch({
                        type: 'DEL_ACCOUNT',
                        payload: accountRow
                    });
                }
                else {
                    log.error(`Account didn't get deleted from backend, 
                                resp status=${response.status} and error:${response.data.error}`);
                    dispatch({
                        type: 'ERROR',
                        payload: `Account didn't get deleted from backend, 
                                resp status=${response.status} and error:${response.data.error}`
                    });
                }
            })
            .catch(error => {
                log.error(`Account didn't get deleted from backend: ${error.stack}`);
                dispatch({
                    type: 'ERROR',
                    payload: `Account didn't get deleted from backend: ${error.stack}`
                });
            });
    };

};