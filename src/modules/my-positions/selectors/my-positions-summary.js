import memoizerific from 'memoizerific';
import { formatEther, formatPercent, formatShares, formatNumber } from '../../../utils/format-number';
import selectMyPositions from '../../../modules/my-positions/selectors/my-positions';

export default function () {
	const myPositions = selectMyPositions();

	return generateMarketsPositionsSummary(myPositions);
}

export const generateOutcomePositionSummary = memoizerific(50)((outcomeAccountTrades, lastPrice, sharesPurchased) => {
	if (!outcomeAccountTrades || !outcomeAccountTrades.length) {
		return null;
	}

	let numShares = 0;
	let qtyShares = 0;
	let totalValue = 0;
	let totalCost = 0;
	let totalSellShares = 0;
	outcomeAccountTrades.forEach(outcomeAccountTrade => {
		if (!outcomeAccountTrade) {
			return;
		}

		// buy or sell
		if (outcomeAccountTrade.type === 1) {
			numShares = parseFloat(outcomeAccountTrade.shares);
			qtyShares += numShares;
			totalValue += lastPrice * numShares;
			totalCost += parseFloat(outcomeAccountTrade.price) * numShares;
		} else {
			totalSellShares += parseFloat(outcomeAccountTrade.shares);
		}
	});

	// remove sells
	const avgPerShareValue = calculateAvgPrice(qtyShares, totalValue);
	const avgPerShareCost = calculateAvgPrice(qtyShares, totalCost);

	totalValue -= totalSellShares * avgPerShareValue;
	totalCost -= totalSellShares * avgPerShareCost;

	return generatePositionsSummary(1, sharesPurchased - totalSellShares, totalValue, totalCost);
});

export const generateMarketsPositionsSummary = memoizerific(50)(markets => {
	if (!markets || !markets.length) {
		return null;
	}

	let qtyShares = 0;
	let totalValue = 0;
	let totalCost = 0;
	const positionOutcomes = [];

	markets.forEach(market => {
		market.outcomes.forEach(outcome => {
			if (!outcome || !outcome.position || !outcome.position.numPositions || !outcome.position.numPositions.value) {
				return;
			}
			qtyShares += outcome.position.qtyShares.value;
			totalValue += outcome.position.totalValue.value;
			totalCost += outcome.position.totalCost.value;
			positionOutcomes.push(outcome);
		});
	});

	const positionsSummary = generatePositionsSummary(positionOutcomes.length, qtyShares, totalValue, totalCost);

	return {
		...positionsSummary,
		positionOutcomes
	};
});

export const generatePositionsSummary = memoizerific(20)((numPositions, qtyShares, totalValue, totalCost) => {
	const purchasePrice = calculateAvgPrice(qtyShares, totalCost);
	const valuePrice = calculateAvgPrice(qtyShares, totalValue);
	const shareChange = valuePrice - purchasePrice;
	const gainPercent = totalCost && ((totalValue - totalCost) / totalCost * 100) || 0;
	const netChange = totalValue - totalCost;

	return {
		numPositions: formatNumber(numPositions, { decimals: 0, decimalsRounded: 0, denomination: 'positions', positiveSign: false, zeroStyled: false }),
		qtyShares: formatShares(qtyShares),
		purchasePrice: formatEther(purchasePrice),
		totalValue: formatEther(totalValue),
		totalCost: formatEther(totalCost),
		shareChange: formatEther(shareChange),
		gainPercent: formatPercent(gainPercent),
		netChange: formatEther(netChange, { denomination: ' eth' })
	};
});

function calculateAvgPrice(qtyShares, totalCost) {
	if (!qtyShares || !totalCost) {
		return 0;
	}
	return qtyShares && totalCost / qtyShares;
}
