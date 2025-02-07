/* eslint-disable no-undef */

const devCerts = require("office-addin-dev-certs");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const CustomFunctionsMetadataPlugin = require("custom-functions-metadata-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

const urlDev = "https://localhost:3000/";
const urlProd = "https://www.contoso.com/"; // Used to update the manifest with the production URL.

async function getHttpsOptions() {
  const httpsOptions = await devCerts.getHttpsServerOptions();
  return { ca: httpsOptions.ca, key: httpsOptions.key, cert: httpsOptions.cert };
}

module.exports = async (env, options) => {
  const dev = options.mode === "development";
  const config = {
    devtool: "source-map",
    target: 'web', // Add this line for HMR
    entry: {
      vendor: ["react", "react-dom"],
      taskpane: ["./src/taskpane/index.jsx", "./src/taskpane/home.html"],
      functions: "./src/functions/functions.js",
      auth: "./src/taskpane/auth.html",  // Add auth entry point
    },
    output: {
      clean: true,
    },
    resolve: {
      extensions: [".js", ".jsx", ".html"],
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          use: {
            loader: "babel-loader",
          },
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
                importLoaders: 1
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: true
              }
            }
          ]
        },
        {
          test: /\.html$/,
          exclude: /node_modules/,
          use: "html-loader",
        },
        {
          test: /\.(png|jpg|jpeg|ttf|woff|woff2|gif|ico)$/,
          type: "asset/resource",
          generator: {
            filename: "images/[name][ext][query]",
          },
        },
        {
          test: /\.py$/,
          type: 'asset/source'
        }
      ],
    },
    plugins: [
      new MonacoWebpackPlugin({
        languages: ['python']
      }),
      new CustomFunctionsMetadataPlugin({
        output: "functions.json",
        input: "./src/functions/functions.js",
      }),
      new HtmlWebpackPlugin({
        filename: "home.html",
        template: "./src/taskpane/home.html",
        chunks: ["vendor", "functions", "taskpane"],
      }),
      new HtmlWebpackPlugin({
        filename: "auth.html",
        template: "./src/taskpane/auth.html",
        chunks: ["auth"],
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "images/*",
            to: "images/[name][ext][query]",
          },
          {
            from: "manifest*.xml",
            to: "[name]" + "[ext]",
            transform(content) {
              if (dev) {
                return content;
              } else {
                return content.toString().replace(new RegExp(urlDev, "g"), urlProd);
              }
            },
          },
        ],
      }),
    ],
    devServer: {
      hot: true,
      liveReload: true,
      watchFiles: ["./src/**/*"], // Add this line
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      server: {
        type: "https",
        options: env.WEBPACK_BUILD || options.https !== undefined ? options.https : await getHttpsOptions(),
      },
      port: process.env.npm_package_config_dev_server_port || 3000,
    },
  };

  return config;
};
