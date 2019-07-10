import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import lifecycle from 'react-pure-lifecycle';
import {
    Form, Header, Transition, Message, Menu,
} from 'semantic-ui-react';

import { getAccount, putAccount, activeItem, formDataChange } from '../redux/actions/ActionAccount';
import AccountDetails from '../conf/provider-details.json';
import Backend from '../conf/backend.json';

import BofaLogo from '../images/bofa.jpg';
import CitiLogo from '../images/citi.jpg';
import AmexLogo from '../images/amex.jpg';
import ComcastLogo from '../images/comcast.jpg';
import FirstTechLogo from '../images/firsttech.jpg';
import WellsFargoLogo from '../images/wellsfargo.jpg';

import '../scss/Account.scss';

const mapStateToProps = state => {
    return {
        account: state.account
    };
};

const mapDispatchToProps = dispatch => {
    return {
        getAccount: (url, config, providerName) => dispatch(getAccount(url, config, providerName)),
        putAccount: (url, config, accountDetailsConfig) =>
            dispatch(putAccount(url, config, accountDetailsConfig)),
        activeItem: name => dispatch(activeItem(name)),
        formDataChange: data => dispatch(formDataChange(data))
    };
};

// customize lifecycle methods 
const componentDidMount = props => {
    const { username, providerName, match } = props;
    // used redux action to call /account/${accountId} api to get details about the account    
    const url = `${Backend.baseURL}/user/${username}/provider/${providerName}
                /account/${match.params.accountId}`;
    const config = {
        timeout: Backend.timeout,
    };

    // dispatch action to redux reducer 
    props.getAccount(url, config, providerName);
};

const methods = {
    componentDidMount
};

const getLogo = (providerName) => {
    switch (providerName) {
        case 'bofa':
            return BofaLogo;
        case 'citi':
            return CitiLogo;
        case 'amex':
            return AmexLogo;
        case 'fcu':
            return FirstTechLogo;
        case 'wf':
            return WellsFargoLogo;
        case 'comcast':
            return ComcastLogo;
        default:
    }
    return '';
};

const changeHandlerFormValue = (props, data) => {
    props.formDataChange(data);
};

const groupFormData = (props, index, groupSize) => {
    const { account } = props;
    const { formData } = account;
    const groupInputs = [];
    let formGroupInputKey = 0;
    for (let i = 0; i < groupSize; i++) {
        const { label, placeholder, value } = formData[index + i];
        groupInputs.push(
            <Form.Input
                key={formGroupInputKey}
                label={label}
                name={label}
                placeholder={placeholder}
                value={value}
                onChange={(e, data) => changeHandlerFormValue(props, data)}
            />,
        );
        formGroupInputKey += 1;
    }

    return groupInputs;
};

const loadFormGroups = props => {
    const { account, providerName } = props;
    const { formData } = account;
    const formGroups = [];
    const FORM_GROUP_SIZE = AccountDetails[providerName].accounts.form_group_size;
    let index = 0;
    let lengthFormData = formData.length;
    let formGroupKey = 0;
    while (lengthFormData - FORM_GROUP_SIZE > 0) {
        lengthFormData -= FORM_GROUP_SIZE;
        const formGroup = <Form.Group key={formGroupKey}
            widths="equal">{groupFormData(props, index, FORM_GROUP_SIZE)}</Form.Group>;
        formGroupKey += 1;
        formGroups.push(formGroup);
        index += FORM_GROUP_SIZE;
    }
    if (lengthFormData > 0) {
        const formGroup = <Form.Group key={formGroupKey}
            widths="equal">{groupFormData(props, index, lengthFormData)}</Form.Group>;
        formGroups.push(formGroup);
    }

    return formGroups;
};

const showTransactions = (props, name) => {
    // update redux store state via redux-thunk - which menu item is currently active
    props.activeItem(name);

    const { history } = props;
    history.push('/provider/account/transactions');
};

const clickHandlerLogout = (props, name) => {
    // update redux store state via redux-thunk - which menu item is currently active
    props.activeItem(name);

    const { logout } = props;
    logout();
};

const clickHandlerFormSubmit = props => {
    const { match, username, providerName, accountType } = props;

    // call backend api PUT /account via redux-thunk async 
    const url = `${Backend.baseURL}/user/${username}/provider/${providerName}
                /account/${match.params.accountId}`;
    const config = { timeout: Backend.timeout };
    const accountDetailsConfig = AccountDetails[providerName].accounts[accountType];
    props.putAccount(url, config, accountDetailsConfig);
};

const AccountRedux = props => {
    const { account, providerName } = props;
    const {
        visible, success, error, message, icon
    } = account;
    return (
        <div>
            <Header as="h1"
                image={getLogo(providerName)} />

            <div className="account-menu">
                <Menu pointing
                    secondary>
                    <Menu.Item name="Show Transactions"
                        active={account.activeItem === 'Show Transactions'}
                        onClick={(e, { name }) => showTransactions(props, name)} />
                    <Menu.Menu position="right">
                        <Menu.Item name="Logout"
                            active={account.activeItem === 'Logout'}
                            onClick={(e, { name }) => clickHandlerLogout(props, name)} />
                    </Menu.Menu>
                </Menu>
            </div>

            <Form className="account-form"
                onSubmit={() => clickHandlerFormSubmit(props)}>
                {loadFormGroups(props)}
                <Form.Button
                    className="form-button"
                    content="Save"
                    icon="save"
                />
            </Form>

            <Transition visible={visible}>
                <Message
                    style={{ textAlign: 'center' }}
                    icon={icon}
                    success={success}
                    error={error}
                    content={message}
                />
            </Transition>
        </div>
    );
};

AccountRedux.propTypes = {
    account: PropTypes.object.isRequired,
    providerName: PropTypes.string.isRequired,
};

// decorate the component
const AccountReduxDecorated = lifecycle(methods)(AccountRedux);

// connect is HOC - which binds state & actions to the above stateless component via props
const Account = connect(mapStateToProps, mapDispatchToProps)(AccountReduxDecorated);

export default Account;