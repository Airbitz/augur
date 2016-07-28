import * as AugurJS from '../../../services/augurjs';
import { BRANCH_ID } from '../../app/constants/network';
import { SUCCESS, FAILED } from '../../transactions/constants/statuses';
import { updateExistingTransaction } from '../../transactions/actions/update-existing-transaction';
import { updateAssets } from '../../auth/actions/update-assets';

export function processFundNewAccount(transactionID, address) {
	return (dispatch, getState) => {
		const { env } = getState();

		dispatch(updateExistingTransaction(transactionID, { status: 'submitting...' }));

		AugurJS.fundNewAccount(env, address, BRANCH_ID,
			() => {
				dispatch(updateExistingTransaction(transactionID, { status: 'processing...' }));
			},
			() => {
				dispatch(updateExistingTransaction(transactionID, { status: SUCCESS, message: 'Loaded free ether and rep' }));
				dispatch(updateAssets());
			},
			(failedTransaction) => {
				dispatch(updateExistingTransaction(transactionID, { status: FAILED, message: failedTransaction.message }));
			}
		);
	};
}
