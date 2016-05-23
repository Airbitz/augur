import App from 'augur-ui-react-components';
import selectors from './selectors';

import { initAugur } from './modules/app/actions/init-augur';
import { showLink } from './modules/link/actions/show-link';

import store from './store';
const appElement = document.getElementById('app');

if (process.env.NODE_ENV === 'development') {
    Object.defineProperty(window, 'state', { get: store.getState, enumerable: true });
    window.selectors = require('./selectors');
    window.App = App;
    console.log('********************************************* \n DEVELOPMENT MODE \n window.selectors \n window.state \n window.augurjs \n ********************************************* \n');
}

store.dispatch(showLink(window.location.pathname + window.location.search));
store.dispatch(initAugur());

//store.dispatch(MarketsActions.listenToMarkets());

store.subscribe(() => App(appElement, selectors));

window.onpopstate = function(e) {
	store.dispatch(showLink(window.location.pathname + window.location.search));
};
