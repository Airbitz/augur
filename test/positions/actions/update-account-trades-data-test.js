import {
	assert
} from 'chai';
import * as action from '../../../src/modules/positions/actions/update-account-trades-data';

describe(`modules/positions/actions/update-account-trades-data.js`, () => {
	it(`should return a UPDATE_ACCOUNT_TRADES_DATA action type with data payload.`, () => {
		const data = {
			example: 'test data'
		};
		const expectedOutput = {
			type: action.UPDATE_ACCOUNT_TRADES_DATA,
			data
		};
		assert.deepEqual(action.updateAccountTradesData(data), expectedOutput, `It didn't return the data in the form of an action object correctly.`)
	});
});
