import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import lifecycle from 'react-pure-lifecycle';
import {
  Form, Header, Transition, Message, Menu,
} from 'semantic-ui-react';

import cloneDeep from 'lodash/cloneDeep';
import { getTransaction, putTransaction, formDataChange } from '../redux/actions/ActionTransaction';

import TransactionDetails from '../conf/provider-details.json';

import BofaLogo from '../images/bofa.jpg';
import CitiLogo from '../images/citi.jpg';
import AmexLogo from '../images/amex.jpg';
import ComcastLogo from '../images/comcast.jpg';
import FirstTechLogo from '../images/firsttech.jpg';
import WellsFargoLogo from '../images/wellsfargo.jpg';

import '../scss/Transaction.scss';

const mapStateToProps = state => ({
  transaction: state.transaction
});

const mapDispatchToProps = dispatch => ({
  getTransaction: props => dispatch(getTransaction(props)),
  putTransaction: props => dispatch(putTransaction(props)),
  formDataChange: formData => dispatch(formDataChange(formData))
});

// custom lifecycle method
const componentDidMount = props => {
  props.getTransaction(props);
};

const methods = {
  componentDidMount
};

const getLogo = providerName => {
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
  const formData = cloneDeep(props.transaction.formData);
  formData.some(element => {
    if (element.label === data.name) {
      element.value = data.value;
      return true;
    }
    return false;
  });

  // dispatch an action to update form data 
  props.formDataChange(formData);
};

const groupFormData = (props, formData, index, groupSize) => {
  const groupInputs = [];
  let formGroupInputKey = 0;
  for (let i = 0; i < groupSize; i++) {
    // const key = Math.random().toString(36).substr(2);
    const { label, placeholder, value } = formData[index + i];
    groupInputs.push(<Form.Input
      key={formGroupInputKey}
      label={label}
      name={label}
      placeholder={placeholder}
      value={value}
      /* implement event caching for performance optimization to optimize 
        function definition inside loop */
      // eslint-disable-next-line no-loop-func
      onChange={(e, data) => changeHandlerFormValue(props, data)}
    />);
    formGroupInputKey += 1;
  }

  return groupInputs;
};

const loadFormGroups = props => {
  const formGroups = [];
  const { providerName } = props;
  const { formData } = props.transaction;
  const FORM_GROUP_SIZE = TransactionDetails[providerName].transactions.form_group_size;
  let index = 0;
  let lengthFormData = formData.length;
  let formGroupKey = 0;
  while (lengthFormData - FORM_GROUP_SIZE > 0) {
    lengthFormData -= FORM_GROUP_SIZE;
    // let key = Math.random().toString(36).substr(2);
    const formGroup = <Form.Group key={formGroupKey}
      widths="equal">{groupFormData(props, formData, index, FORM_GROUP_SIZE)}</Form.Group>;
    formGroups.push(formGroup);
    index += FORM_GROUP_SIZE;
    formGroupKey += 1;
  }
  if (lengthFormData > 0) {
    // const key = Math.random().toString(36).substr(2);
    const formGroup = <Form.Group key={formGroupKey}
      widths="equal">{groupFormData(props, formData, index, lengthFormData)}</Form.Group>;
    formGroups.push(formGroup);
  }

  return formGroups;
};

const clickHandlerFormSubmit = props => {
  props.putTransaction(props);
};

const TransactionRedux = props => {
  const { transaction, providerName, logout } = props;
  const { visible, success, error, message, icon, activeItem } = transaction;

  return (
    <div>
      <Header as="h1"
        image={getLogo(providerName)} />

      <div className="transaction-menu">
        <Menu pointing
          secondary>
          <Menu.Menu position="right">
            <Menu.Item name="Logout"
              active={activeItem === 'Logout'}
              onClick={logout} />
          </Menu.Menu>
        </Menu>
      </div>

      <Form className="transaction-form"
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

TransactionRedux.propTypes = {
  transaction: PropTypes.object.isRequired,
  providerName: PropTypes.string.isRequired,
  logout: PropTypes.func.isRequired
};

// decorate the component
const TransactionReduxDecorated = lifecycle(methods)(TransactionRedux);

// connect is HOC - which binds state & actions to the above stateless component via props
const Transaction = connect(mapStateToProps, mapDispatchToProps)(TransactionReduxDecorated);

export default Transaction;