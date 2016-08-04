import React from 'react';
import TradeBuilderRow from '../../../modules/trade/components/trade-builder-row';

const TradePanel = (p) => (
	<table className="trade-builder">
		<thead className="trade-builder-header">
			<tr>
				<th className="outcome-name">Outcome</th>
				<th className="bid">{!!p.selectedOutcome.selectedOutcomeID ? 'Top Orders' : 'Best Price'}</th>
				<th className="buy-sell-button"></th>
				<th className="num-shares">Shares</th>
				<th className="limit-price">Limit</th>
				<th className="fee-to-pay">Fee</th>
				<th className="total-cost">Total</th>
			</tr>
		</thead>

		<tbody className="trade-builder-body">
			{p.outcomes.map(outcome => (
				<TradeBuilderRow
					key={outcome.id}
					{...outcome}
					showFullOrderBook={!!p.selectedOutcome && !!p.selectedOutcome.selectedOutcomeID && p.selectedOutcome.selectedOutcomeID === outcome.id}
					isFaded={!!p.selectedOutcome && !!p.selectedOutcome.selectedOutcomeID && p.selectedOutcome.selectedOutcomeID !== outcome.id}
					updateSelectedOutcome={p.selectedOutcome.updateSelectedOutcome}
				/>
			))}
		</tbody>
	</table>
);

TradePanel.propTypes = {
	outcomes: React.PropTypes.array,
	selectedOutcome: React.PropTypes.object,
	userOpenOrdersSummary: React.PropTypes.object
};

export default TradePanel;
