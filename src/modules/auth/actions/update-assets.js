import * as AugurJS from '../../../services/augurjs';
import { BRANCH_ID } from '../../app/constants/network';
import { updateLoginAccount } from '../../auth/actions/update-login-account';

export function updateAssets() {
	return (dispatch, getState) => {
		var { loginAccount } = getState();
		if (!loginAccount.id) {
			return dispatch(updateLoginAccount({ ether: undefined, realEther: undefined, rep: undefined }));
		}
		AugurJS.loadAssets(BRANCH_ID, loginAccount.id,
			(err, ether) => {
				var { loginAccount } = getState();
				if (err) {
					console.info('!! ERROR updateAssets() ether', err);
					return;
				}

				if (!loginAccount.ether || loginAccount.ether.value !==  ether) {
					return dispatch(updateLoginAccount({ ether }));
				}
			},
			(err, rep) => {
				if (err) {
					console.info('!! ERROR updateAssets() rep', err);
					return;
				}
				if (!loginAccount.rep || loginAccount.rep.value !== rep) {
					return dispatch(updateLoginAccount({ rep }));
				}
			},
			(err, realEther) => {
				if (err) {
					console.info('!! ERROR updateAssets() real-ether', realEther);
					return;
				}

				if (!loginAccount.realEther || loginAccount.realEther.value !== realEther) {
					return dispatch(updateLoginAccount({ realEther }));
				}
			}
		);
	};
}
