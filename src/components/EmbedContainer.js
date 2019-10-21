import debounce from 'lodash.debounce';
import { h, render, Component } from 'preact';
import cx from 'classnames';
import CopyButton from './CopyButton.js'
import KatexRenderer from './KatexRenderer.js'
import Editor from './Editor.js'
import SavedIndicator from './SavedIndicator.js'
import {
  updateEquationQueryParam, getCopySnippet, getEmbedSnippet, getBrowserUrl
} from '../utilities.js'
import './EmbedContainer.scss'

class EmbedContainer extends Component {
  constructor() {
    super()
    this.state = {
      equation: 'x*2 + 8 = 20',
      isEditing: false,
      buttonsShownTimestamp: new Date(),
      equationOnPageLoad: null,
      notionStyles: !!getBrowserUrl().match(/notion/) || getBrowserUrl() === ''
    }
    this._buttonHideIntervalId = null
  }

  componentDidMount() {
    this._buttonHideIntervalId = setInterval(() => {
      const { isEditing, buttonsShownTimestamp } = this.state
      if (isEditing || !buttonsShownTimestamp) return;
      const millisSinceButtonsShown = (new Date() - buttonsShownTimestamp)
      if (millisSinceButtonsShown > 3500) this.setState({ buttonsShownTimestamp: null })
    }, 1000/10)

    this.syncEquationStateAndQueryParams()
  }

  componentWillUnmount() {
    clearInterval(this._buttonHideIntervalId)
  }

  syncEquationStateAndQueryParams() {
    const path = window.location.pathname
    const equationMatch = path.match(/\embed\/(.*)/)
    if (equationMatch) {
      const urlEquation = decodeURIComponent(equationMatch[1])
      this.setState({
        equation: urlEquation,
        equationOnPageLoad: urlEquation
      })
    } else {
      updateEquationQueryParam(this.state.equation)
      this.setState({ equationOnPageLoad: this.state.equation })
    }
  }

  isEmbedded() {
    return location.host !== 'texblocks' || !location.pathname.math(/^\/embed/)
  }

  render() {
    const { equation, isEditing, buttonsShownTimestamp, equationOnPageLoad, notionStyles, lockButtonDisplay } = this.state
    const shouldShowButtons = buttonsShownTimestamp

    return (
      <div
        className={cx("embed-container flex flex-column", { notion: notionStyles })}
        onMouseMove={() => !shouldShowButtons && this.setState({ buttonsShownTimestamp: new Date() })}>
        <div
          className={cx("button-container flex items-center justify-between", { hidden: !shouldShowButtons && !lockButtonDisplay })}
          onMouseEnter={() => this.setState({ lockButtonDisplay: true })}
          onMouseLeave={() => this.setState({ lockButtonDisplay: false })}
        >
          <div className="flex items-center">
           <span className="dib mr2">Copy:</span>
          <CopyButton
            className="clickable sans mr2"
            copyableText={getCopySnippet()}>
            Link
          </CopyButton>
           <CopyButton
            className="clickable sans"
            copyableText={getEmbedSnippet()}>
            Iframe
          </CopyButton>
          </div>
          <div className="flex items-center">
           {this.isEmbedded() && <SavedIndicator className="mr2" equationOnPageLoad={equationOnPageLoad} equation={equation}/>}
           <button
            className="clickable sans"
            onClick={() => {
              this.setState({
                isEditing: !isEditing,
                buttonsShownTimestamp: new Date() // Reset timestamp so buttons don't fade after editing.
              })
            }}
          >
            {isEditing ? 'Done' : 'Edit'}
          </button>
          </div>
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
          <div className={cx('flex-auto relative')}>
            <KatexRenderer
              className="abs-center f3 w-100 tc"
              text={equation}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default EmbedContainer
