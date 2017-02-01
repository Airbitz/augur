import async from 'async';
import { augur, constants } from '../../../services/augurjs';
import { convertLogsToTransactions } from '../../../modules/transactions/actions/convert-logs-to-transactions';

export function loadReportingHistory(cb) {
  return (dispatch, getState) => {
    const callback = cb || (e => console.log('loadReportingHistory:', e));
    const { branch, loginAccount } = getState();
    const params = { sender: loginAccount.address, branch: branch.id };
    if (loginAccount.registerBlockNumber) {
      params.fromBlock = loginAccount.registerBlockNumber;
    }
    async.eachLimit([
      'collectedFees',
      'penalizationCaughtUp',
      'penalize',
      'submittedReport',
      'submittedReportHash',
      'slashedRep'
    ], constants.PARALLEL_LIMIT, (label, nextLabel) => {
      augur.getLogs(label, params, null, (err, logs) => {
        if (err) return nextLabel(err);
        if (logs && logs.length) dispatch(convertLogsToTransactions(label, logs));
        nextLabel();
      });
    }, (err) => {
      if (err) return callback(err);
      augur.getLogs('slashedRep', { ...params, sender: null, reporter: loginAccount.address }, null, (err, logs) => {
        if (err) return callback(err);
        if (logs && logs.length) dispatch(convertLogsToTransactions(label, logs));
        callback();
      });
    });
  };
}
