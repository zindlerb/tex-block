import cx from 'classnames'
import { h, render, Component } from 'preact';
import Clipboard from 'clipboard'
import './CopyButton.scss'

class CopyButton extends Component {
	constructor(props) {
		super(props)
		this.state = {
			copyTimeoutId: null,
		}
	}

	componentDidMount() {
		new Clipboard(this._copyButtonEl)
	}

	componentWillUnmount() {
		clearTimeout(this.state.copyTimeoutId)
	}

	render() {
		const { copyableText, className, children } = this.props
		const { copyTimeoutId } = this.state

		return (
			<button
				className={cx('copy-button', className, { copying: copyTimeoutId })}
				ref={el => this._copyButtonEl = el}
				data-clipboard-text={copyableText}
				onClick={() => {
					this.setState({
						copyTimeoutId: setTimeout(() => {
							this.setState({ copyTimeoutId: null })
						}, 1000)
					})
				}}
			>
				<span className="text">{children}</span>
				<span className="copied-signifier">Copied</span>
			</button>
		)
	}
}

export default CopyButton
