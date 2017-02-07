import React, { PropTypes } from 'react';
import Input from 'modules/common/components/input';

const MarketsSearch = p => (
  <article className={`search-input ${p.className}`} >
    <i className="fa fa-search" />
    <Input
      placeholder="Search Markets"
      isClearable
      value={p.keywords && p.keywords.value}
      onChange={p.keywords && p.keywords.onChangeKeywords}
    />
  </article>
);

MarketsSearch.propTypes = {
  className: PropTypes.string,
  keywords: PropTypes.object
};

export default MarketsSearch;
