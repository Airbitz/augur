// add jQuery to Browserify's global object so plugins attach correctly.
global.jQuery = require("jquery");
require("bootstrap");

var React = require("react");
var ReactDOM = require("react-dom");
var Flux = require("fluxxor/lib/flux");
var Router = require("react-router");
var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;
let Redirect = require("react-router/lib/components/Redirect");
var constants = require("./libs/constants");
var utilities = require("./libs/utilities");
var dispatcher = require("./stores/dispatcher.js");

var actions = {
  asset: require("./actions/AssetActions"),
  branch: require("./actions/BranchActions"),
  config: require("./actions/ConfigActions"),
  market: require("./actions/MarketActions"),
  network: require("./actions/NetworkActions"),
  report: require("./actions/ReportActions")
};
var stores = {
  asset: new dispatcher.asset(),
  branch: new dispatcher.branch(),
  config: new dispatcher.config(),
  market: new dispatcher.market(),
  network: new dispatcher.network(),
  report: new dispatcher.report()
};

window.abi = require("augur-abi");
window.flux = new Flux(stores, actions);
window._ = require("lodash");
flux.augur = require("augur.js");

var AugurApp = require("./components/AugurApp");
var Overview = require("./components/Overview");
var MarketsPage = require('./components/markets-page/MarketsPage.jsx');
var MarketPage = require('./components/market-page/MarketPage.jsx');
var MarketCreatePage = require('./components/market-create-page/MarketCreatePage.jsx');
var ReportsPage = require('./components/reports-page/ReportsPage.jsx');
var ReportPage = require('./components/report-page/ReportPage.jsx');
var Outcomes = require("./components/Outcomes");
var Portfolio = require("./components/Portfolio");

flux.on("dispatch", function (type, payload) {
  var debug = flux.store("config").getState().debug;
  if (debug) console.log("Dispatched", type, payload);
});

var routes = (
  <Route name="app" path="/" handler={ AugurApp } flux={ flux }>
    <Route name="overview" path="/overview" handler={ Overview } flux={ flux } title="Overview" />

    <Route name="markets" path="/markets" flux={ flux } title="Markets">
      <DefaultRoute handler={ MarketsPage } flux={ flux } />
      <Route name="market-create" path="new" handler={ MarketCreatePage } flux={ flux } />
      <Route name="market" path=":marketId" handler={ MarketPage } flux={ flux } />
    </Route>

    <Route name="reports" path="/reports" handler={ ReportsPage } flux={ flux } title="Reporting" />
    <Route name="report" path="/reports/:eventId" handler={ ReportPage } flux={ flux } />
    <Route name="portfolio" path="/portfolio" handler={Portfolio} flux={flux} title="Portfolio" />

    {/* redirect must be last */}
    <Redirect from="*" to="markets"/>
  </Route>
);

Router.run(routes, Router.HistoryLocation, function (Handler, state) {
  ReactDOM.render(<Handler flux={flux} params={state.params} query={state.query} />, document.getElementById("render-target"));
});
