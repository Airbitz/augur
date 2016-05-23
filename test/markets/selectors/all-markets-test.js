import {
	assert
} from 'chai';
import proxyquire from 'proxyquire';
import sinon from 'sinon';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import testState from '../../testState';

describe(`modules/markets/selectors/markets-all.js`, () => {
	proxyquire.noPreserveCache().noCallThru();
	const middlewares = [thunk];
	const mockStore = configureMockStore(middlewares);
	let store, selector, out, test;
	let state = Object.assign({}, testState, {
		marketsData: {
			test: {
				endDate: new Date('01/01/3000'),
				outcomes: {
					test: {}
				},
				eventID: 'testEvent',
				volume: {
					value: 5
				}
			},
			test2: {
				endDate: new Date('01/01/3000'),
				outcomes: {
					test2: {}
				},
				eventID: 'testEvent2',
				volume: {
					value: 10
				}
			},
			test3: {
				endDate: new Date('01/01/3000'),
				outcomes: {
					test3: {}
				},
				eventID: 'testEvent3',
				volume: {
					value: 7
				}
			}
		},
		priceHistory: {
			test: {},
			test2: {},
			test3: {}
		},
		favorites: {
			test: true,
			test2: true,
			test3: false
		},
		reports: {
			testEvent: {
				id: 'testEvent'
			},
			testEvent2: {
				id: 'testEvent2'
			},
			testEvent3: {
				id: 'testEvent2'
			}
		},
		accountTrades: {
			test: {},
			test2: {},
			test3: {}
		},
		tradesInProgress: {
			test: {},
			test2: {},
			test3: {}
		}
	});
	store = mockStore(state);
	let mockMarket = {
		assembleMarket: () => {}
	};
	sinon.stub(mockMarket, 'assembleMarket', (marketID, market, priceHistory, isMarketOpen, favorite, outcomes, reports, accountTrades, tradesInProgress, endYear, endMonth, endDate, isBlockchainReportPhase, dispatch) => {
		return market;
	});

	selector = proxyquire('../../../src/modules/markets/selectors/markets-all.js', {
		'../../market/selectors/market': mockMarket,
		'../../../store': store
	});

	it(`should return the correct selectedMarket function`, () => {
		test = selector.default();
		out = [{
			endDate: new Date('01/01/3000'),
			outcomes: {
				test2: {}
			},
			eventID: 'testEvent2',
			volume: {
				value: 10
			}
		}, {
			endDate: new Date('01/01/3000'),
			outcomes: {
				test3: {}
			},
			eventID: 'testEvent3',
			volume: {
				value: 7
			}
		}, {
			endDate: new Date('01/01/3000'),
			outcomes: {
				test: {}
			},
			eventID: 'testEvent',
			volume: {
				value: 5
			}
		}];

		assert(mockMarket.assembleMarket.calledThrice, `assembleMarket wasn't called 3 times as expected`);
		assert.deepEqual(test, out, `Didn't produce all markets as expected and sorted`);
	});
});
