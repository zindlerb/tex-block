import debounce from 'lodash.debounce';
import { h, render, Component } from 'preact';
import cx from 'classnames';
import CopyButton from './CopyButton.js'
import KatexRenderer from './KatexRenderer.js'
import Editor from './Editor.js'
import { updateEquationQueryParam, getEmbedSnippet } from '../utilities.js'
import './EmbedContainer.scss'

class EmbedContainer extends Component {
	constructor() {
		super()
		this.state = {
			equation: 'x*2 + 8 = 20',
			isEditing: false,
			buttonsShownTimestamp: new Date()
		}
		this._buttonHideIntervalId = null
	}

	componentDidMount() {
		this._buttonHideIntervalId = setInterval(() => {
			const { isEditing, buttonsShownTimestamp } = this.state
			if (isEditing || !buttonsShownTimestamp) return;
			const millisSinceButtonsShown = (new Date() - buttonsShownTimestamp)
			if (millisSinceButtonsShown > 5000) this.setState({ buttonsShownTimestamp: null })
		}, 1000/10)

		this.syncEquationStateAndQueryParams()
	}

	componentWillUnmount() {
  	clearInterval(this._buttonHideIntervalId)
	}

	syncEquationStateAndQueryParams() {
		let queryParams = decodeURI(window.location.search)

		if (!queryParams) {
			updateEquationQueryParam(this.state.equation)
		} else {
			queryParams = queryParams.slice(1) // remove the ?
			const equationParam = queryParams.split('&').find((param) => param.match(/^equation=/))

			if (equationParam) {
				this.setState({ equation: equationParam.replace(/^equation=/, '') })
			} else {
				updateEquationQueryParam(this.state.equation)
			}
		}
	}

  render() {
		const { equation, isEditing, buttonsShownTimestamp } = this.state
		const shouldShowButtons = buttonsShownTimestamp
    return (
      <div
				className="embed-container flex flex-column"
				onMouseMove={() => !shouldShowButtons && this.setState({ buttonsShownTimestamp: new Date() })}>
				<div
					className={cx('button-container mb3 flex justify-end', { hidden: !shouldShowButtons })}
				>
					<button
						className="clickable sans mr2"
						onClick={() => {
             	this.setState({ isEditing: !isEditing, buttonsShownTimestamp: new Date() })
						}}
					>
						{isEditing ? 'Done' : 'Edit'}
					</button>
					<CopyButton
						className="clickable sans"
						copyableText={getEmbedSnippet(equation)}>
						Copy Embed
					</CopyButton>
				</div>
				<div className="flex flex-auto flex-column">
					<Editor
						className={cx({ 'is-editing': isEditing })}
						equation={equation}
						setEquation={(equation) => {
							this.setState({ equation }, () => {
								updateEquationQueryParam(equation)
							})
						}}
					/>
					<div className={cx('flex-auto', { relative: isEditing })}>
						<KatexRenderer
							className="abs-center f3"
							text={equation}
						/>
					</div>
				</div>
      </div>
    )
  }
}

export default EmbedContainer
