import augur from 'augur.js';
import abi from 'augur-abi';
import BigNumber from 'bignumber.js';

import { PENDING, SUCCESS, FAILED, CREATING_MARKET } from '../modules/transactions/constants/statuses';

var TIMEOUT_MILLIS = 50,
	ex = {};

ex.connect = function(cb) {
	if (process.env.ETHEREUM_HOST_RPC) {
		augur.rpc.nodes.hosted = [process.env.ETHEREUM_HOST_RPC];
	}
	var localnode = null;
	if (document.location.protocol === "http:") {
		localnode = "http://127.0.0.1:8545";
	}
	augur.connect(localnode, null, function (connected) {
		if (!connected) return cb("could not connect to ethereum");
		cb(null, connected);
	});
};

ex.loadCurrentBlock = function(cb) {
	augur.rpc.blockNumber(function (blockNumber) {
		cb(parseInt(blockNumber));
	});
};

ex.loadBranches = function(cb) {
	augur.getBranches(function (branches) {
		if (!branches || branches.error) {
			console.log('ERROR getBranches', branches);
			cb(branches);
		}
		cb(null, branches);
	});
};

ex.loadBranch = function(branchID, cb) {
	var branch = {};

	augur.getPeriodLength(branchID, periodLength => {
		if (!periodLength || periodLength.error) {
			console.info("ERROR getPeriodLength", periodLength);
			return cb(periodLength);
		}
		branch.periodLength = periodLength;
		finish();
	});

	augur.getDescription(branchID, description => {
		if (!description || description.error) {
			console.info("ERROR getDescription", description);
			return cb(description);
		}
		branch.description = description;
		finish();
	});

	function finish() {
		if (branch.periodLength && branch.description) {
			cb(null, branch);
		}
	}
};

ex.loadLoginAccount = function(isHosted, cb) {

	// if available, use the client-side account
	if (augur.web.account.address && augur.web.account.privateKey) {
		console.log("using client-side account:", augur.web.account.address);
		return cb(null, {
			...augur.web.account,
			id: augur.web.account.address
		});
	}

	// hosted node: no unlocked account available
	if (isHosted) {

		// if the user has a persistent login, use it
		var account = augur.web.persist();
		if (account && account.privateKey) {
			console.log("using persistent login:", account);
			return cb(null, {
				...augur.web.account,
				id: augur.web.account.address
			});
		}
		return cb(null);
	}

	// local node: if it's unlocked, use the coinbase account
	// check to make sure the account is unlocked
	augur.rpc.unlocked(augur.from, (unlocked) => {

		// use from/coinbase if unlocked
		if (unlocked && !unlocked.error) {
			console.log("using unlocked account:", augur.from);
			return cb(null, {
				id: augur.from
			});
		}

		// otherwise, no account available
		console.log("account is locked: ", augur.from);
		return cb(null);
	});
};

ex.loadAssets = function(branchID, accountID, cbEther, cbRep, cbRealEther) {
	augur.getCashBalance(accountID, function (result) {
		if (!result || result.error) {
			return cbEther(result);
		}
		return cbEther(null, abi.bignum(result).toNumber());
	});

	augur.getRepBalance(branchID, accountID, function (result) {
		if (!result || result.error) {
			return cbRep(result);
		}
		return cbRep(null, abi.bignum(result).toNumber());
	});

	augur.rpc.balance(accountID, function (wei) {
		if (!wei || wei.error) {
			return cbRealEther(wei);
		}
		return cbRealEther(null, abi.bignum(wei).dividedBy(new BigNumber(10).toPower(18)).toNumber());
	});
};

ex.loadNumMarkets = function(branchID, cb) {
	augur.getNumMarketsBranch(branchID, numMarkets => {
		cb(null, parseInt(numMarkets, 10));
	});
};

ex.loadMarkets = function(branchID, chunkSize, totalMarkets, isDesc, chunkCB) {
	var firstStartIndex = isDesc ? totalMarkets - chunkSize + 1 : 0;

	getMarketsInfo(branchID, firstStartIndex, chunkSize, totalMarkets, isDesc);

	function getMarketsInfo(branchID, startIndex, chunkSize, totalMarkets, isDesc) {
		augur.getMarketsInfo({ branch: branchID, offset: startIndex, numMarketsToLoad: chunkSize }, marketsData => {
			var now = 0 - (Date.now() + window.performance.now());

			if (!marketsData || marketsData.error) {
				return chunkCB(marketsData);
			}

			Object.keys(marketsData).forEach((key, i) => marketsData[key].creationSortOrder = now + i);

			chunkCB(null, marketsData);

			if (isDesc && startIndex > 0) {
				setTimeout(() => getMarketsInfo(branchID, startIndex - chunkSize, chunkSize, totalMarkets, isDesc), TIMEOUT_MILLIS);
			}
			else if (!isDesc && startIndex < totalMarkets) {
				setTimeout(() => getMarketsInfo(branchID, startIndex + chunkSize, chunkSize, totalMarkets, isDesc), TIMEOUT_MILLIS);
			}
		});
	}
};

ex.loadMarket = function(marketID, cb) {
	augur.getMarketInfo(marketID, marketInfo => {
		if (marketInfo && marketInfo.error) {
			return cb(marketInfo);
		}

		cb(null, { ...marketInfo || {}, creationSortOrder: Date.now() + window.performance.now() });
	});
};

ex.listenToUpdates = function(cbBlock, cbContracts, cbPrice, cbCreation) {
	augur.filters.listen({

		// listen for new blocks
		block: function(blockHash) {
			cbBlock(null, blockHash);
		},

		// listen for augur transactions
		contracts: function(filtrate) {
			cbContracts(null, filtrate);
		},

		// update market when a price change has been detected
		price: function(result) {
			cbPrice(null, result);
		},

		// listen for new markets
		creation: function(result) {
			cbCreation(null, result);
		}

	}, function(filters) {
		console.log('### listen to filters:', filters);
	});
};

ex.loadAccountTrades = function(accountID, cb) {
	augur.getAccountTrades(accountID, null, function(accountTrades) {
		if (!accountTrades) {
			return cb();
		}
		if (accountTrades.error) {
			return cb(accountTrades);
		}
		return cb(null, accountTrades);
	});
};

ex.listenToBidsAsks = function() {

};

ex.login = function(handle, password, persist, cb) {
	augur.web.login(handle, password, { persist: persist }, (account) => {
		if (!account) {
			return cb({ code: 0, message: 'failed to login' });
		}
		if (account.error) {
			return cb({ code: account.error, message: account.message });
		}
		return cb(null, {
			...account,
			id: account.address
		});
	});
};

ex.logout = function() {
	augur.web.logout();
};

ex.register = function(handle, password, persist, cb, cbExtras) {
	augur.web.register(handle, password, { persist: persist }, {
		onRegistered: account => {
			if (!account) {
				return cb({ code: 0, message: 'failed to register' });
			}
			if (account.error) {
				return cb({ code: account.error, message: account.message });
			}
			return cb(null, {
				...account,
				id: account.address
			});
		},
		onSendEther: res => {
			if (res.error) {
				return cb({ code: res.error, message: res.message });
			}
			cbExtras(res);
		},
		onSent: res => {
			if (res.error) {
				return cb({ code: res.error, message: res.message });
			}
			cbExtras(res);
		},
		onSuccess: res => {
			if (res.error) {
				return cb({ code: res.error, message: res.message });
			}
			cbExtras(res);
		},
		onFailed: err => {
			cb(err);
		}
	});
};

ex.loadMeanTradePrices = function(accountID, cb) {
	if (!accountID) {
		cb('AccountID required');
	}
	augur.getAccountMeanTradePrices(accountID, meanTradePrices => {
		if (meanTradePrices && meanTradePrices.error) {
			return cb(meanTradePrices);
		}
		cb(null, meanTradePrices);
	});
};

ex.tradeShares = function(branchID, marketID, outcomeID, numShares, limit, cap, cb) {
	augur.trade({
		branch: branchID,
		market: abi.hex(marketID),
		outcome: outcomeID,
		amount: numShares,
		limit: limit,
		stop: false,
		cap: null,
		expiration: 0,
		callbacks: {
			onMarketHash: (marketHash) => cb(null, { status: 'sending...', data: marketHash }),
			onCommitTradeSent: (res) => cb(null, { status: 'committing...', data: res }),
			onCommitTradeSuccess: (res) => cb(null, { status: 'broadcasting...', data: res }),
			onCommitTradeFailed: (err) => cb(err),
			onTradeSent: (res) => cb(null, { status: 'confirming...', data: res }),
			onTradeSuccess: (res) => cb(null, { status: SUCCESS, data: res}),
			onTradeFailed: (err) => cb(err),
			onOrderCreated: (res) => console.log('onOrderCreated', res)
		}
	});
};

ex.getSimulatedBuy = function(marketID, outcomeID, numShares) {
	return augur.getSimulatedBuy(marketID, outcomeID, numShares);
};

ex.getSimulatedSell = function(marketID, outcomeID, numShares) {
	return augur.getSimulatedSell(marketID, outcomeID, numShares);
};

ex.loadPriceHistory = function(marketID, cb) {
	if (!marketID) {
		cb('ERROR: loadPriceHistory() marketID required');
	}
	augur.getMarketPriceHistory(marketID, function(priceHistory) {
		if (priceHistory && priceHistory.error) {
			return cb(priceHistory.error);
		}
		cb(null, priceHistory);
	});
};

ex.createMarket = function(branchID, newMarket, cb) {
	augur.createSingleEventMarket({
		branchId: branchID,
		description: newMarket.description,
		expirationBlock: newMarket.endBlock,
		minValue: newMarket.minValue,
		maxValue: newMarket.maxValue,
		numOutcomes: newMarket.numOutcomes,
		alpha: "0.0079",
		initialLiquidity: newMarket.initialLiquidity,
		tradingFee: newMarket.tradingFee,
		onSent: r => cb(null, { status: CREATING_MARKET, marketID: r.callReturn, txHash: r.txHash }),
		onSuccess: r => cb(null, { status: SUCCESS, marketID: r.callReturn, tx: r }),
		onFailed: r => cb(r)
	});
};

ex.createMarketMetadata = function(newMarket, cb) {
console.log('--createMarketMetadata', newMarket.id, ' --- ', newMarket.detailsText, ' --- ', newMarket.tags, ' --- ', newMarket.resources, ' --- ', newMarket.expirySource);
	var tag1, tag2, tag3;
	if (newMarket.tags && newMarket.tags.constructor === Array && newMarket.tags.length) {
		tag1 = newMarket.tags[0];
		if (newMarket.tags.length > 1) tag2 = newMarket.tags[1];
		if (newMarket.tags.length > 2) tag3 = newMarket.tags[2];
	}
	augur.setMetadata({
			market: newMarket.id,
			details: newMarket.detailsText,
			tag1: tag1,
			tag2: tag2,
			tag3: tag3,
			links: newMarket.resources,
			source: newMarket.expirySource
		},
		res => cb(null, { status: 'processing metadata...', metadata: res }),
		res => cb(null, { status: SUCCESS, metadata: res }),
		err => cb(err)
	);
};

ex.getReport = function(branchID, reportPeriod, eventID) {
	augur.getReport(branchID, reportPeriod, eventID, function (report) {
		console.log('*************report', report);
	});
};

ex.loadPendingReportEventIDs = function(eventIDs, accountID, reportPeriod, branchID, cb) {
	var pendingReportEventIDs = {};

	if (!eventIDs || !eventIDs.length) {
		return cb(null, {});
	}

	// load market-ids related to each event-id one at a time
	(function processEventID() {
		var eventID = eventIDs.pop(),
			randomNumber = abi.hex(abi.bignum(accountID).plus(abi.bignum(eventID))),
			diceroll = augur.rpc.sha3(randomNumber, true);

		if (!diceroll) {
			console.log('WARN: couldn\'t get sha3 for', randomNumber, diceroll);
			return finish();
		}

		augur.calculateReportingThreshold(branchID, eventID, reportPeriod, threshold => {
			if (!threshold) {
				console.log('WARN: couldn\'t get reporting threshold for', eventID);
				return finish();
			}
			if (threshold.error) {
				console.log('ERROR: calculateReportingThreshold', threshold);
				return finish();
			}
			if (abi.bignum(diceroll).lt(abi.bignum(threshold))) {
				augur.getReportHash(branchID, reportPeriod, accountID, eventID, function (reportHash) {
					if (reportHash && reportHash !== '0x0') {
						pendingReportEventIDs[eventID] = { reportHash };
					}
					else {
						pendingReportEventIDs[eventID] = { reportHash: null };
					}

					finish();
				});
			}
			else {
				finish();
			}
		});

		function finish() {

			// if there are more event ids, re-run this function to get their market ids
			if (eventIDs.length) {
				setTimeout(processEventID, TIMEOUT_MILLIS);
			}

			// if no more event ids to process, exit this loop and callback
			else {
				cb(null, pendingReportEventIDs);
			}
		}
	})();
};

ex.submitReportHash = function(branchID, accountID, event, report, cb) {
	var minValue = abi.bignum(event.minValue),
		maxValue = abi.bignum(event.maxValue),
		numOutcomes = abi.bignum(event.numOutcomes),
		reportHash,
		rescaledReportedOutcome;

	// Re-scale scalar/categorical reports so they fall between 0 and 1
	if (report.isIndeterminate) {
		rescaledReportedOutcome = report.reportedOutcomeID;
	}
	else {
		if (report.isScalar) {
			rescaledReportedOutcome = abi.bignum(report.reportedOutcomeID).minus(minValue).dividedBy(maxValue.minus(minValue)).toFixed();
		}
		else if (report.isCategorical) {
			rescaledReportedOutcome = abi.bignum(report.reportedOutcomeID).minus(abi.bignum(1)).dividedBy(numOutcomes.minus(abi.bignum(1))).toFixed();
		}
		else {
			rescaledReportedOutcome = report.reportedOutcomeID;
		}
	}

	reportHash = augur.makeHash(report.salt, rescaledReportedOutcome, event.id, accountID, report.isIndeterminate, report.isScalar);

	augur.submitReportHash({
		branch: branchID,
		reportHash: reportHash,
		reportPeriod: report.reportPeriod,
		eventID: event.id,
		eventIndex: event.index,
		onSent: res => cb(null, { ...res, reportHash, status: 'processing...' }),
		onSuccess: res => cb(null, { ...res, reportHash, status: SUCCESS }),
		onFailed: err => cb(err)
	});
};

ex.penalizationCatchup = function (branchID, cb) {
	augur.penalizationCatchup({
		branch: branchID,
		onSent: res => {
			console.log("penalizationCatchup sent:", res);
		},
		onSuccess: res => {
			console.log("penalizationCatchup success:", res);
			cb(null, res);
		},
		onFailed: err => {
			console.error("penalizationCatchup failed:", err);
			if (err.error === "0") {
				// already caught up
			}
			cb(err);
		}
	});
};

ex.penalizeNotEnoughReports = function (branchID, cb) {
	var self = this;
	augur.penalizeNotEnoughReports({
		branch: branchID,
		onSent: res => {
			console.log("penalizeNotEnoughReports sent:", res);
		},
		onSuccess: res => {
			console.log("penalizeNotEnoughReports success:", res);
			cb(null, res);
		},
		onFailed: err => {
			console.error("penalizeNotEnoughReports failed:", err);
			if (err.error === "-1") {
				// already called
				return cb(err);
			} else if (err.error === "-2") {
				// need to catch up
				return self.penalizationCatchup(branchID, cb);
			}
			cb(err);
		}
	});
};

ex.penalizeWrong = function (branchID, period, event, cb) {
	var self = this;
	augur.getMarkets(event, markets => {
		if (!markets || markets.error) return console.error("getMarkets:", markets);
		augur.getOutcome(event, outcome => {
			if (outcome !== "0" && !outcome.error) {
				console.log("Calling penalizeWrong for:", branchID, period, event);
				augur.penalizeWrong({
					branch: branchID,
					event: event,
					onSent: res => {
						console.log("penalizeWrong sent for event " + event, res);
					},
					onSuccess: res => {
						console.log("penalizeWrong success for event " + event, res);
						cb(null, res);
					},
					onFailed: err => {
						console.error("penalizeWrong failed for event" + event, err);
						if (err.error === "-3") {
							augur.penalizeNotEnoughReports(branchID, (err, res) => {
								self.penalizeWrong(branchID, period, event, cb);
							});
						}
						cb(err);
					}
				});
			} else {
				self.closeMarket(branchID, markets[0], (err, res) => {
					if (err) return cb(err);
					self.penalizeWrong(branchID, period, event, cb);
				});
			}
		});
	});
};

ex.closeMarket = function (branchID, marketID, cb) {
	augur.closeMarket({
		branch: branchID,
		market: marketID,
		onSent: res => {
			//console.log("closeMarket sent:", res);
		},
		onSuccess: res => {
			//console.log("closeMarket success:", res);
			cb(null, res);
		},
		onFailed: err => {
			//console.error("closeMarket error:", err);
			cb(err);
		}
	});
};

ex.collectFees = function (branchID, cb) {
	augur.collectFees({
		branch: branchID,
		onSent: res => {
		},
		onSuccess: res => {
			cb(null, res);
		},
		onFailed: err => {
			cb(err);
		}
	});
};

ex.incrementPeriodAfterReporting = function (branchID, cb) {
	augur.incrementPeriodAfterReporting({
		branch: branchID,
		onSent: (result) => {},
		onFailed: (err) => cb(err),
		onSuccess: (result) => cb(null, result)
	});
};

ex.getReportPeriod = function (branchID, cb) {
	augur.getReportPeriod(branchID, function(res) {
		if (res.error) {
			return cb(res);
		}
		return cb(null, res);
	});
};



ex.getOutcome = augur.getOutcome.bind(augur);
ex.getEventIndex = augur.getEventIndex.bind(augur);

ex.submitReport = augur.submitReport.bind(augur);
ex.getEvents = augur.getEvents.bind(augur);
ex.getReportedPeriod = augur.getReportedPeriod.bind(augur);
ex.rpc = augur.rpc;

module.exports = ex;
