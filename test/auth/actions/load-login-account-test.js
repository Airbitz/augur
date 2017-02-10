import { describe, it, beforeEach } from 'mocha';
import { assert } from 'chai';
import proxyquire from 'proxyquire';
import sinon from 'sinon';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import testState from 'test/testState';
import {
  updateLoginAccount
} from '../../../src/modules/auth/actions/update-login-account';

describe(`modules/auth/actions/load-login-account.js`, () => {
  proxyquire.noPreserveCache().noCallThru();
  const middlewares = [thunk];
  const mockStore = configureMockStore(middlewares);
  const fakeAugurJS = { augur: { accounts: { account: { address: 123456789 } } } };
  const fakeUpdateAssets = {};
  const fakeLoadAcctTrades = {};
  const fakeLoadReports = {};
  const fakeUpdateBranch = { syncBranch: () => {} };
  const fakeLoadMarketsInfo = {};
  const thisTestState = Object.assign({}, testState, { loginAccount: {} });
  const store = mockStore(thisTestState);
  fakeAugurJS.loadLoginAccount = (env, cb) => {
    cb(null, { address: 123456789 });
  };
  fakeAugurJS.augur.batchGetMarketInfo = (marketIDs, account, cb) => {
    cb(null);
  };
  fakeAugurJS.augur.getRegisterBlockNumber = (account, cb) => {
    cb(null, 10000);
  };
  fakeAugurJS.augur.getCurrentPeriodProgress = sinon.stub().returns(30);
  fakeUpdateAssets.updateAssets = () => (dispatch, getState) => {
    const ether = 500;
    const rep = 25;
    const realEther = 100;
    dispatch(updateLoginAccount({ rep, realEther, ether }));
  };
  fakeLoadMarketsInfo.loadMarketsInfo = () => (dispatch, getState) => {
    dispatch({ type: 'UPDATE_MARKETS_INFO' });
  };
  sinon.stub(fakeUpdateBranch, 'syncBranch', cb => (dispatch, getState) => {
    const reportPeriod = 19;
    dispatch({ type: 'SYNC_BRANCH', data: { reportPeriod } });
    if (cb) cb(null);
  });

  fakeLoadAcctTrades.loadAccountTrades = sinon.stub().returns({
    type: 'LOAD_ACCOUNT_TRADES'
  });

  const action = proxyquire('../../../src/modules/auth/actions/load-login-account', {
    '../../../services/augurjs': fakeAugurJS,
    '../../auth/actions/update-assets': fakeUpdateAssets,
    '../../markets/actions/load-markets-info': fakeLoadMarketsInfo,
    '../../my-positions/actions/load-account-trades': fakeLoadAcctTrades,
    '../../reports/actions/load-reports': fakeLoadReports,
    '../../app/actions/update-branch': fakeUpdateBranch
  });

  beforeEach(() => {
    store.clearActions();
  });

  it(`should update the login account`, () => {
    store.dispatch(action.loadLoginAccount());

    const expectedOutput = [{
      type: 'UPDATE_LOGIN_ACCOUNT',
      data: {
        address: 123456789
      }
    }, {
      type: 'UPDATE_LOGIN_ACCOUNT',
      data: {
        registerBlockNumber: 10000
      }
    }, {
      type: 'UPDATE_LOGIN_ACCOUNT',
      data: {
        ether: undefined,
        realEther: undefined,
        rep: undefined
      }
    }, {
      type: 'CLEAR_REPORTS'
    }, {
      type: 'UPDATE_BRANCH',
      branch: {
        currentPeriod: 365443,
        currentPeriodProgress: 56.325,
        isReportRevealPhase: true,
        phaseLabel: 'Reveal',
        phaseTimeRemaining: 'in 29 minutes'
      }
    }];
    const actual = store.getActions();
    const numActions = actual.length;
    for (let i = 0; i < numActions; ++i) {
      if (actual[i].type === 'UPDATE_LOGIN_ACCOUNT') {
        if (actual[i].data && actual[i].data.onUpdateAccountSettings) {
          delete actual[i].data.onUpdateAccountSettings;
        }
      }
    }
    assert.deepEqual(actual, expectedOutput, `didn't properly update the logged in account`);
  });
});
