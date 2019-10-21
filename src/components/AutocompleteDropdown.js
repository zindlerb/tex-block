import cx from 'classnames'
import { h, render, Component } from 'preact';
import clamp from 'lodash.clamp';
import debounce from 'lodash.debounce';
import Fuse from 'fuse.js'
import { LATEX_COMMANDS } from '../constants/commands.js'
import memoize from 'lodash.memoize'
import KatexRenderer from './KatexRenderer.js'
import './AutocompleteDropdown.scss'

const filterCommands = memoize((search) => {
  if (search === '') {
    return LATEX_COMMANDS
  } else {
    return new Fuse(LATEX_COMMANDS, { keys: ['command'] }).search(search)
  }
})

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
  constructor(props) {
    super(props)
		const DROPDOWN_BOTTOM_MARGIN = 10
    this.state = {
      scrollTop: 0,
      selectedIndex: null,
			dropdownHeight: Math.min(300, window.innerHeight - this.props.y - DROPDOWN_BOTTOM_MARGIN),
    }
  }

  componentWillReceiveProps(newProps) {
    if (newProps.search !== this.props.search) {
      this.setState({
        selectedIndex: null
      })
    }
  }

  scrollToCommand(commandIndex, position) {
    if (position === 'top') {
      this._scrollContainer.scrollTo(0, LIST_ITEM_HEIGHT * commandIndex)
    } else if (position === 'bottom') {
      const commandsInViewport = SCROLL_VIEWPORT_HEIGHT / LIST_ITEM_HEIGHT
      this._scrollContainer.scrollTo(0, LIST_ITEM_HEIGHT * ((commandIndex + 1) - commandsInViewport))
    }
  }

  highlightCommand(index) {
    const { scrollTop } = this.state
    const commandsInView = {
      startInd: Math.round(scrollTop / LIST_ITEM_HEIGHT),
      endInd: Math.round(scrollTop / LIST_ITEM_HEIGHT) + (SCROLL_VIEWPORT_HEIGHT/LIST_ITEM_HEIGHT)
    }

    this.setState({
      selectedIndex: index
    })

    if (index <= commandsInView.startInd ) {
      this.scrollToCommand(index, 'top')
    } else if (index >= commandsInView.endInd) {
      this.scrollToCommand(index, 'bottom')
    }
  }

  onGlobalKeyDown = (e) => {
    if (e.keyCode === 38) { // up arrow
      const { selectedIndex } = this.state
      if (selectedIndex === null) {
        this.highlightCommand(this.filterCommands().length - 1)
      } else if ((selectedIndex - 1) < 0) {
        this.highlightCommand(this.filterCommands().length - 1)
      } else {
        this.highlightCommand(selectedIndex - 1)
      }
    } else if (e.keyCode === 40) { // down arrow
      const { selectedIndex } = this.state
      if (selectedIndex === null) {
        this.highlightCommand(0)
      } else if ((selectedIndex + 1) > this.filterCommands().length) {
        this.highlightCommand(0)
      } else {
        this.highlightCommand(selectedIndex + 1)
      }
    }
  }

  onGlobalKeyUp = (e) => {
    if (e.keyCode === 13) { // Enter Key
      this.props.onSelect(this.filterCommands()[this.state.selectedIndex].command)
    }
  }

  componentDidMount() {
    window.addEventListener('keydown', this.onGlobalKeyDown)
    window.addEventListener('keyup', this.onGlobalKeyUp)

  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onGlobalKeyDown)
    window.removeEventListener('keyup', this.onGlobalKeyUp)
  }

  filterCommands() {
    const { search } = this.props
    return filterCommands(search)
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
    const { scrollTop, selectedIndex, dropdownHeight } = this.state

    const filteredCommands = this.filterCommands()
    const [paginationStartInd, paginationEndInd] = this.paginationIndices(filteredCommands)

    return (
      <div
        className="autocomplete-dropdown absolute f7"
        style={`left: ${x}px; top: ${y}px; height: ${dropdownHeight}px;`}
        ref={(el) => this._scrollContainer = el}
        onScroll={(e) => {
          this.setScrollTop(e.target.scrollTop)
        }}
      >
        {
          filteredCommands.map((commandOption, ind) => {
            return (
              <div
                key={commandOption.command}
                className={cx("command-option", { highlighted: ind === selectedIndex })}
                style={`height: ${LIST_ITEM_HEIGHT}px;`}>
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
