import { h, render, Component } from 'preact';
import cx from 'classnames'
import {
	updateEquationQueryParam, getCursorPosition, getTextWidth,
	addPoints, GlobalClickListener, stringSplice
} from '../utilities.js'
import AutocompleteDropdown from './AutocompleteDropdown.js'
import './Editor.scss'

class Editor extends Component {
	constructor() {
		super()
		this.state = {
			dropdownPosition: null,
			dropdownCommandStart: null
		}
	}

	componentDidMount() {
		this._globalClickListener = new GlobalClickListener({
			onClick: () => {
        if (this.isDropdownOpen()) this.closeDropdown()
			}
		})
		this._globalClickListener.add()
	}

	componentWillUnmount() {
		this._globalClickListener.remove()
	}

	isDropdownOpen() {
  	return !!this.state.dropdownPosition
	}

	getDropdownPosition(cursorPosition, containerPosition) {
		const VERTICAL_PADDING = 5
		const styles = getComputedStyle(this._textareaEl)
		const lineHeightPxFloat = parseFloat(styles['line-height'].replace(/px$/, ''))
		const paddingTopPxFloat = parseFloat(styles['paddingTop'].replace(/px$/, ''))
		const paddingLeftPxFloat = parseFloat(styles['paddingLeft'].replace(/px$/, ''))
		const lineWidth = getTextWidth(
			'0'.repeat(cursorPosition.offset), // this only works because font is monospace
			styles['font-size'],
			styles['font-family']
		)

		return addPoints(containerPosition, {
			x: paddingLeftPxFloat + lineWidth,
			y: VERTICAL_PADDING + paddingTopPxFloat + ((cursorPosition.line + 1) * lineHeightPxFloat)
		})
	}

	dropdownCommandEnd(equation, dropdownCommandStart) {
		return dropdownCommandStart + this.dropdownCommandString(equation, dropdownCommandStart).length
	}

	dropdownCommandString(equation, dropdownCommandStart) {
		const commandMatch = equation.slice(dropdownCommandStart).match(/\\\w*/)
		return commandMatch ? commandMatch[0] : ''
	}

	openDropdown({
  	text,
		cursorIndex,
		containerPosition
	}) {
		let dropdownCommandStart;
		for (let i = cursorIndex; i > 0; i--) {
			dropdownCommandStart = i
			if (text[i] === '\\') { // Likely very insufficent for tex grammar.
				break;
			}
		}

		this.setState({
    	dropdownPosition: this.getDropdownPosition(
				getCursorPosition(text, cursorIndex),
				containerPosition
			),
			dropdownCommandStart
		})
	}

	closeDropdown() {
		this.setState({
			dropdownCommandStart: null,
    	dropdownPosition: null,
		})
	}

	currentCursorIndex() {
		return this._textareaEl.selectionEnd
	}

	render() {
		const { className, equation, setEquation } = this.props
		const {
			dropdownPosition,
			dropdownCommandStart,
		} = this.state

		return [
			<textarea
				className={cx("editor mono", className)}
				value={equation}
				ref={el => this._textareaEl = el}
				onKeyUp={(e) => {
					if (e.keyCode === 220) { // Backslash, aka tex command signifier
						this.openDropdown({
							text: equation,
							cursorIndex: this.currentCursorIndex(),
							containerPosition: e.target.getBoundingClientRect(),
						})
					} else if (
						this.isDropdownOpen() && (
							e.keyCode === 27 /* esc */ ||
							e.keyCode === 32 /* space */ ||
							this.currentCursorIndex() <= dropdownCommandStart
						)
					) {
						this.closeDropdown()
					}
				}}
				onInput={(e) => {
					const value = e.target.value
         	setEquation(value)
				}}
			/>,
			this.isDropdownOpen() ? (
				<AutocompleteDropdown
					{...dropdownPosition}
					search={this.dropdownCommandString(equation, dropdownCommandStart)}
					onSelect={(insertionText) => {
						this.closeDropdown()

						// remove existing command
						let splicedEquation = (
							equation.slice(0, dropdownCommandStart) +
							equation.slice(this.dropdownCommandEnd(equation, dropdownCommandStart))
						)

						// insert new command
						setEquation(stringSplice(splicedEquation, dropdownCommandStart, insertionText))
					}}
				/>
			) : null
		]
	}
}

export default Editor
