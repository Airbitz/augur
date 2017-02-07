import { augur } from '../../../services/augurjs';
import { loadLoginAccountDependents, loadLoginAccountLocalStorage } from '../../auth/actions/load-login-account';
import { updateLoginAccount } from '../../auth/actions/update-login-account';
import { registerTimestamp } from '../../auth/actions/register-timestamp';
import { fundNewAccount } from '../../auth/actions/fund-new-account';
import isCurrentLoginMessageRead from '../../login-message/helpers/is-current-login-message-read';
import isUserLoggedIn from '../../auth/helpers/is-user-logged-in';
import { updateAccountSettings } from '../../auth/actions/update-account-settings';

export function register(name, password, password2, loginID, rememberMe, loginAccount, cb) {
  return (dispatch, getState) => {
    const { links } = require('../../../selectors');
    const localStorageRef = typeof window !== 'undefined' && window.localStorage;

    if (loginID && links && links.marketsLink && loginAccount.keystore) {
      if (rememberMe && localStorageRef && localStorageRef.setItem) {
        const persistentAccount = Object.assign({}, loginAccount);
        if (Buffer.isBuffer(persistentAccount.privateKey)) {
          persistentAccount.privateKey = persistentAccount.privateKey.toString('hex');
        }
        if (Buffer.isBuffer(persistentAccount.derivedKey)) {
          persistentAccount.derivedKey = persistentAccount.derivedKey.toString('hex');
        }
        localStorageRef.setItem('account', JSON.stringify(persistentAccount));
      }
      loginAccount.onUpdateAccountSettings = settings => dispatch(updateAccountSettings(settings));
      loginAccount.settings = loginAccount.settings || {};
      dispatch(loadLoginAccountLocalStorage(loginAccount.address));
      dispatch(updateLoginAccount(loginAccount));
      dispatch(loadLoginAccountDependents((err) => {
        if (err) return console.error(err);
        dispatch(fundNewAccount((err) => {
          console.log('fundNewAccount');
          if (err) return console.error(err);
          dispatch(registerTimestamp());
        }));
      }));

      cb && cb();

      // decide if we need to display the loginMessage
      const { loginMessage } = getState();
      if (isUserLoggedIn(loginAccount) && !isCurrentLoginMessageRead(loginMessage)) {
        links.loginMessageLink.onClick();
      } else {
        links.marketsLink.onClick();
      }
    }

    augur.accounts.register(name, password, (account) => {
      if (!account) {
        cb && cb({
          code: 0,
          message: 'failed to register'
        });
      } else if (account.error) {
        cb && cb({
          code: account.error,
          message: account.message
        });
      }
      const localLoginAccount = {
        ...account,
        loginID: account.loginID || account.secureLoginID
      };
      if (!localLoginAccount || !localLoginAccount.address) {
        return;
      }
      dispatch(updateLoginAccount({ loginID: localLoginAccount.loginID }));
      // dispatch(addFundNewAccount(localLoginAccount.address));
      cb && cb(null, localLoginAccount);
    });
  };
}
