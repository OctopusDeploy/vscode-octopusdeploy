//@ts-check
'use strict';

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

const path = require('path');
const webpack = require('webpack');

/** @type WebpackConfig */
const webExtensionClientConfig = {
	mode: 'none',
	target: 'webworker',
	entry: {
		extension: './src/client/extension.ts'
	},
	output: {
		filename: '[name].js',
		path: path.join(__dirname, 'dist', 'client'),
		libraryTarget: 'commonjs'
	},
	resolve: {
		alias: {},
		extensions: ['.ts', '.js'],
		fallback: { path: require.resolve('path-browserify') },
		mainFields: ['module', 'main']
	},
	module: {
		rules: [{
			test: /\.ts$/,
			exclude: /node_modules/,
			use: [{
				loader: 'ts-loader'
			}]
		}]
	},
	plugins: [
		new webpack.ProvidePlugin({
			process: 'process/browser', // provide a shim for the global `process` variable
		}),
	],
	externals: {
		'vscode': 'commonjs vscode', // ignored because it doesn't exist
	},
	performance: {
		hints: false
	},
	devtool: 'nosources-source-map' // create a source map that points to the original source file
};

const webExtensionServerConfig = /** @type WebpackConfig */ {
	mode: 'none',
	target: 'webworker',
	entry: {
		browserServerMain: './src/server/main.ts',
	},
	output: {
		filename: '[name].js',
		library: 'serverExportVar',
		libraryTarget: 'var',
		path: path.join(__dirname, 'dist', 'server')
	},
	resolve: {
		alias: {},
		extensions: ['.ts', '.js'], // support ts-files and js-files
		fallback: {
			//path: require.resolve("path-browserify")
		},
		mainFields: ['module', 'main'],
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'ts-loader',
					},
				],
			},
		],
	},
	externals: {
		vscode: 'commonjs vscode', // ignored because it doesn't exist
	},
	performance: {
		hints: false,
	},
	devtool: 'source-map',
};

module.exports = [ webExtensionClientConfig, webExtensionServerConfig ];