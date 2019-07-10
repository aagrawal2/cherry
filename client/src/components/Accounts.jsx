import React from 'react';
import PropTypes from 'prop-types';

// TODO:make use of loglevel-plugin-remote to send client logs to remote server
import { connect } from 'react-redux';
import lifecycle from 'react-pure-lifecycle';
import {
    Menu, Dropdown, Button, Header,
} from 'semantic-ui-react';
import ReactTable from 'react-table';
import '../scss/Accounts.scss';
import 'react-table/react-table.css';
import { Link } from 'react-router-dom';
import randomstring from 'randomstring';
import log from 'loglevel';

import store from '../redux/store/store';
import { getAccounts, addAccount, deleteAccount } from '../redux/actions/ActionAccounts';

import Provider from '../conf/provider.json';
import { getProviderLogo } from '../shared/utility';
import Backend from '../conf/backend.json';
import ProviderAccounts from '../conf/provider-details.json';

const mapStateToProps = state => {
    return {
        accounts: state.accounts
    };
};

function mapDispatchToProps(dispatch) {
    return {
        getAccounts: (url, config) => dispatch(getAccounts(url, config)),
        addAccount: (providerName, accountType, url, config) =>
            dispatch(addAccount(providerName, accountType, url, config)),
        deleteAccount: (url, config, accountRow) => dispatch(deleteAccount(url, config, accountRow))
    };
};

const getSelectedAccountType = (accounts, accountId) => {
    const filteredAccount = accounts.filter(account => account._id === accountId)[0];
    // look for accountType field in above object, field name is configured 
    let accountType;
    Object.keys(filteredAccount).some(key => {
        if (ProviderAccounts.accountTypeFields
            .some(field => key.toLowerCase() === field.toLowerCase())) {
            accountType = filteredAccount[key];
            return true;
        }
        return false;
    });

    return accountType;
};

/* This method is to deliberately update 'renderAccounts' state of Cherry.jsx 
    component for back navigation to work, coz rendering of Account.jsx component
    is through 'Link' from Accounts.jsx component which changes url path and renders 
    via 'match' prop using 'switch' component. So we don't explcitly change state before 
    rendering Account.jsx component. 
*/
const clickHandlerLink = (props, accountId) => {
    /* get current state, can't use props.accounts here coz props would have old 
    instance of accounts  */
    const { accounts } = store.getState();

    // get selected accountType
    const accountType = getSelectedAccountType(accounts, accountId);

    if (!accountType) {
        log.error('Mandatory field account type is missing in account entity' +
            'the field name can be configured in provider - details.json file');
    }
    else {
        /* set accountType & accountId in Cherry root/parent component to be passed 
        to desired child component */
        props.accountType(accountType);
        props.accountId(accountId);
    }
};

const includeLinkInAccountId = (props, columns) => {
    columns.some(column => {
        if (column.accessor === '_id') {
            if (!column.Cell)
                column.Cell = e => <Link to={`/provider/account/${e.value}`}
                    onClick={() => clickHandlerLink(props, e.value)}><u>{e.value}</u></Link>;
            return true;
        }
        return false;
    });
};

// Delete Account 
const deleteAccountRow = (props, row) => {
    const url = `${Backend.baseURL}/user/${props.username}/provider/${props.providerName}
                /account/${row._id}`;
    const config = { timeout: Backend.timeout };
    // make use of redux middleware to have the delete logic outside the react component
    props.deleteAccount(url, config, row);  // dispatch delete action    
};

const includeColumnDeleteAction = (props, columns) => {
    // check if action column is already part of columns 
    const FOUND_VALUE = columns.find(column => column.Header === 'Action');
    if (FOUND_VALUE) {
        return;
    }
    const action = {
        Header: 'Action',
        // eslint-disable-next-line react/prop-types
        Cell: ({ row }) => {
            return <Button icon="delete"
                color="red"
                size="mini"
                onClick={() => { deleteAccountRow(props, row); }} />;
        },
        sortable: false,
        width: 70,
        style: {
            textAlign: 'center'
        }
    };
    columns.push(action);
};

// customize lifecycle methods 
const componentDidMount = (props) => {
    const { username, providerName } = props;
    const columns = Provider[providerName].accounts;

    includeLinkInAccountId(props, columns);
    includeColumnDeleteAction(props, columns);

    // This state changing logic is in redux using redux-thunk
    // call backend api to get /accounts of an user for a given provider    
    const url = `${Backend.baseURL}/user/${username}/provider/${providerName}/accounts`;
    const config = { timeout: Backend.timeout };
    // dispatch an action to Redux store for change in state
    props.getAccounts(url, config);
};

// make lifecycle methods as properties on standard object
const methods = {
    componentDidMount
};



const getProviderAccountTypes = (providerName) => {
    const selectedProvider = Provider.names.find(element => {
        return element.value === providerName;
    });

    return selectedProvider.accounttypes;
};

// Create Account Handler with default values
const clickHandlerCreateAccount = (data, props) => {
    // call backend api to create account 
    const accountType = data.children.toLowerCase();
    const { providerName } = props;
    const url = `${Backend.baseURL}/user/${props.username}/provider/${providerName}/accounts`;
    const config = { timeout: Backend.timeout };

    props.addAccount(providerName, accountType, url, config);
};

const loadProviderDropdownItems = (props) => {
    const dropdownItems = [];
    const accountTypes = getProviderAccountTypes(props.providerName);
    accountTypes.forEach(value => {
        const key = randomstring.generate(4);
        dropdownItems.push(<Dropdown.Item key={key}
            onClick={
                (event, data) => clickHandlerCreateAccount(data, props)
            }
        >{value}
        </Dropdown.Item>);
    });
    return dropdownItems;
};

const AccountsRedux = props => {
    // eslint-disable-next-line react/prop-types
    const { accounts, providerName, logout } = props;
    const columns = Provider[providerName].accounts;

    return (
        <div>
            <Header as="h1"
                image={getProviderLogo(providerName)} />
            <div className="accounts">
                <Menu pointing
                    secondary>
                    <Dropdown item
                        text="Create Accounts">
                        <Dropdown.Menu>
                            <Dropdown.Header>with default values</Dropdown.Header>
                            {loadProviderDropdownItems(props)}
                        </Dropdown.Menu>
                    </Dropdown>
                    <Menu.Menu position="right">
                        <Menu.Item name="Logout"
                            onClick={() => logout()} />
                    </Menu.Menu>
                </Menu>
            </div>
            <ReactTable className="accounts-table"
                defaultPageSize={5}
                data={accounts}
                columns={columns} />
        </div>
    );
};

AccountsRedux.propTypes = {
    providerName: PropTypes.string.isRequired,
    accounts: PropTypes.array.isRequired,
    logout: PropTypes.func.isRequired,
};

// decorate the component
const AccountsReduxDecorated = lifecycle(methods)(AccountsRedux);

// connect requires redux store & it's corresponding actions with react component
const Accounts = connect(mapStateToProps, mapDispatchToProps)(AccountsReduxDecorated);

export default Accounts;