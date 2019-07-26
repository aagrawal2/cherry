import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import reducer from '../reducers/reducer';
import middlewareAction from '../middlewares/middleware';

const store = createStore(reducer, composeWithDevTools(applyMiddleware(middlewareAction, thunk)));

// export this store globally like this if needed: window.store = store;
window.store = store;

export default store;
