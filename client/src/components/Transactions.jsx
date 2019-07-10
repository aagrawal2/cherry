import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import lifecycle from 'react-pure-lifecycle';
import {
  Menu, Dropdown, Button, Header, Modal, Label,
} from 'semantic-ui-react';
import DatePicker from 'react-datepicker';
import ReactTable from 'react-table';
import { getProviderLogo } from '../shared/utility';
import {
  getTransactions, addTransactions, delTransaction, setModalOpen, inputNumOfTxns,
  setNestedModalOpen, setStartDate, setEndDate
} from '../redux/actions/ActionTransactions';

import 'react-datepicker/dist/react-datepicker.css';
import '../scss/Transactions.scss';
import 'react-table/react-table.css';

import Provider from '../conf/provider.json';
import Backend from '../conf/backend.json';

const mapStateToProps = state => {
  return {
    transactions: state.transactions
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getTransactions: (url, config) => dispatch(getTransactions(url, config)),
    addTransactions: (props, txnStatus, totalTxns) =>
      dispatch(addTransactions(props, txnStatus, totalTxns)),
    delTransaction: (url, config, row) => dispatch(delTransaction(url, config, row)),
    setModalOpen: flag => dispatch(setModalOpen(flag)),
    inputNumOfTxns: num => dispatch(inputNumOfTxns(num)),
    setNestedModalOpen: flag => dispatch(setNestedModalOpen(flag)),
    setStartDate: date => dispatch(setStartDate(date)),
    setEndDate: date => dispatch(setEndDate(date))
  };
};

/* const clickHandlerLink = props => {
  const { accountId, accountType, setRenderTransactions } = props;
  setRenderTransactions(false, accountId, accountType);
}; */

const includeLinkInTransactionId = (props, columns) => {
  const { accountId } = props;
  columns.some((column) => {
    if (column.accessor === '_id') {
      column.Cell = e => (
        <Link
          to={`/provider/account/${accountId}/transaction/${e.value}`}
        // onClick={() => clickHandlerLink(props)}
        >
          <u>{e.value}</u>
        </Link>
      );
      return true;
    }
    return false;
  });
};

const clickHandlerDeleteTransaction = (props, row) => {
  const { username, providerName, accountId } = props;
  const url = `${Backend.baseURL}/user/${username}/provider/${providerName}
              /account/${accountId}/transaction/${row._id}`;
  const config = { timeout: Backend.timeout };

  // dispatch an action to redux-store 
  props.delTransaction(url, config, row);
};


const includeColumnDeleteAction = (props, columns) => {
  // check if action column is already part of columns 
  const FOUND_VALUE = columns.find(column => column.Header === 'Action');
  if (FOUND_VALUE) {
    return;
  };

  const action = {
    Header: 'Action',
    // eslint-disable-next-line react/prop-types
    Cell: ({ row }) => (
      <Button
        icon="delete"
        color="red"
        size="mini"
        onClick={() => {
          clickHandlerDeleteTransaction(props, row);
        }}
      />
    ),
    sortable: false,
    width: 70,
    style: {
      textAlign: 'center',
    },
  };
  columns.push(action);
};

// customize lifecycle method
const componentDidMount = props => {
  const { username, providerName, accountId } = props;
  const columns = Provider[providerName].transactions;

  includeLinkInTransactionId(props, columns);
  includeColumnDeleteAction(props, columns);

  const url = `${Backend.baseURL}/user/${username}/provider/${providerName}
              /account/${accountId}/transactions`;
  const config = { timeout: Backend.timeout };

  // dispatch GET /transactions action to redux-store to render existing transactions
  props.getTransactions(url, config);
};

const methods = {
  componentDidMount
};

let txnStatus;
let totalTxns = 1; // modal dropdown placeholder default vale

const clickHandlerTxnStatus = (props, data) => {
  txnStatus = data.children;
  props.setModalOpen(true);
};

const changeHandlerSearchQuery = (props, { searchQuery }) => {
  totalTxns = Number(searchQuery);
  props.inputNumOfTxns(searchQuery);
};

const changeHandlerNumOfTxns = (e, { searchQuery, value }) => {
  if (searchQuery) {
    totalTxns = Number(searchQuery);
  }
  else {
    totalTxns = value;
  }
};

const clickHandlerCancelModal = props => {
  props.setModalOpen(false);
};

const clickHandlerContinueModal = props => {
  if (txnStatus.toLowerCase() === 'posted') {
    props.setNestedModalOpen(true);
  } else {
    // close parent model
    props.setModalOpen(false);

    // create pending transactions with default values
    props.addTransactions(props, txnStatus, totalTxns);
  }
};

const changeHandlerStartDate = (props, date) => {
  props.setStartDate(date);
};

const changeHandlerEndDate = (props, date) => {
  props.setEndDate(date);
};

const clickHandlerCancelNestedModal = props => {
  props.setNestedModalOpen(false);
};

const clickHandlerContinueNestedModal = props => {
  // close both modals
  props.setNestedModalOpen(false);
  props.setModalOpen(false);

  // create posted transactions with default values
  props.addTransactions(props, txnStatus, totalTxns);
};

const nestedModal = props => {
  const { transactions } = props;
  const { nestedModalOpen, startDate, endDate } = transactions;

  return (
    <Modal
      trigger={(
        <Button
          color="green"
          icon="checkmark"
          content="Continue"
          onClick={() => clickHandlerContinueModal(props)}
        />
      )}
      size="small"
      open={nestedModalOpen}
      closeOnDimmerClick={false}
    >
      <Modal.Actions>
        <div className="grid-container">
          <Label icon="calendar alternate outline"
            content="Start Date" />
          <Label icon="calendar alternate outline"
            content="End Date" />
          <DatePicker
            selected={startDate}
            onChange={date => changeHandlerStartDate(props, date)}
          />
          <DatePicker
            selected={endDate}
            onChange={date => changeHandlerEndDate(props, date)}
          />
        </div>
        <div className="button-group-modal2">
          <Button
            color="red"
            icon="cancel"
            content="Cancel"
            onClick={() => clickHandlerCancelNestedModal(props)}
          />
          <Button
            color="green"
            icon="checkmark"
            content="Continue"
            onClick={() => clickHandlerContinueNestedModal(props)}
          />
        </div>
      </Modal.Actions>
    </Modal>
  );
};

const TransactionsRedux = props => {
  const { transactions, providerName, logout } = props;
  const { txnRecords, modalOpen, searchQuery } = transactions;
  const columns = Provider[providerName].transactions;

  return (
    <div>
      <Header as="h1"
        image={getProviderLogo(providerName)} />
      <div className="transactions">
        <Menu pointing
          secondary>
          <Dropdown item
            text="Create Transactions">
            <Dropdown.Menu>
              <Dropdown.Header>with default values</Dropdown.Header>
              <Modal
                trigger={(
                  <Menu.Item onClick={(e, data) => clickHandlerTxnStatus(props, data)}>
                    Posted
                  </Menu.Item>
                )}
                basic
                size="mini"
                closeOnDimmerClick={false}
                open={modalOpen}
              >
                <Modal.Content>
                  <h3>Enter number of transactions to create</h3>
                </Modal.Content>
                <Modal.Actions>
                  <Dropdown
                    options={[
                      { key: 1, text: 1, value: 1 },
                      { key: 5, text: 5, value: 5 },
                      { key: 10, text: 10, value: 10 },
                      { key: 20, text: 20, value: 20 },
                      { key: 50, text: 50, value: 50 },
                      { key: 100, text: 100, value: 100 },
                    ]}
                    placeholder="1"
                    selection
                    search
                    searchQuery={searchQuery}
                    onSearchChange={(e, value) => changeHandlerSearchQuery(props, value)}
                    onChange={changeHandlerNumOfTxns}
                  />
                  <div className="button-group-modal1">
                    <Button
                      color="red"
                      icon="cancel"
                      content="Cancel"
                      onClick={() => clickHandlerCancelModal(props)}
                    />
                    &nbsp;&nbsp;
                      {nestedModal(props)}
                  </div>
                </Modal.Actions>
              </Modal>
              <Modal
                trigger={(
                  <Menu.Item onClick={(e, data) => clickHandlerTxnStatus(props, data)}>
                    Pending
                  </Menu.Item>
                )}
                basic
                size="mini"
                closeOnDimmerClick={false}
                open={modalOpen}
              >
                <Modal.Content>
                  <h3>Enter number of transactions to create</h3>
                </Modal.Content>
                <Modal.Actions>
                  <Dropdown
                    options={[
                      { key: 1, text: 1, value: 1 },
                      { key: 5, text: 5, value: 5 },
                      { key: 10, text: 10, value: 10 },
                      { key: 20, text: 20, value: 20 },
                      { key: 50, text: 50, value: 50 },
                      { key: 100, text: 100, value: 100 },
                    ]}
                    placeholder="1"
                    selection
                    search
                    searchQuery={searchQuery}
                    onSearchChange={(e, value) => changeHandlerSearchQuery(props, value)}
                    onChange={changeHandlerNumOfTxns}
                  />
                  <div className="button-group-modal1">
                    <Button
                      color="red"
                      icon="cancel"
                      content="Cancel"
                      onClick={() => clickHandlerCancelModal(props)}
                    />
                    &nbsp;&nbsp;
                      {nestedModal(props)}
                  </div>
                </Modal.Actions>
              </Modal>
            </Dropdown.Menu>
          </Dropdown>
          <Menu.Menu position="right">
            <Menu.Item name="Logout"
              onClick={logout} />
          </Menu.Menu>
        </Menu>
      </div>
      <ReactTable
        className="transactions-table"
        defaultPageSize={20}
        data={txnRecords}
        columns={columns}
        noDataText="You don't have any transactions yet"
      />
    </div>
  );
};

nestedModal.propTypes = {
  transactions: PropTypes.object.isRequired
};

TransactionsRedux.propTypes = {
  transactions: PropTypes.object.isRequired,
  providerName: PropTypes.string.isRequired,
  logout: PropTypes.func.isRequired
};

// decorate the component
const TransactionsReduxDecorated = lifecycle(methods)(TransactionsRedux);

// connect requires redux store & it's corresponding actions with react component
const Transactions = connect(mapStateToProps, mapDispatchToProps)(TransactionsReduxDecorated);

export default Transactions;