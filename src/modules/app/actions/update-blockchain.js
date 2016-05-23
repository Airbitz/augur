import * as AugurJS from '../../../services/augurjs';

import { BRANCH_ID } from '../../app/constants/network';

import { commitReports } from '../../reports/actions/commit-reports';
import { penalizeTooFewReports } from '../../reports/actions/penalize-too-few-reports';
import { collectFees } from '../../reports/actions/collect-fees';

export const UPDATE_BLOCKCHAIN = 'UPDATE_BLOCKCHAIN';

var isAlreadyUpdatingBlockchain = false;

export function updateBlockchain(cb) {
	return function(dispatch, getState) {

		if (isAlreadyUpdatingBlockchain) {
			return;
		}

		isAlreadyUpdatingBlockchain = true;

		// load latest block number
		AugurJS.loadCurrentBlock(currentBlockNumber => {
			var { branch, blockchain } = getState(),
				currentPeriod = Math.floor(currentBlockNumber / branch.periodLength),
				isChangedCurrentPeriod = currentPeriod !== blockchain.currentPeriod,
				isReportConfirmationPhase = (currentBlockNumber % branch.periodLength) > (branch.periodLength / 2),
				isChangedReportPhase = isReportConfirmationPhase !== blockchain.isReportConfirmationPhase;

			if (!currentBlockNumber || currentBlockNumber !== parseInt(currentBlockNumber, 10)) {
				return;
			}

			// update blockchain state
			dispatch({
				type: UPDATE_BLOCKCHAIN,
				data: {
					currentBlockNumber,
					currentBlockMillisSinceEpoch: Date.now(),
					currentPeriod,
					isReportConfirmationPhase
				}
			});

			// if the report *period* changed this block, do some extra stuff (also triggers the first time blockchain is being set)
			if (isChangedCurrentPeriod) {
				dispatch(incrementReportPeriod(() => {

					// if the report *phase* changed this block, do some extra stuff
					if (isChangedReportPhase) {
						dispatch(commitReports());
						dispatch(penalizeTooFewReports());
						dispatch(collectFees());
					}

					isAlreadyUpdatingBlockchain = false;
					return cb && cb();
				}));
			}
			else {
				isAlreadyUpdatingBlockchain = false;
				return cb && cb();
			}
		});
	};
}

export function incrementReportPeriod(cb) {
	return function(dispatch, getState) {
		var { blockchain } = getState(),
			expectedReportPeriod = blockchain.currentPeriod - 1;

		// if the report period is as expected, exit
		if (blockchain.reportPeriod === expectedReportPeriod) {
			return cb && cb();
		}

		// load report period from chain to see if that one is as expected
		AugurJS.getReportPeriod(BRANCH_ID, (err, chainReportPeriod) => {
			if (err) {
				console.log('ERROR getReportPeriod1', BRANCH_ID, err);
				return cb && cb();
			}

			chainReportPeriod = parseInt(chainReportPeriod, 10);

			// if the report period on chain is up-to-date, update ours to match and exit
			if (chainReportPeriod === expectedReportPeriod) {
				dispatch({ type: UPDATE_BLOCKCHAIN, data: { reportPeriod: expectedReportPeriod }});
				return cb && cb();
			}

			// if we are the first to encounter the new period, we get the honor of incrementing it on chain for everyone
			AugurJS.incrementPeriodAfterReporting(BRANCH_ID, (err, res) => {
				if (err) {
					console.error('ERROR incrementPeriodAfterReporting()', err);
					return cb && cb();
				}

				// check if it worked out
				AugurJS.getReportPeriod(BRANCH_ID, (err, verifyReportPeriod) => {
					if (err) {
						console.log('ERROR getReportPeriod2', err);
						return cb && cb();
					}
					if (parseInt(verifyReportPeriod, 10) !== expectedReportPeriod) {
						console.warn('Report period not as expected after being incremented, actual:', verifyReportPeriod, 'expected:', expectedReportPeriod);
						return cb && cb();
					}
					dispatch({ type: UPDATE_BLOCKCHAIN, data: { reportPeriod: expectedReportPeriod }});
					return cb && cb();
				});
			});
		});
	};
}