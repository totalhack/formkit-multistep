module.exports = {
  plugins: {
    tailwindcss: {},
    'postcss-preset-env': {
      // ~module support
      browsers: [
        'Chrome >= 61',
        'Safari >= 10.1',
        "iOS >= 10.3",
        "Firefox >= 60",
        "Edge >= 16",
        "Opera >= 48"
      ]
    }
  }
}
