import React, { PropTypes, Component } from 'react';
import classnames from 'classnames';
import SiteHeader from '../../site/components/site-header';
import SiteFooter from '../../site/components/site-footer';
import Link from '../../link/components/link';
import Input from '../../common/components/input';

export default class AccountPage extends Component {
	static propTypes = {
		account: PropTypes.object,
		siteHeader: PropTypes.object
	};

	constructor(props) {
		super(props);
		this.state = {
			name: this.props.account.name,
			editName: false,
			showFullID: false,
			msg: ''
		};
	}

	render() {
		const p = this.props;
		const s = this.state;

		return (
			<main className="page account">
				<SiteHeader {...p.siteHeader} />
				<header className="page-header">
					<span className="big-line">My Account</span>
					<Link className="button sign-out" {...p.siteHeader.authLink}>
						Sign Out
					</Link>
				</header>

				<section className="page-content">
					<div className="l-container">
						<div className="account-section">
							<h2 className="heading">Credentials</h2>
							<table className="account-info">
								<tbody>
									<tr className={classnames('account-info-item', { displayNone: p.account.localNode })}>
										<th className="title">Account Name:</th>
										<td className="item">
											{s.editName &&
												<Input
													type="text"
													value={p.account.name}
													isClearable={false}
													onChange={(value) => this.setState({ name: value })}
												/>
											}
											{!s.editName &&
												<span title="Click here to add a name to your account.">
													{p.account.name || 'Click here to add a name.'}
												</span>
											}
											{!s.editName &&
												<button
													className="link" onClick={() => this.setState({ editName: true })}
													title="Click here to change your Account Name"
												>
													(change name)
												</button>
											}
											{s.editName &&
												<button
													className="button"
													onClick={() => this.setState({ name: '', editName: false })}
													title="Cancel without saving new name"
												>
													cancel
												</button>
											}
											{s.editName &&
												<button
													className="button make"
													onClick={() => {
														p.account.editName(s.name);
														this.setState({ name: '', editName: false });
													}}
													title="Save new account name"
												>
													save change
												</button>
											}
										</td>
									</tr>

									<tr className="account-info-item">
										<th className="title">Account Address:</th>
										<td className="item">
											<span>
												{p.account.address}
											</span>
										</td>
									</tr>

									<tr className={classnames('account-info-item', { displayNone: p.account.localNode })}>
										<th className="title">Secure Login ID:</th>
										<td className="item">
											{!s.showFullID &&
												<span>
													{p.account.prettySecureLoginID}
												</span>
											}
											{s.showFullID &&
												<textarea className="full-secure-login-id" value={p.account.secureLoginID} readOnly />
											}
											<button
												className="link"
												title={s.showFullID ? 'Hide full id' : 'Show full id'}
												onClick={() => {
													const showHide = !s.showFullID;
													this.setState({ showFullID: showHide });
												}}
											>
												{s.showFullID ? '(hide id)' : '(show full id)'}
											</button>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
						<div className={classnames('account-section', { displayNone: p.account.localNode })}>
							<div className="account-info-item">
								<h2 className="heading">Download Account</h2>
								<p>
									Download your account data. You should always save a backup of your account data somewhere safe! (Note: running a local Ethereum node? If you download your account data to your keystore folder, you can use your Augur account on your local node.)
								</p>
								<a
									className="button download-account"
									href={p.account.dataString}
									download={p.account.downloadFileName}
									title="Click here to Download your Account."
								>
									Download Account
								</a>
							</div>
						</div>
					</div>
				</section>
				<SiteFooter />
			</main>
		);
	}
}
