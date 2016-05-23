import * as AugurJS from '../../../services/augurjs';
import { updateAssets } from '../../auth/actions/update-assets';
import { BRANCH_ID } from '../../app/constants/network';

var tracker = {};

export function autoReportSequence(isReportConfirmationPhase) {
	return function (dispatch, getState) {

		var { branch, blockchain, loginAccount } = getState();
		var branchID = BRANCH_ID;
		var prevPeriod = blockchain.reportPeriod - 1;
		var track = tracker[prevPeriod];
		if (!track) track = {};
		if (isReportConfirmationPhase === undefined) {
			isReportConfirmationPhase = blockchain.isReportConfirmationPhase;
		}

		// if we're in the first half of the reporting period
		if (!isReportConfirmationPhase) {

			// close any markets that are ready to be closed
			if (loginAccount.ether && !track.calledCloseMarkets) {
				AugurJS.closeMarkets(branchID, prevPeriod, (err, closedMarkets) => {
					if (err) console.error("closeMarkets:", err);
					track.calledCloseMarkets = true;
					console.log("Closed markets:", closedMarkets);
				});
			}

			// if this user has reputation
			if (loginAccount.rep) {
				if (!track.calledPenalizeNotEnoughReports && !track.calledPenalizationCatchup) {
					AugurJS.getReportedPeriod(branchID, prevPeriod, loginAccount, reported => {

						// if the reporter submitted a report during the previous period,
						// penalize if they did not submit enough reports.
						if (reported === "1") {
							AugurJS.penalizeNotEnoughReports(branchID, (err, res) => {
								track.calledPenalizeNotEnoughReports = true;
								dispatch(updateAssets());
							});
						}

						// if the reporter did not submit a report during the previous period,
						// dock 10% for each report-less period.
						else {
							AugurJS.penalizationCatchup(branchID, (err, res) => {
								track.calledPenalizationCatchup = true;
								dispatch(updateAssets());
							});
						}
					});

				// number-of-reports penalties applied; now penalize wrong answers.
				} else {
					AugurJS.getEvents(branchID, prevPeriod, events => {
						if (!events || events.error) return console.error("getEvents:", events);
						async.eachSeries(events, (event, nextEvent) => {
							if (track.calledPenalizeWrong && track.calledPenalizeWrong[event]) {
								return nextEvent();
							}
							AugurJS.penalizeWrong(branchID, prevPeriod, event, (err, res) => {
								if (err) {
									if (track.calledPenalizeWrong && track.calledPenalizeWrong.length) {
										if (track.calledPenalizeWrong[event]) {
											track.calledPenalizeWrong[event] = false;
										}
									}
									track.calledPenalizeNotEnoughReports = false;
								}
								if (!track.calledPenalizeWrong) track.calledPenalizeWrong = {};
								track.calledPenalizeWrong[event] = true;
								nextEvent();
							});
						}, err => {
							if (err) {
								return console.error("penalizeWrong series error:", err);
							}
							console.log("penalizeWrong series completed");
						});
					});
				}
			}

		// if we're in the second half of the reporting period
		} else {

			// if this user has reputation
			if (loginAccount.rep) {
				// TODO
				// for each event in this report period:
				//  AugurJS.submitReport(...);
				//
			}

			// trade and rep redistribution payouts
			AugurJS.collectFees(branchID, (err, res) => {
				dispatch(updateAssets());
			});
		}
	};
}
