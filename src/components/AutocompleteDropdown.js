import { h, render, Component } from 'preact';
import clamp from 'lodash.clamp';
import debounce from 'lodash.debounce';
import Fuse from 'fuse.js'
import { LATEX_COMMANDS } from '../constants/commands.js'
import KatexRenderer from './KatexRenderer.js'
import './AutocompleteDropdown.scss'

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
		const { command, example, args, infix = false, onSelect } = this.props
		return (
			<div
				key={command}
				className="flex justify-between items-center h-100"
				onClick={(e) => {
					onSelect(this.getInsertionText(command, args, infix))
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

const LIST_ITEM_HEIGHT = 30
const SCROLL_VIEWPORT_HEIGHT = 300;

class AutocompleteDropdown extends Component {
	constructor() {
  	super()
		this.state = {
    	scrollTop: 0
		}
	}

	filterCommands(commands, search) {
		if (search === '') {
			return commands
		} else {
			return new Fuse(commands, { keys: ['command'] }).search(search)
		}
	}

	paginationIndices(commands) {
		const startInd = Math.floor(this.state.scrollTop / LIST_ITEM_HEIGHT)
		const endInd = Math.ceil(startInd + (SCROLL_VIEWPORT_HEIGHT / LIST_ITEM_HEIGHT))
		const padding = 3

		return [
			clamp(startInd - padding, 0, commands.length),
			clamp(endInd + padding, 0, commands.length)
		]
	}

	setScrollTop = (scrollTop) => this.setState({ scrollTop })

	render() {
		const { x, y, onSelect, search } = this.props
		const { scrollTop } = this.state
		const filteredCommands = this.filterCommands(LATEX_COMMANDS, search)
		const [paginationStartInd, paginationEndInd] = this.paginationIndices(filteredCommands)

		return (
			<div
				className="autocomplete-dropdown absolute f7"
				style={`left: ${x}px; top: ${y}px;`}
				onScroll={(e) => {
					this.setScrollTop(e.target.scrollTop)
				}}
			>
				{
					filteredCommands.map((commandOption, ind) => {
       	   	return (
							<div className="command-option clickable" style={`height: ${LIST_ITEM_HEIGHT}px;`}>
								{
									(ind >= paginationStartInd && ind <= paginationEndInd) && (
										<CommandOption
											{...commandOption}
											onSelect={onSelect}
										/>
									)
								}
							</div>
						)
					})
				}
			</div>
		)
	}
}

export default AutocompleteDropdown
