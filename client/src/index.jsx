import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import Cherry from './components/Cherry';
import store from './redux/store/store';

ReactDOM.render(
    <Provider store={store}>
        <Cherry />
    </Provider>,
    document.getElementById('root'),
);
