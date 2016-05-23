import * as AugurJS from '../../../services/augurjs';

import { BRANCH_ID } from '../../app/constants/network';

import { updateConnectionStatus } from '../../app/actions/update-connection';
import { updateBranch } from '../../app/actions/update-branch';
import { updateBlockchain } from '../../app/actions/update-blockchain';
import { listenToUpdates } from '../../app/actions/listen-to-updates';
import { loadLoginAccount } from '../../auth/actions/load-login-account';
import { loadMarkets } from '../../markets/actions/load-markets';
import { loadFullMarket } from '../../market/actions/load-full-market';

export function initAugur() {
	return (dispatch, getState) => {
		AugurJS.connect(function (err, connected) {
			if (err) {
				return console.error('connect failure:', err);
			}

			dispatch(updateConnectionStatus(connected));
			dispatch(loadLoginAccount());

			AugurJS.loadBranch(BRANCH_ID, (err, branch) => {
				if (err) {
					return console.log('ERROR loadBranch', err);
				}

				dispatch(updateBranch(branch));

				dispatch(updateBlockchain(() => {
					dispatch(loadMarkets());

					let { selectedMarketID } = getState();
					if (selectedMarketID != null) {
						dispatch(loadFullMarket(selectedMarketID));
					}

					dispatch(listenToUpdates());
				}));
			});
		});
	};
}
