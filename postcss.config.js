module.exports = ({env}) => {
  const isProd = (env === 'production');
  const plugins = {
    'postcss-easy-import': {},
    'postcss-functions': {
      functions: require('./src/styles/functions.js')
    },
    'postcss-mixins': {},
    'postcss-for': {},
    'postcss-nested': {},
    'postcss-modules-extend-rule/pre': {
      onFunctionalSelector: 'warn'
    },
    'postcss-custom-media': {},
    'postcss-color-function': {},
    'postcss-flexbugs-fixes': {},
    'postcss-gradient-transparency-fix': {},
    'postcss-100vh-fix': {},
    'postcss-momentum-scrolling': ['scroll'],
    'postcss-strip-inline-comments': {},
  }
  if (isProd) {
    plugins['postcss-preset-env'] = {};
  }
  return {plugins}
}
