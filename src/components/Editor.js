import { h, render, Component } from 'preact';
import cx from 'classnames'
import { updateEquationQueryParam, getCursorPosition, getTextWidth, addPoints, GlobalClickListener } from '../utilities.js'
import AutocompleteDropdown from './AutocompleteDropdown.js'
import './Editor.scss'

class Editor extends Component {
	constructor() {
		super()
		this.state = {
			dropdownPosition: null,
			dropdownSearch: null
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

	openDropdown(text, cursorIndex, containerPosition) {
		this.setState({
    	dropdownPosition: this.getDropdownPosition(
				getCursorPosition(text, cursorIndex),
				containerPosition
			),
			dropdownSearch: ''
		})
	}

	updateDropdownSearch(text, cursorPosition) {
		// find the first unescaped \ to the left
		let editedCommand;
		for (var i = cursorPosition; i > 0; i--) {
			editedCommand = text.slice(i, cursorPosition)
			if (editedCommand.match(/\[^\]*/)) { // Likely very insufficent for latex grammar.
				break;
			}
		}

		this.setState({
			dropdownSearch: editedCommand
		})
	}

	closeDropdown() {
		this.setState({
    	dropdownPosition: null,
			dropdownSearch: null
		})
	}

	render() {
		const { className, equation, onChange } = this.props
		const { dropdownPosition, dropdownSearch } = this.state

		return [
			<textarea
				className={cx("editor mono", className)}
				value={equation}
				ref={el => this._textareaEl = el}
				onKeyUp={(e) => {
					/*
						I really want:
							while open and there is a change, is the cursor on the command?
							if not close
							also:
								close on escape
								close on outside click

						trigger for opening is the back slash

					*/

					if (e.keyCode === 220) { // Backslash, aka tex command signifier
						this.openDropdown(equation, e.target.selectionEnd, e.target.getBoundingClientRect())
					} else if (e.keyCode === 27 /* esc */ || e.keyCode === 32 /* space */) {
						this.closeDropdown()
					}
				}}
				onInput={(e) => {
					const value = e.target.value
					if (this.isDropdownOpen()) {
						this.updateDropdownSearch(value, e.selectionEnd)
					}
         	onChange(value)
				}}
			/>,
			this.isDropdownOpen() ? <AutocompleteDropdown {...dropdownPosition} search={dropdownSearch} /> : null
		]
	}
}

export default Editor
