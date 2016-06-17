import React, { PropTypes } from 'react';
import ValueDenomination from '../../common/components/value-denomination';
import classNames from 'classnames';

const Basics = (p) => (
	<section className="basics">
		{!!p.tags && !!p.tags.length &&
			<ul className="tags">
				{p.tags.map((tag, i) => (
					<li key={i} className={classNames('tag', { link: !!tag.name })} onClick={!!tag.onClick && tag.onClick}>{!!tag.name ? tag.name : tag}</li>
				))}
			</ul>
		}

		<span className="description" title={p.description}>{p.description}</span>

		<ul className="properties">
			{!!p.endDate &&
				<li className="property end-date">
					<span className="property-label">{(p.endDate && p.endDate.value < new Date()) ? 'ended' : 'ends'}</span>
					<ValueDenomination className="property-value" {...p.endDate} />
				</li>
			}
			<li className="property fee">
				<span className="property-label">fee</span>
				<ValueDenomination className="property-value" {...p.tradingFeePercent} />
				{p.makerFeePercent && p.takerFeePercent &&
					<span>
						(<ValueDenomination className="property-value" title="Maker Fee" {...p.makerFeePercent} /> /<ValueDenomination className="property-value" title="Taker Fee" {...p.takerFeePercent} />)
					</span>
				}
			</li>
			<li className="property volume">
				<span className="property-label">volume</span>
				<ValueDenomination className="property-value" {...p.volume} formatted={p.volume.rounded} />
			</li>
		</ul>
	</section>
);

Basics.propTypes = {
	description: PropTypes.string,
	endDate: PropTypes.object,
	tradingFeePercent: PropTypes.object,
	makerFeePercent: PropTypes.object,
	takerFeePercent: PropTypes.object,
	volume: PropTypes.object,
	tags: PropTypes.array
};

export default Basics;
