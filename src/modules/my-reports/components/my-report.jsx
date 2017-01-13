import React from 'react';
import ReactTooltip from 'react-tooltip';

import ValueDenomination from 'modules/common/components/value-denomination';
import ValueDate from 'modules/common/components/value-date';
import EmDash from 'modules/common/components/em-dash';
import ReportEthics from 'modules/my-reports/components/report-ethics';

const Report = p => (
  <div className="portfolio-row">
    <div className="portfolio-group portfolio-main-group">
      <div className="portfolio-pair">
        <span className="report-main-group-title">outcome: </span>
        <span className="report-main-group-title-outcome">
          {p.outcome && p.outcomePercentage && p.outcomePercentage.value &&
          <span>{p.outcome}  (<ValueDenomination {...p.outcomePercentage} />)</span>
					}
          {p.outcome && !p.outcomePercentage &&
          <span>{p.outcome}</span>
					}
          {!p.outcome &&
          <EmDash />
					}
        </span>
      </div>
      <div className="portfolio-pair">
        <span className="report-main-group-title">reported: </span>
        <span className="report-main-group-title-outcome">
          {!!p.isCommitted && !p.isRevealed &&
          <span
            className="report-committed"
            data-tip="You have successfully committed to this report. Remember to login to reveal the report!"
          >
            {p.reported || <EmDash />}
          </span>
					}
          {!!p.isRevealed &&
          <span className="report-revealed">
            {p.reported || <EmDash />}
          </span>
					}
          {!p.isRevealed && !p.isCommitted &&
          <span>{p.reported || <EmDash />}</span>
					}
          {!!p.outcome && p.isReportEqual &&
          <span
            className="fa report-equal"
            data-tip="Your report matches the consensus outcome"
          >
							&#xf058;
						</span>
					}
          {!!p.outcome && !p.isReportEqual &&
          <span
            className="fa report-unequal"
            data-tip="Your report does not match the consensus outcome"
          >
							&#xf057;
						</span>
					}
          <ReportEthics isUnethical={p.isUnethical} />
        </span>
      </div>
      <div className="portfolio-pair">
        <span className="report-main-group-title">cycle: </span>
        <span className="report-main-group-title-outcome">
          {p.period ?
            <span
              data-tip={`${p.branch.currentPeriod - p.period} reporting cycles ago`}
            >
              {p.period}
            </span> :
            <EmDash />
					}
        </span>
      </div>
    </div>
    <div className="portfolio-group">
      {/*
			<div className="portfolio-pair">
				<span className="title">fees gain/loss</span>
				<ValueDenomination
					className="colorize"
					{...p.feesEarned}
				/>
			</div>
			*/}
      <div className="portfolio-pair">
        <span className="title">rep gain/loss</span>
        <ValueDenomination
          className="colorize"
          {...p.repEarned}
        />
      </div>
      <div className="portfolio-pair">
        <span className="title">ended</span>
        {p.endDate ?
          <ValueDate {...p.endDate} /> :
          <EmDash />
				}
      </div>
    </div>
    <ReactTooltip type="light" effect="solid" place="top" />
  </div>
);

// TODO -- Prop Validations
// Report.propTypes = {
// 	outcome: PropTypes.string,
// 	reported: PropTypes.string,
// 	isReportEqual: PropTypes.bool.isRequired,
// 	feesEarned: PropTypes.object.isRequired,
// 	repEarned: PropTypes.object.isRequired,
// 	endDate: PropTypes.object.isRequired
// };

export default Report;
