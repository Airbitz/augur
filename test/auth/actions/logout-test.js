import {
	assert
} from 'chai';
import proxyquire from 'proxyquire';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import testState from '../../testState';

describe(`modules/auth/actions/logout.js`, () => {
	proxyquire.noPreserveCache().noCallThru();
	const middlewares = [thunk];
	const mockStore = configureMockStore(middlewares);
	const fakeAugurJS = {};
	let action, store;
	store = mockStore(testState);
	fakeAugurJS.logout = () => {
		return;
	};
	action = proxyquire('../../../src/modules/auth/actions/logout', {
		'../../../services/augurjs': fakeAugurJS
	});

	it(`should logout of the logged in account`, () => {
		const expectedOutput = [{
			type: 'CLEAR_LOGIN_ACCOUNT'
		}];

		store.dispatch(action.logout());
		assert.deepEqual(store.getActions(), expectedOutput, `It didn't logout as expected`);
	});
});
