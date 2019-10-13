import { h, Component } from 'preact';
import cx from 'classnames';
import escape from 'lodash.escape'
import './KatexRenderer.scss'

class KatexRenderer extends Component {
	setRef(dom) { this.ref = dom; }

	componentDidMount() {
		this.renderKatex(this.props.text)
	}

	componentWillReceiveProps({ text }) {
		this.renderKatex(text)
	}

	renderKatex(text) {
		const { displayError = true } = this.props

		try {
			katex.render(text, this.ref, { throwOnError: displayError })
		} catch (e) {
	    if (e instanceof katex.ParseError) {
				this.ref.innerHTML = `<span class="error f4">${escape(e.message.replace(/^KaTeX parse error: /, ''))}</span>`
	    } else {
	      throw e;
	    }
		}
	}

	render() {
		const { className } = this.props
		return (
			<div
				className={cx("katex-renderer dib", className)}
				ref={(dom) => this.setRef(dom)}
			/>
		)
	}
}

export default KatexRenderer
