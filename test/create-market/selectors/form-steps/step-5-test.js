import {
	assert
} from 'chai';
import proxyquire from 'proxyquire';
import sinon from 'sinon';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import testState from '../../../testState';
// import * as selector from '../../../../src/modules/create-market/selectors/form-steps/step-5';

describe(`modules/create-market/selectors/form-steps/step-5.js`, () => {
	proxyquire.noPreserveCache().noCallThru();
	const middlewares = [thunk];
	const mockStore = configureMockStore(middlewares);
	let formState, out, selector, store, outAction;
	let state = Object.assign({}, testState);
	store = mockStore(state);
	let mockSubmit = {};
	// submitNewMarket
	mockSubmit.submitNewMarket = sinon.stub().returns({
		type: 'SUBMIT_NEW_MARKET'
	});
	selector = proxyquire('../../../../src/modules/create-market/selectors/form-steps/step-5', {
		'../../../create-market/actions/submit-new-market': mockSubmit
	});

	it('should return a new market', () => {
		formState = {
			type: 'scalar',
			endDate: new Date('3000-01-01T06:00:00.000Z'),
			tradingFeePercent: 5,
			expirySource: 'test',
			categoricalOutcomes: {
				test1: {},
				test2: {}
			},
			scalarSmallNum: 5,
			scalarBigNum: 50
		};

		let test = selector.select(formState, state.blockchain.currentBlockNumber, state.blockchain.currentBlockMillisSinceEpoch, store.dispatch);

		test.onSubmit();

		out = {
			type: 'scalar',
			endDate: {
				date: new Date('3000-01-01T06:00:00.000Z'),
				formatted: 'Jan 1, 3000',
				full: '3000-01-01T06:00:00.000Z'
			},
			tradingFeePercent: {
				value: 5,
				formattedValue: 5,
				formatted: '+5.0',
				roundedValue: 5,
				rounded: '+5',
				minimized: '+5',
				denomination: '%',
				full: '+5.0%'
			},
			expirySource: 'test',
			categoricalOutcomes: {
				test1: {},
				test2: {}
			},
			scalarSmallNum: 5,
			scalarBigNum: 50,
			endBlock: 2587660618,
			tradingFee: 0.05,
			volume: {
				value: 0,
				formattedValue: 0,
				formatted: '0',
				roundedValue: 0,
				rounded: '0',
				minimized: '0',
				denomination: '',
				full: '0'
			},
			outcomes: [{
				id: 1,
				name: 5
			}, {
				id: 2,
				name: 50
			}],
			isFavorite: false,
			onSubmit: test.onSubmit
		};
		outAction = [{
			type: 'SUBMIT_NEW_MARKET'
		}];

		assert.deepEqual(store.getActions(), outAction, `Didn't dispatch the expected action object when onSubmit was "clicked"`);
		assert.deepEqual(test, out, `Didn't produce the expected object from select`);

	});
});
