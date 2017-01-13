import { augur, abi } from '../../../services/augurjs';
import { updateAssets } from '../../auth/actions/update-assets';
import { syncBlockchain } from '../../app/actions/update-blockchain';
import { syncBranch } from '../../app/actions/update-branch';
import { addOrder, removeOrder, fillOrder } from '../../bids-asks/actions/update-market-order-book';
import { loadMarketsInfo } from '../../markets/actions/load-markets-info';
import { updateOutcomePrice } from '../../markets/actions/update-outcome-price';
import { loadBidsAsks } from '../../bids-asks/actions/load-bids-asks';
import { loadAccountTrades } from '../../my-positions/actions/load-account-trades';
import { claimProceeds } from '../../my-positions/actions/claim-proceeds';
import { convertLogsToTransactions, convertTradeLogToTransaction } from '../../transactions/actions/convert-logs-to-transactions';

export function refreshMarket(marketID) {
  return (dispatch, getState) => {
    if (getState().marketsData[marketID]) {
      dispatch(loadMarketsInfo([marketID], () => {
        dispatch(loadBidsAsks(marketID));
        if (getState().loginAccount.address) {
          dispatch(loadAccountTrades(marketID));
        }
      }));
    }
  };
}

export function listenToUpdates() {
  return (dispatch, getState) => {
    augur.filters.listen({

			// block arrivals
      block: (blockHash) => {
        dispatch(updateAssets());
        dispatch(syncBlockchain());
        dispatch(syncBranch());
      },

			collectedFees: (msg) => {
				if (msg && msg.sender === getState().loginAccount.address) {
					console.debug('collectedFees:', msg);
					dispatch(updateAssets());
					dispatch(convertLogsToTransactions('collectedFees', [msg]));
				}
			},

			payout: (msg) => {
				if (msg && msg.sender === getState().loginAccount.address) {
					console.debug('payout:', msg);
					dispatch(updateAssets());
					dispatch(convertLogsToTransactions('payout', [msg]));
				}
			},

			penalizationCaughtUp: (msg) => {
				if (msg && msg.sender === getState().loginAccount.address) {
					console.debug('penalizationCaughtUp:', msg);
					dispatch(updateAssets());
					dispatch(convertLogsToTransactions('penalizationCaughtUp', [msg]));
				}
			},

			// Reporter penalization
			penalize: (msg) => {
				if (msg && msg.sender === getState().loginAccount.address) {
					console.debug('penalize:', msg);
					dispatch(updateAssets());
					dispatch(convertLogsToTransactions('penalize', [msg]));
				}
			},

			registration: (msg) => {
				if (msg && msg.sender === getState().loginAccount.address) {
					console.debug('registration:', msg);
					dispatch(convertLogsToTransactions('registration', [msg]));
				}
			},

			submittedReport: (msg) => {
				if (msg && msg.sender === getState().loginAccount.address) {
					console.debug('submittedReport:', msg);
					dispatch(updateAssets());
					dispatch(convertLogsToTransactions('submittedReport', [msg]));
				}
			},

			submittedReportHash: (msg) => {
				if (msg && msg.sender === getState().loginAccount.address) {
					console.debug('submittedReportHash:', msg);
					dispatch(updateAssets());
					dispatch(convertLogsToTransactions('submittedReportHash', [msg]));
				}
			},

			// trade filled: { market, outcome (id), price }
			log_fill_tx: (msg) => {
				console.debug('log_fill_tx:', msg);
				if (msg && msg.market && msg.price && msg.outcome !== undefined && msg.outcome !== null) {
					dispatch(updateOutcomePrice(msg.market, msg.outcome, abi.bignum(msg.price)));
					dispatch(fillOrder(msg));
					const { address } = getState().loginAccount;
					if (msg.sender === address || msg.owner === address) {
						dispatch(convertTradeLogToTransaction('log_fill_tx', {
							[msg.market]: { [msg.outcome]: [{
								...msg,
								maker: msg.owner === address
							}] }
						}, msg.market));
						dispatch(updateAssets());
						dispatch(loadMarketsInfo([msg.market]));
					}
				}
			},

			// short sell filled
			log_short_fill_tx: (msg) => {
				console.debug('log_short_fill_tx:', msg);
				if (msg && msg.market && msg.price && msg.outcome !== undefined && msg.outcome !== null) {
					dispatch(updateOutcomePrice(msg.market, msg.outcome, abi.bignum(msg.price)));
					dispatch(fillOrder({ ...msg, type: 'sell' }));
					const { address } = getState().loginAccount;

					// if the user is either the maker or taker, add it to the transaction display
					if (msg.sender === address || msg.owner === address) {
						dispatch(convertTradeLogToTransaction('log_fill_tx', {
							[msg.market]: { [msg.outcome]: [{
								...msg,
								isShortSell: true,
								maker: msg.owner === address
							}] }
						}, msg.market));
						dispatch(updateAssets());
						dispatch(loadMarketsInfo([msg.market]));
					}
				}
			},

			// order added to orderbook
			log_add_tx: (msg) => {
				console.debug('log_add_tx:', msg);
				if (msg && msg.market && msg.outcome !== undefined && msg.outcome !== null) {
					dispatch(addOrder(msg));

					// if this is the user's order, then add it to the transaction display
					if (msg.sender === getState().loginAccount.address) {
						dispatch(convertTradeLogToTransaction('log_add_tx', {
							[msg.market]: { [msg.outcome]: [msg] }
						}, msg.market));
						dispatch(updateAssets());
					}
				}
			},

			// order removed from orderbook
			log_cancel: (msg) => {
				console.debug('log_cancel:', msg);
				if (msg && msg.market && msg.outcome !== undefined && msg.outcome !== null) {
					dispatch(removeOrder(msg));

					// if this is the user's order, then add it to the transaction display
					if (msg.sender === getState().loginAccount.address) {
						dispatch(convertTradeLogToTransaction('log_cancel', {
							[msg.market]: { [msg.outcome]: [msg] }
						}, msg.market));
						dispatch(updateAssets());
					}
				}
			},

			// new market: msg = { marketID }
			marketCreated: (msg) => {
				if (msg && msg.marketID) {
					console.debug('marketCreated:', msg);
					dispatch(loadMarketsInfo([msg.marketID]));
					if (msg.sender === getState().loginAccount.address) {
						dispatch(updateAssets());
						dispatch(convertLogsToTransactions('marketCreated', [msg]));
					}
				}
			},

			// market trading fee updated (decrease only)
			tradingFeeUpdated: (msg) => {
				console.debug('tradingFeeUpdated:', msg);
				if (msg && msg.marketID) {
					dispatch(loadMarketsInfo([msg.marketID]));
					dispatch(updateAssets());
					dispatch(convertLogsToTransactions('tradingFeeUpdated', [msg]));
				}
			},

			deposit: (msg) => {
				if (msg && msg.sender === getState().loginAccount.address) {
					console.debug('deposit:', msg);
					dispatch(updateAssets());
					dispatch(convertLogsToTransactions('deposit', [msg]));
				}
			},

			withdraw: (msg) => {
				if (msg && msg.sender === getState().loginAccount.address) {
					console.debug('withdraw:', msg);
					dispatch(updateAssets());
					dispatch(convertLogsToTransactions('withdraw', [msg]));
				}
			},

			// Cash (ether) transfer
			cashSent: (msg) => {
				if (msg) {
					console.debug('cashSent:', msg);
					const { address } = getState().loginAcocunt;
					if (msg._from === address || msg._to === address) {
						dispatch(updateAssets());
						dispatch(convertLogsToTransactions('Transfer', [msg]));
					}
				}
			},


			// Reputation transfer
			Transfer: (msg) => {
				if (msg) {
					console.debug('Transfer:', msg);
					const { address } = getState().loginAcocunt;
					if (msg._from === address || msg._to === address) {
						dispatch(updateAssets());
						dispatch(convertLogsToTransactions('Transfer', [msg]));
					}
				}
			},

			Approval: (msg) => {
				if (msg) {
					console.debug('Approval:', msg);
					const { address } = getState().loginAcocunt;
					if (msg._owner === address || msg._spender === address) {
						dispatch(updateAssets());
						dispatch(convertLogsToTransactions('Approval', [msg]));
					}
				}
			},

			closedMarket: (msg) => {
				if (msg && msg.market) {
					console.debug('closedMarket:', msg);
					const { branch, loginAccount } = getState();
					if (branch.id === msg.branch) {
						dispatch(loadMarketsInfo([msg.market], () => {
							if (loginAccount.address) dispatch(claimProceeds());
						}));
					}
				}
			}
		}, filters => console.log('Listening to filters:', filters));
	};
}
