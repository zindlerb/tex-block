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
			equation: 'x*2 + 6 = 20',
			isEditing: false,
			showButtons: true
		}
		this._buttonTimeoutId = null
	}

	componentDidMount() {
		this.displayButtons({ fadeOut: true, timeoutLength: 3500 })
		this.syncEquationStateAndQueryParams()
	}

	displayButtons = ({ fadeOut, timeoutLength = 1300 }) => {
		const { isEditing, showButtons } = this.state

		if (isEditing) return;
		if (!showButtons) this.setState({ showButtons: true })

		if (this._buttonTimeoutId) {
			clearTimeout(this._buttonTimeoutId)
			this._buttonTimeoutId = null
		}

		if (fadeOut) {
			this._buttonTimeoutId = this.setFadeTimeout(timeoutLength)
		}
	}

	setFadeTimeout = (timeoutLength) => {
		return setTimeout(() => {
			this.setState({ showButtons: false })
		}, timeoutLength)
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
		const { equation, isEditing, showButtons } = this.state
    return (
      <div
				className="embed-container flex flex-column"
				onMouseMove={() => !isEditing && this.displayButtons({ fadeOut: true })}>
				<div
					className={cx('button-container mb3 flex justify-end', { hidden: !isEditing && !showButtons })}
					onMouseEnter={() => !isEditing && this.displayButtons({ fadeOut: false })}
					onMouseMove={(e) => e.stopPropagation()}
				>
					<button
						className="clickable sans mr2"
						onClick={() => {
             	this.setState({ isEditing: !isEditing })
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
