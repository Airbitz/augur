import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import shouldComponentUpdatePure from '../../../utils/should-component-update-pure';

export default class Input extends Component {
	static propTypes = {
		type: PropTypes.string,
		className: PropTypes.string,
		value: PropTypes.any,
		isMultiline: PropTypes.bool,
		isClearable: PropTypes.bool,
		debounceMS: PropTypes.number,
		onChange: PropTypes.func
	};

	constructor(props) {
		super(props);
		this.state = {
			value: this.props.value || '',
			timeoutID: ''
		};
		this.shouldComponentUpdate = shouldComponentUpdatePure;
		this.componentWillReceiveProps = (nextProps) => {
			if ((nextProps.value || nextProps.value === 0) && nextProps.value !== this.state.value && nextProps.value !== this.props.value) {
				this.setState({ value: nextProps.value });
			}
		};
		this.handleOnChange = this.handleOnChange.bind(this);
		this.handleOnBlur = this.handleOnChange.bind(this);
		this.handleClear = this.handleClear.bind(this);
		this.sendValue = this.sendValue.bind(this);
	}

	handleOnChange = (e) => {
		const newValue = e.target.value;
		if (this.props.debounceMS !== 0) {
			clearTimeout(this.state.timeoutID);
			this.setState({ timeoutID: setTimeout(() => this.sendValue(newValue), this.props.debounceMS || 750) });
		} else {
			this.sendValue(newValue);
		}
		this.setState({ value: newValue });
	}

	handleOnBlur = () => {
		if (this.props.debounceMS !== 0) {
			clearTimeout(this.state.timeoutID);
			this.sendValue(this.state.value);
		}
	}

	handleClear = () => {
		this.setState({ value: '' });
		this.sendValue('');
	}

	sendValue = (value) => {
		this.props.onChange(value);
	}

	render() {
		const p = this.props;
		const s = this.state;

		return (
			<div className={classnames('input', { clearable: p.isClearable !== false }, this.props.className)}>
				{!p.isMultiline &&
					<input
						{...p}
						className="box"
						value={s.value}
						onChange={this.handleOnChange}
						onBlur={this.handleOnBlur}
					/>
				}

				{p.isMultiline &&
					<textarea
						{...p}
						className="box"
						value={s.value}
						onChange={this.handleOnChange}
						onBlur={this.handleOnBlur}
					/>
				}

				{!p.isMultiline && p.isClearable !== false &&
					<button className="clear" onClick={this.handleClear}>
						&#xf00d;
					</button>
				}
			</div>
		);
	}
}
