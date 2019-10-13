import { h, render, Component } from 'preact';
import './AutocompleteDropdown.scss'
import { LATEX_COMMANDS } from '../constants/commands.js'
import KatexRenderer from './KatexRenderer.js'

const ArgPlaceholder = ({ children }) => <span className="gray">{children}</span>

class CommandOption extends Component {
	commandDisplay(command, args, infix) {
		if (infix) {
			const [before, after] = args
			return (
				<span>
					{'{'}
						<ArgPlaceholder>{before}</ArgPlaceholder>
						{' '}{command}{' '}
						<ArgPlaceholder>{after}</ArgPlaceholder>
					{'}'}
				</span>
			)
		} else if (args) {
			return (
				<span>
					{command}
					{'{'}
					<ArgPlaceholder>
						{args.join(', ')}
					</ArgPlaceholder>
					{'}'}
				</span>
			)
		} else {
    	return command
		}
	}

	getInsertionText(command, args, infix) {
		if (infix) {
			return `{ ${command} }`
		} else if (args) {
			return `${command}{${args.map(() => '').join(', ')}}`
		} else {
    	return command
		}
	}

	render() {
		const { command, example, args, infix = false, onClick } = this.props
		return (
			<div
				key={command}
				className="command-option clickable flex justify-between"
				onClick={(e) => {
					onClick(this.getInsertionText(command, args, infix))
          e.stopPropagation()
				}}>
				{this.commandDisplay(command, args, infix)}
				<KatexRenderer
					displayError={false}
					text={example ? example : command}
				/>
			</div>
		)
	}
}

class AutocompleteDropdown extends Component {
	/*
		onClose
		onSelect

		todo:
			[x] on \ open the dropdown
			[x] on space close the dropdown
			[x] escape to close
			[ ] filtering
			[ ] clean up styles
			[ ] click to close and insert

			[ ] arrows for up down
			[ ] hold arrow to scroll - loop the scroll at the bottom
			[ ] enter to select item
	*/


	shouldComponentUpdate({ search }) {
		return this.props.search !== search
	}

	render() {
		const { x, y, onSelect } = this.props
		return (
			<div className="autocomplete-dropdown absolute f7" style={`left: ${x}px; top: ${y}px`}>
				{
					LATEX_COMMANDS.map((commandOption) => {
           	return (
							<CommandOption
								{...commandOption}
								onClick={onSelect}
							/>
						)
					})
				}
			</div>
		)
	}
}

export default AutocompleteDropdown
