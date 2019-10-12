import { h, render, Component } from 'preact';

class Equation extends Component {
	setRef(dom) { this.ref = dom; }

	componentWillReceiveProps({ equation }) {
		this.renderKatex(equation)
	}

	renderKatex(equation) {
		katex.render(equation, this.ref, {
    	throwOnError: false
		})
	}

	render() {
		return <div ref={(dom) => this.setRef(dom)} />
	}
}


class Editor extends Component {
	constructor() {
		super()
		this.state = {
			equation: ''
		}
	}

	componentDidMount() {
		let queryParams = decodeURI(window.location.search)
		if (!queryParams) return;

		queryParams = queryParams.slice(1) // remove the ?
		const equationParam = queryParams.split('&').find((param) => param.match(/^equation=/))
		if (equationParam) this.setState({ equation: equationParam.replace(/^equation=/, '') })
	}

	updateUrl(equation) {
		history.replaceState(null, null, `${window.location.pathname}?equation=${encodeURI(equation)}`)
	}

  render() {
		const { equation } = this.state
    return (
      <div className="editor">
				<textarea
					value={equation}
					onInput={(e) => {
						const value = e.target.value
						this.setState({ equation: value }, () => {
							this.updateUrl(value)
						})
					}}
				/>
				<Equation equation={equation} />
      </div>
    )
  }
}


render((
    <div id="foo">
				<Editor/>
    </div>
), document.body);
