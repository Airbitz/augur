import { augur } from '../../../services/augurjs';
import { updateMarketPriceHistory } from '../../market/actions/update-market-price-history';
import { updateMarketTradesData } from '../../portfolio/actions/update-market-trades-data';

export function loadPriceHistory(marketID) {
  return (dispatch, getState) => {
    augur.getMarketPriceHistory(marketID, (priceHistory) => {
      if (priceHistory && priceHistory.error) {
        return console.warn('ERROR: loadPriceHistory()', priceHistory);
      }
      dispatch(updateMarketTradesData({
        [marketID]: priceHistory
      }));
      dispatch(updateMarketPriceHistory(marketID, priceHistory));
    });
  };
}
