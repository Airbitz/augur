import React, { PropTypes } from 'react';
// import classnames from 'classnames';
import Checkbox from '../../common/components/checkbox';

const Filters = (p) => (
	<aside className="filters">
		{p.filters.map(filter =>
			<div key={filter.title} className="filters-group">
				<span className="title">{filter.title}</span>
				{filter.options.map(option =>
					<Checkbox key={option.value} className="filter" text={option.name} text2={`(${option.numMatched})`} isChecked={option.isSelected} onClick={option.onClick} />
				)}
			</div>
		)}
	</aside>
);

Filters.propTypes = {
	filters: PropTypes.array
};

export default Filters;
