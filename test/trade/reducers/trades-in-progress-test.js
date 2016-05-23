import {
	assert
} from 'chai';
import reducer
from '../../../src/modules/trade/reducers/trades-in-progress';
//import constants used by reducer
import {
	UPDATE_TRADE_IN_PROGRESS,
	CLEAR_TRADE_IN_PROGRESS
}
from '../../../src/modules/trade/actions/update-trades-in-progress';
import {
	CLEAR_LOGIN_ACCOUNT
} from '../../../src/modules/auth/actions/update-login-account';
import {
	SHOW_LINK
}
from '../../../src/modules/link/actions/show-link';

describe(`modules/trade/reducers/trade-in-progress.js`, () => {
	const testState = {
		MarketID: {
			MarketID: 'testStateMarketID',
			OutcomeID: {
				test: 1
			}
		},
		MarketID2: {
			MarketID2: 'testStateMarketID2',
			OutcomeID: {
				test: 2
			}
		}
	};

	it('should be able to handle SHOW_LINK', () => {
		const testAction = {
			type: SHOW_LINK,
			parsedURL: {
				pathArray: ['/register']
			}
		};

		const expectedState = {
			MarketID: {
				MarketID: 'testStateMarketID',
				OutcomeID: {
					'test': 1
				}
			},
			MarketID2: {
				MarketID2: 'testStateMarketID2',
				OutcomeID: {
					'test': 2
				}
			}
		};

		assert.deepEqual(reducer(testState, testAction), expectedState);
	});

	it(`should clear the login account `, () => {
		const testAction = {
			type: CLEAR_LOGIN_ACCOUNT
		};

		const expectedState = {};

		assert.deepEqual(reducer(testState, testAction), expectedState, `reducer doesn't produce the expected state`);
	});

	it(`should be able to update a trade in progress`, () => {
		const testAction = {
			type: UPDATE_TRADE_IN_PROGRESS,
			data: {
				marketID: 'MarketID',
				outcomeID: 'OutcomeID',
				details: {
					details: 'something here'
				}
			}
		};

		const expectedState = {
			MarketID: {
				MarketID: 'testStateMarketID',
				OutcomeID: {
					details: 'something here'
				}
			},
			MarketID2: {
				MarketID2: 'testStateMarketID2',
				OutcomeID: {
					test: 2
				}
			}
		};

		assert.deepEqual(reducer(testState, testAction), expectedState, `reducer doesn't produce the expected state`);
	});

	it(`should be able to clear a trade in progress`, () => {
		const testAction = {
			type: CLEAR_TRADE_IN_PROGRESS,
			marketID: 'MarketID2',
		};

		const expectedState = {
			MarketID: {
				MarketID: 'testStateMarketID',
				OutcomeID: {
					test: 1
				}
			},
			MarketID2: {}
		};

		assert.deepEqual(reducer(testState, testAction), expectedState, `reducer doesn't produce the expected state`);
	});

});
