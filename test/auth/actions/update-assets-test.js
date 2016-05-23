import {
	assert
} from 'chai';
import proxyquire from 'proxyquire';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import testState from '../../testState';

describe(`modules/auth/actions/update-assets.js`, () => {
	proxyquire.noPreserveCache().noCallThru();
	const middlewares = [thunk];
	const mockStore = configureMockStore(middlewares);
	const fakeAugurJS = {};
	let action, store;
	let thisTestState = Object.assign({}, testState);
	store = mockStore(thisTestState);
	fakeAugurJS.loadAssets = (BRANCH_ID, loginID, cbEther, cbRep, cbRealEther) => {
		cbEther(null, 500);
		cbRep(null, 25);
		cbRealEther(null, 100);
	};
	action = proxyquire('../../../src/modules/auth/actions/update-assets', {
		'../../../services/augurjs': fakeAugurJS
	});

	it(`should update the assets of a logged in account`, () => {
		const expectedOutput = [{
			type: 'UPDATE_LOGIN_ACCOUNT',
			data: {
				ether: 500
			}
		}, {
			type: 'UPDATE_LOGIN_ACCOUNT',
			data: {
				rep: 25
			}
		}, {
			type: 'UPDATE_LOGIN_ACCOUNT',
			data: {
				realEther: 100
			}
		}];
		store.dispatch(action.updateAssets());
		assert.deepEqual(store.getActions(), expectedOutput, `didn't load ether, rep, or realEther correctly`);
	});
});
