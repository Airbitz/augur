// setting these to the window object for debugging and console access
window.BigNumber = require('bignumber.js');
window.$ = require('jquery');
window._ = require('lodash');
window.socket = io();

// add jQuery to Browserify's global object so plugins attach correctly.
global.jQuery = $;
require('jquery.cookie');
require('bootstrap');

var React = require('react');
var Fluxxor = require('fluxxor');

var Router = require("react-router");
var Route = Router.Route;
var NotFoundRoute = Router.NotFoundRoute;
var DefaultRoute = Router.DefaultRoute;
var RouteHandler = Router.RouteHandler;
var Redirect = Router.Redirect;

var constants = require('./libs/constants');

var AssetActions = require('./actions/AssetActions');
var BranchActions = require('./actions/BranchActions');
var ConfigActions = require('./actions/ConfigActions');
var EventActions = require('./actions/EventActions');
var MarketActions = require('./actions/MarketActions');
var NetworkActions = require('./actions/NetworkActions');
var LogActions = require('./actions/LogActions');

var actions = {
  asset: AssetActions,
  branch: BranchActions,
  config: ConfigActions,
  event: EventActions,
  market: MarketActions,
  network: NetworkActions
}

var AssetStore = require('./stores/AssetStore');
var BranchStore = require('./stores/BranchStore');
var ConfigStore = require('./stores/ConfigStore');
var EventStore = require('./stores/EventStore');
var MarketStore = require('./stores/MarketStore');
var NetworkStore = require('./stores/NetworkStore');
var LogStore = require('./stores/LogStore');

var stores = {
  asset: new AssetStore(),
  branch: new BranchStore(),
  config: new ConfigStore(),
  event: new EventStore(),
  market: new MarketStore(),
  network: new NetworkStore()
}

var AugurApp = require("./components/AugurApp");
var Branch = require('./components/Branch');
var Market = require('./components/Market');

socket.on('connect', function () {
  
  var flux = new Fluxxor.Flux(stores, actions);

  flux.on("dispatch", function(type, payload) {
    var debug = flux.store('config').getState().debug;
    if (debug) console.log("Dispatched", type, payload);
  });

  // TODO: Listen for each new block once we're connected to the Ethereum
  // daemon with web3.eth.filter.
  // We can always update the network on each block.
  // this.flux.actions.network.updateNetwork();
  // If we have a contract, we can update the rest of our data.
  // this.flux.actions.branch.loadBranches();
  // this.flux.actions.event.loadEvents();
  // this.flux.actions.market.loadMarkets();

  // TODO: Render the period display every time the NetworkStore changes.

  var routes = (
    <Route name="app" handler={ AugurApp } flux={ flux }>
      <DefaultRoute handler={ Branch } flux={ flux } title="Branch" />
      <Route name="home" path="/" handler={ Branch } flux={ flux } title="Branch" />
      <Route name="branch" path="/branch/:branchId" handler={ Branch} flux={ flux } title="Branch" />
      <Route name="market" path="/market/:marketId" handler={ Market } flux={ flux } title="Market" />
    </Route>
  );

  Router.run(routes, Router.HistoryLocation, function (Handler, state) {
    React.render(<Handler flux={ flux } params={ state.params } />, document.body);
  });

});
