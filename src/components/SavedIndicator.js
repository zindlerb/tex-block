import cx from 'classnames'
import { h, render, Component } from 'preact';
import './SavedIndicator.scss'

class SavedIndicator extends Component {
  render() {
    const { className, equation, equationOnPageLoad } = this.props
    const hasChanged = (equation !== equationOnPageLoad)
    let text = hasChanged ? <span className="error">Not Saved</span> : 'Saved'

    return (
      <div className={cx('saved-indicator flex items-center c-help', className)}>
        {text}
        <div className="tooltip">
          Because TeX Block is embedded in an iframe it can{"'"}t update the url where it stores its equation.
          If you are using a document editor like Notion, you will need to copy the link and re-add it to the page.
        </div>
      </div>
    )
  }
}

export default SavedIndicator
