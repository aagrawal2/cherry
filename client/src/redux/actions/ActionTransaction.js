import Axios from 'axios';
import log from 'loglevel';
import cloneDeep from 'lodash/cloneDeep';
import TransactionDetails from '../../conf/provider-details.json';
import Backend from '../../conf/backend.json';

const constructFormData = (txnData, providerName, accountType) => {
    const formData = [];

    // Map txnData field names with Labels from config file
    const txnDetailsConfig = TransactionDetails[providerName.toLowerCase()]
        .transactions[accountType];
    txnDetailsConfig.forEach((element) => {
        const { label } = element;
        let placeholder;
        if (element.field.includes('.')) {
            const keys = element.field.split('.');
            // skip processing of field in case not found in transaction object
            if (!Object.prototype.hasOwnProperty.call(txnData, keys[0])) {
                return;
            }
            placeholder = txnData[keys[0]];
            for (let i = 1; i < keys.length; i++) {
                placeholder = placeholder[keys[i]];
            }
        } else {
            // skip processing of field in case not found in transaction object
            if (!Object.prototype.hasOwnProperty.call(txnData, element.field)) {
                return;
            }
            placeholder = txnData[element.field];
        }
        formData.push({ label, placeholder, value: '' });
    });
    return formData;
};

export const getTransaction = props => {
    // return function to make use of redux-thunk middleware for handling async logic here
    return (dispatch) => {
        const { username, providerName, accountType, match } = props;
        const { accountId, transactionId } = match.params;
        const url = `${Backend.baseURL}/user/${username}/provider/${providerName}/account/${accountId}/transaction/${transactionId}`;
        const config = {
            timeout: Backend.timeout,
        };
        Axios.get(url, config)
            .then(response => {
                if (response.status === 200 && !response.data.error) {
                    // construct label & values for Form to render                
                    const formData = constructFormData(response.data[0], providerName, accountType);
                    const action = {
                        type: 'GET_TRANSACTION',
                        payload: formData
                    };
                    dispatch(action);
                }
                else {
                    log.error(`GET /transaction failed, server response status:${response.status} and error:${response.data.error}`);
                    const action = {
                        type: 'ERROR',
                        payload: response.data.error
                    };
                    dispatch(action);
                }
            })
            .catch(error => {
                log.error(`GET /transaction failed, client-server communication error:${error.stack}`);
                const action = {
                    type: 'ERROR',
                    payload: error.stack
                };
                dispatch(action);
            });
    };
};

export const putTransaction = props => {
    const { username, providerName, accountType, match } = props;
    const { accountId, transactionId } = match.params;
    // incorporate original fields in the formData object before sending it to server
    const formData = cloneDeep(props.transaction.formData);
    const txnDetailsConfig = TransactionDetails[providerName.toLowerCase()].transactions[accountType];
    formData.forEach((element) => {
        // find this element in transactionDetailsConfig and then extract the accessor field from this config
        const configElement = txnDetailsConfig.find(configElement1 => element.label === configElement1.label);
        element.field = configElement.field.trim();
    });

    // Transform formData to PUT reqBody object containing all the fields with updated values from user
    const reqBody = {};
    formData.forEach((element) => {
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

    return dispatch => {
        // call backend api PUT /transaction
        const url = `${Backend.baseURL}/user/${username}/provider/${providerName}/account/${accountId}/transaction/${transactionId}`;
        const config = { timeout: Backend.timeout };
        Axios.put(url, reqBody, config)
            .then((response) => {
                if (response.status === 200 && !response.error) {
                    log.info('Transaction update successful');
                    // show GREEN color flash message "Success"
                    const action = {
                        type: 'PUT_TRANSACTION_FLASH_START',
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
                                type: 'PUT_TRANSACTION_FLASH_END',
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
                    log.error(`Transaction update failed with error ${response.error}`);
                    // show RED color flash message "Failed"
                    const action = {
                        type: 'PUT_TRANSACTION_FLASH_START',
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
                                type: 'PUT_TRANSACTION_FLASH_END',
                                payload: {
                                    visible: false
                                }
                            };
                            dispatch(action1);
                        },
                        5000
                    );

                    dispatch(action);
                }
            })
            .catch((error) => {
                log.error(`error while PUT /transaction ${error.stack}`);
                const action = {
                    type: 'PUT_TRANSACTION_FLASH_START',
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
                            type: 'PUT_TRANSACTION_FLASH_END',
                            payload: {
                                visible: false
                            }
                        };
                        dispatch(action1);
                    },
                    5000
                );

                dispatch(action);
            });
    };
};

export const formDataChange = formData => {
    return {
        type: 'TXN_FORM_DATA_POST_CHANGE',
        payload: formData
    };
};