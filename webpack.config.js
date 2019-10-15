const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    homepage: './src/homepage.js',
    embed: './src/embed.js'
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
	              ["@babel/plugin-transform-react-jsx", { "pragma":"h" }],
								"@babel/plugin-proposal-class-properties"
						  ],
					  },
				  },
			  ],
	    },
			{
				test: /\.s?css$/,
				use: [
					'style-loader',
					'css-loader',
					'sass-loader'
				],
			}
    ]
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'public'),
  },
};
