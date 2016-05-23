import {
	assert
} from 'chai';
import proxyquire from 'proxyquire';
import sinon from 'sinon';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import testState from '../../testState';

describe(`modules/reports/actions/submit-report.js`, () => {
	proxyquire.noPreserveCache().noCallThru();
	const middlewares = [thunk];
	const mockStore = configureMockStore(middlewares);
	let store, action, out;
	let state = Object.assign({}, testState, {
		marketsData: {
			test1: {
				eventID: 'test1EventID'
			}
		},
		reports: {
			test1EventID: {
				id: 'test1EventID'
			}
		}
	});
	store = mockStore(state);
	let mockAugurJS = {};
	let mockReportTrans = {};
	let mockUpExTrans = {
		updateExistingTransaction: () => {}
	};
	let mockUpReports = {};
	let mockMarket = {};
	let mockLinks = {
		selectMarketsLink: () => {},
		selectMarketLink: () => {}
	};
	let mockHex = {};
	mockUpReports.updateReports = sinon.stub().returnsArg(0);
	mockReportTrans.addReportTransaction = sinon.stub().returns({
		type: 'ADD_REPORT_TRANSACTION'
	});
	mockMarket.selectMarketFromEventID = sinon.stub().returns('testID123');
	mockMarket.selectMarketFromEventID.onCall(1).returns(false);
	sinon.stub(mockLinks, 'selectMarketLink', (nextPendingReportMarket,
		dispatch) => {
		return {
			onClick: () => {
				dispatch({
					type: 'SELECT_MARKET_LINK',
					nextPendingReportMarket
				})
			}
		};
	});
	sinon.stub(mockLinks, 'selectMarketsLink', (dispatch) => {
		return {
			onClick: () => {
				dispatch({
					type: 'SELECT_MARKETS_LINK'
				})
			}
		};
	});
	sinon.stub(mockUpExTrans, 'updateExistingTransaction', (transID, status) => {
		return {
			type: 'UPDATE_EXISTING_TRANSACTIONS',
			transactionID: transID,
			status
		};
	});
	mockAugurJS.submitReportHash = sinon.stub().yields(null, {
		status: 'success',
		reportHash: 'testReportHash123456789'
	});
	mockHex.bytesToHex = sinon.stub().returns('salt12345');

	action = proxyquire('../../../src/modules/reports/actions/submit-report.js', {
		'../../../services/augurjs': mockAugurJS,
		'../../transactions/actions/add-report-transaction': mockReportTrans,
		'../../transactions/actions/update-existing-transaction': mockUpExTrans,
		'../../reports/actions/update-reports': mockUpReports,
		'../../market/selectors/market': mockMarket,
		'../../link/selectors/links': mockLinks,
		'../../../utils/bytes-to-hex': mockHex
	});

	beforeEach(() => {
		store.clearActions();
	});

	afterEach(() => {
		store.clearActions();
		mockUpReports.updateReports.reset();
		mockReportTrans.addReportTransaction.reset();
		mockMarket.selectMarketFromEventID.reset();
		mockAugurJS.submitReportHash.reset();
		mockLinks.selectMarketLink.reset();
		mockLinks.selectMarketsLink.reset();
		mockUpExTrans.updateExistingTransaction.reset();
		mockHex.bytesToHex.reset();
	});

	it(`should return submit a report`, () => {
		let market = {
			id: 'test1'
		};
		out = [{
			test1EventID: {
				reportHash: true
			}
		}, {
			type: 'ADD_REPORT_TRANSACTION'
		}, {
			type: 'SELECT_MARKET_LINK',
			nextPendingReportMarket: 'testID123'
		}];

		store.dispatch(action.submitReport(market, 'testOutcomeID', false));

		assert(mockReportTrans.addReportTransaction.calledOnce, `addReportTransaction wasn't called once as expected`);
		assert(mockLinks.selectMarketLink.calledOnce, `selectMarketLink wasn't called once as expected`);
		assert(mockUpReports.updateReports.calledOnce, `updateReports wasn't called once as expected`);
		assert(mockMarket.selectMarketFromEventID.calledOnce, `selectMarketFromEventID wasn't called once as expected`);
		assert.deepEqual(store.getActions(), out, `Didn't dispatch the expected actions`);

		store.clearActions();

		store.dispatch(action.submitReport(market, 'testOutcomeID', false));

		out = [{
			test1EventID: {
				reportHash: true
			}
		}, {
			type: 'ADD_REPORT_TRANSACTION'
		}, {
			type: 'SELECT_MARKETS_LINK'
		}];


		assert(mockReportTrans.addReportTransaction.calledTwice, `addReportTransaction wasn't called twice as expected`);
		assert(mockLinks.selectMarketLink.calledOnce, `selectMarketsLink wasn't called once as expected`);
		assert(mockUpReports.updateReports.calledTwice, `updateReports wasn't called twice as expected`);
		assert(mockMarket.selectMarketFromEventID.calledTwice, `selectMarketFromEventID wasn't called twice as expected`);
		assert.deepEqual(store.getActions(), out, `Didn't dispatch the expected actions.`);
	});

	it(`should return processes a report`, () => {
		let market = {
			id: 'test1',
			type: 'scalar',
			eventID: 'testEventID1'
		};
		global.event = {};
		out = [{
			type: 'UPDATE_EXISTING_TRANSACTIONS',
			transactionID: 'transID1',
			status: {
				status: 'sending...'
			}
		}, {
			testEventID1: {
				reportPeriod: '19',
				reportedOutcomeID: 'testOutcomeID',
				isIndeterminate: false,
				isCategorical: false,
				isScalar: true,
				isUnethical: false,
				salt: 'salt12345',
				reportHash: true
			}
		}, {
			type: 'UPDATE_EXISTING_TRANSACTIONS',
			transactionID: 'transID1',
			status: {
				status: 'success'
			}
		}, {
			testEventID1: {
				reportHash: 'testReportHash123456789'
			}
		}];

		store.dispatch(action.processReport('transID1', market, 'testOutcomeID', false));

		assert(mockHex.bytesToHex.calledOnce, `bytesToHex wasn't called once as expected`);
		assert(mockUpReports.updateReports.calledTwice, `updateReports wasn't called twice as expected`);
		assert(mockUpExTrans.updateExistingTransaction.calledTwice, `updateExistingTransaction wasn't called twice as expected`);
		assert(mockAugurJS.submitReportHash.calledOnce, `Didn't call submitReportHash once as expected`);
		assert.deepEqual(store.getActions(), out, `Didn't dispatch the expected actions for processing a report`);
	});

});
