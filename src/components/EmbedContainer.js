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
			isEditing: false
		}
	}

	componentDidMount() {
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
		const { equation, isEditing } = this.state
    return (
      <div className="embed-container flex flex-column">
				<div className="mb3 flex justify-end">
					<button
						className="clickable sans mr2"
						onClick={() => this.setState({ isEditing: !isEditing })}
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
					<KatexRenderer
						className="flex-auto flex justify-center items-center f3"
						text={equation}
					/>
				</div>
      </div>
    )
  }
}

export default EmbedContainer
