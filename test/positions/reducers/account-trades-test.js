import {
	assert
} from 'chai';
import {
	UPDATE_ACCOUNT_TRADES_DATA
} from '../../../src/modules/positions/actions/update-account-trades-data';
import {
	CLEAR_LOGIN_ACCOUNT
} from '../../../src/modules/auth/actions/update-login-account';
import reducer from '../../../src/modules/positions/reducers/account-trades';

describe(`modules/positions/reducers/account-trades.js`, () => {
	it(`should return updated account trades data`, () => {
		const data = {
			test: 'some information'
		};
		const startState = {
			example: 'some example'
		};
		const startState2 = {
			test: 'other information'
		};
		const expectedOutput = {
			example: 'some example',
			test: 'some information'
		};
		const expectedOutput2 = {
			test: 'some information'
		};
		const action = {
			type: UPDATE_ACCOUNT_TRADES_DATA,
			data
		};
		assert.deepEqual(reducer(startState, action), expectedOutput, `didn't add new account trades data.`);
		assert.deepEqual(reducer(startState2, action), expectedOutput2, `didn't update account trade data`);
		assert.deepEqual(reducer(undefined, action), expectedOutput2, `didn't add an account trade given a blank state`);
	});
	it(`should clear trades data`, () => {
		const startState = {
			example: 'some sort of information'
		};
		const action = {
			type: CLEAR_LOGIN_ACCOUNT
		};
		assert.deepEqual(reducer(undefined, action), {}, `empty state didn't return empty object`);
		assert.deepEqual(reducer(startState, action), {}, `with state didn't return empty object`);
	});
});
