import * as AugurJS from '../../../services/augurjs';
import { updateAssets } from '../../auth/actions/update-assets';
import { BRANCH_ID } from '../../app/constants/network';

export function penalizeTooFewReports() {
	return function (dispatch, getState) {
		var { blockchain, loginAccount } = getState(),
			branchID = BRANCH_ID,
			previousReportPeriod = blockchain.reportPeriod - 1;

		if (blockchain.isReportConfirmationPhase || !loginAccount.rep) {
			return;
		}

		AugurJS.getReportedPeriod(branchID, previousReportPeriod, loginAccount, reported => {

			// if the reporter submitted a report during the previous period,
			// penalize if they did not submit enough reports.
			if (reported === "1") {
				AugurJS.penalizeNotEnoughReports(branchID, (err, res) => {
					if (err) {
						console.log('ERROR getReportedPeriod', err);
						return;
					}
console.log('------> penalizeNotEnoughReports', res);
					dispatch(updateAssets());
				});
			}

			// if the reporter did not submit a report during the previous period,
			// dock 10% for each report-less period.
			else {
				AugurJS.penalizationCatchup(branchID, (err, res) => {
					if (err) {
						console.log('ERROR penalizationCatchup', err);
						return;
					}
console.log('------> penalizationCatchup', res);
					dispatch(updateAssets());
				});
			}
		});
	};
}