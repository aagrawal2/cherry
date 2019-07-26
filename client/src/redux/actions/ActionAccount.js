import Axios from 'axios';
import log from 'loglevel';
import cloneDeep from 'lodash/cloneDeep';
import AccountDetails from '../../conf/provider-details.json';

const constructFormData = (accountData, providerName) => {
    const formData = [];
    // Find if any of accountTypeFields exist in accountData object
    let KEY_ACCOUNT_TYPE_FOUND = false;
    let accountTypeValue;
    AccountDetails.accountTypeFields.forEach(field => {
        const accountDataKeys = Object.keys(accountData);
        accountDataKeys.some(key => {
            if (key.toLowerCase() === field.toLowerCase()) {
                KEY_ACCOUNT_TYPE_FOUND = true;
                accountTypeValue = accountData[key];
                return true;
            }
            return false;
        });
        if (KEY_ACCOUNT_TYPE_FOUND) {
            return true;
        }
        return false;
    });

    if (!KEY_ACCOUNT_TYPE_FOUND) {
        log.error('Field for AccountType value is not found in our system,' +
            'please contact admin to add this in the system');
        return undefined;
    }

    // Map accountData field names with Labels from config file
    const accountType = accountTypeValue.toLowerCase();
    const accountDetailsConfig = AccountDetails[providerName.toLowerCase()]
        .accounts[accountType];
    accountDetailsConfig.forEach((element) => {
        const { label } = element;
        let placeholder;
        if (element.field.includes('.')) {
            const keys = element.field.split('.');
            // skip processing of field in case not found in account object
            if (!Object.prototype.hasOwnProperty.call(accountData, keys[0])) {
                return;
            }
            placeholder = accountData[keys[0]];
            for (let i = 1; i < keys.length; i++) {
                placeholder = placeholder[keys[i]];
            }
        } else {
            // skip processing of field in case not found in account object
            if (!Object.prototype.hasOwnProperty.call(accountData, element.field)) {
                return;
            }
            placeholder = accountData[element.field];
        }
        formData.push({ label, placeholder, value: '' });
    });

    return formData;
};

export const getAccount = (url, config, providerName) => {
    // return function to make use of redux-thunk middleware for handling async logic here
    return (dispatch) => {
        Axios.get(url, config)
            .then(response => {
                if (response.status === 200 && !response.data.error) {
                    // construct label & values for Form to render                
                    const formData = constructFormData(response.data[0], providerName);
                    const action = {
                        type: 'GET_ACCOUNT',
                        payload: formData
                    };
                    dispatch(action);
                }
                else {
                    log.error(`GET /account failed, server response status:${response.status}'+
                         ' and error:${response.data.error}`);
                    const action = {
                        type: 'ERROR',
                        payload: response.data.error
                    };
                    dispatch(action);
                }
            })
            .catch(error => {
                log.error(`GET /account failed, ${error.message}, ${error.stack}`);
                const action = {
                    type: 'ERROR',
                    payload: error.stack
                };
                dispatch(action);
            });
    };
};

export const putAccount = (url, config, accountDetailsConfig) => {
    return (dispatch, getState) => {
        const currentState = getState();
        const { formData } = currentState.account;
        // deep copy of this state 
        const formDataCopy = cloneDeep(formData);

        /* incorporate original fields in the formDataCopy object 
        before sending it to server             */
        formDataCopy.forEach((element) => {
            /* find this element in accountDetailsConfig
            and then extract the accessor field from this config */
            const configElement = accountDetailsConfig
                .find(configElement1 => element.label === configElement1.label);
            element.field = configElement.field.trim();
        });

        /* Build a PUT reqBody object from formData
        containing all the fields with updated values from user */
        const reqBody = {};
        formDataCopy.forEach((element) => {
            // if element.field is a nested field then xform it to object
            if (element.field.includes('.')) {
                const fields = element.field.split('.');
                const rootObj = {};
                let subObj = rootObj;
                let i = 1;
                for (; i < fields.length - 1; i++) {
                    subObj[fields[i]] = {};
                    subObj = subObj[fields[i]];
                }
                // set value to the last nested field
                if (element.value === '') {
                    subObj[fields[i]] = element.placeholder;
                } else {
                    subObj[fields[i]] = element.value;
                }
                reqBody[fields[0]] = rootObj;
            } else if (element.value === '') {
                reqBody[element.field] = element.placeholder;
            } else {
                reqBody[element.field] = element.value;
            }
        });

        // call backend api PUT /account        
        Axios.put(url, reqBody, config)
            .then((response) => {
                if (response.status === 200 && !response.error) {
                    log.info('Account update successful');
                    // show GREEN color flash message "Success"
                    const action = {
                        type: 'PUT_ACCOUNT_FLASH_START',
                        payload: {
                            visible: true,
                            success: true,
                            error: false,
                            message: 'Success',
                            icon: 'thumbs up'
                        }
                    };

                    setTimeout(
                        () => {
                            const action1 = {
                                type: 'PUT_ACCOUNT_FLASH_END',
                                payload: {
                                    visible: false
                                }
                            };
                            dispatch(action1);
                        },
                        3000
                    );

                    dispatch(action);
                } else {
                    log.error(`PUT /account failed with response status:${response.status} '+
                        'and error:${response.error}`);
                    // show RED color flash message "Failed"
                    const action = {
                        type: 'PUT_ACCOUNT_FLASH_START',
                        payload: {
                            visible: true,
                            success: false,
                            error: true,
                            message: `Failed: ${response.error}`,
                            icon: 'thumbs down'
                        }
                    };

                    setTimeout(
                        () => {
                            const action1 = {
                                type: 'PUT_ACCOUNT_FLASH_END',
                                payload: {
                                    visible: false
                                }
                            };
                            dispatch(action1);
                        },
                        3000
                    );

                    dispatch(action);
                }
            })
            .catch((error) => {
                log.error(`PUT /account failed, client-server communication error:${error.stack}`);
                // show RED color flash message "ERROR"
                const action = {
                    type: 'PUT_ACCOUNT_FLASH_START',
                    payload: {
                        visible: true,
                        success: false,
                        error: true,
                        message: `ERROR: ${error.stack}`,
                        icon: 'thumbs down'
                    }
                };

                setTimeout(
                    () => {
                        const action1 = {
                            type: 'PUT_ACCOUNT_FLASH_END',
                            payload: {
                                visible: false
                            }
                        };
                        dispatch(action1);
                    },
                    3000
                );

                dispatch(action);
            });
    };
};

export const activeItem = name => {
    return {
        type: 'ACTIVE_ITEM',
        payload: name
    };
};

export const formDataChange = (data) => {
    return {
        type: 'FORM_DATA_CHANGE',
        payload: data
    };
};