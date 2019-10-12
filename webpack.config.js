const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    homepage: './src/homepage.js',
    editor: './src/editor.js'
  },
  module: {
    rules: [
      {
			  test: /\.js$/,
			  use: [
				  {
					  loader: 'babel-loader',
					  query: {
						  presets: [
	              "@babel/preset-env"
						  ],
						  plugins: [
	              ["@babel/plugin-transform-react-jsx", { "pragma":"h" }]
						  ],
					  },
				  },
			  ],
	    }
    ]
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'public'),
  },
};
