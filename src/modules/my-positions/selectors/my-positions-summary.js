import memoize from 'memoizee';
import BigNumber from 'bignumber.js';

import store from 'src/store';

import selectMyPositions from 'modules/my-positions/selectors/my-positions';
import { closePosition } from 'modules/my-positions/actions/close-position';

import { ZERO } from 'modules/trade/constants/numbers';
import { BIDS, ASKS } from 'modules/order-book/constants/order-book-order-types';

import { augur, abi } from 'services/augurjs';
import { formatEther, formatShares, formatNumber } from 'utils/format-number';

export default function () {
  const myPositions = selectMyPositions();
  return generateMarketsPositionsSummary(myPositions);
}

export const generateOutcomePositionSummary = memoize((adjustedPosition, outcomeAccountTrades, lastPrice, orderBook) => {
  if ((!outcomeAccountTrades || !outcomeAccountTrades.length) && !adjustedPosition) {
    return null;
  }

  const trades = outcomeAccountTrades ? outcomeAccountTrades.slice() : [];
  const { position, realized, unrealized, meanOpenPrice } = augur.calculateProfitLoss(trades, lastPrice, adjustedPosition);
  const relevantOrders = orderBook[position > 0 ? BIDS : ASKS];
  const positionShares = new BigNumber(position);

  return {
    ...generatePositionsSummary(1, position, meanOpenPrice, realized, unrealized),
    isClosable: !!positionShares.toNumber() && !!relevantOrders.length, // Based on available orders, can this position be at least partially closed
    isFullyClosable: positionShares.toNumber() && relevantOrders.length ? isPositionFullyClosable(positionShares.absoluteValue(), relevantOrders) : false, // Based on available orders, can this position be fully closed
    closePosition: (marketID, outcomeID) => {
      store.dispatch(closePosition(marketID, outcomeID));
    }
  };
}, { max: 50 });

export const generateMarketsPositionsSummary = memoize((markets) => {
  if (!markets || !markets.length) {
    return null;
  }
  let qtyShares = ZERO;
  let totalRealizedNet = ZERO;
  let totalUnrealizedNet = ZERO;
  const positionOutcomes = [];
  markets.forEach((market) => {
    market.outcomes.forEach((outcome) => {
      if (!outcome || !outcome.position || !outcome.position.numPositions || !outcome.position.numPositions.value || ((!outcome.position.qtyShares || !outcome.position.qtyShares.value) && (!outcome.position.realizedNet || !outcome.position.realizedNet.value))) {
        return;
      }
      qtyShares = qtyShares.plus(abi.bignum(outcome.position.qtyShares.value));
      totalRealizedNet = totalRealizedNet.plus(abi.bignum(outcome.position.realizedNet.value));
      totalUnrealizedNet = totalUnrealizedNet.plus(abi.bignum(outcome.position.unrealizedNet.value));
      positionOutcomes.push(outcome);
    });
  });
  const positionsSummary = generatePositionsSummary(positionOutcomes.length, qtyShares, 0, totalRealizedNet, totalUnrealizedNet);
  return {
    ...positionsSummary,
    positionOutcomes
  };
}, { max: 50 });

export const generatePositionsSummary = memoize((numPositions, qtyShares, meanTradePrice, realizedNet, unrealizedNet) => {
  const totalNet = abi.bignum(realizedNet).plus(abi.bignum(unrealizedNet));
  return {
    numPositions: formatNumber(numPositions, {
      decimals: 0,
      decimalsRounded: 0,
      denomination: 'Positions',
      positiveSign: false,
      zeroStyled: false
    }),
    qtyShares: formatShares(qtyShares),
    purchasePrice: formatEther(meanTradePrice),
    realizedNet: formatEther(realizedNet),
    unrealizedNet: formatEther(unrealizedNet),
    totalNet: formatEther(totalNet)
  };
}, { max: 20 });

const isPositionFullyClosable = memoize((position, orders) => {
  let sharesFilled = new BigNumber(0);

  return !!orders.find((order) => {
    sharesFilled = sharesFilled.plus(new BigNumber(order.shares.value));

    if (sharesFilled.toNumber() >= position) {
      return true;
    }

    return false;
  });
}, { max: 20 });
