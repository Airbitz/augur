import proxyquire from 'proxyquire';
import * as mockStore from '../../mockStore';
import marketAssertion from 'augur-ui-react-components/lib/assertions/market';

describe(`modules/market/selectors/market.js`, () => {
	proxyquire.noPreserveCache().noCallThru();
	let selector,
		actual;
	let { store } = mockStore.default;

	selector = proxyquire('../../../src/modules/market/selectors/market.js', {
		'../../../store': store
	});

	actual = selector.default();

	beforeEach(() => {
		store.clearActions();
	});

	afterEach(() => {
		store.clearActions();
	});

	it(`should return the expected values to components`, () => {
		marketAssertion(actual);
	});
});
