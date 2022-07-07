module.exports = {
  'env': {
    'browser': true,
    'commonjs': true,
    'es6': true,
    'node': true,
    'shared-node-browser': true,
  },
  'extends': 'eslint:recommended',
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly'
  },
  'parser': 'babel-eslint',
  'parserOptions': {
    'ecmaVersion': 2018,
    'sourceType': 'module'
  },
  'rules': {
    'no-unused-vars': 2,
    'semi': [2, 'never'],
    'quotes': [2, 'single'],
    'no-dupe-keys': 2,
    'no-duplicate-case': 2,
    'getter-return': 2,
    'no-setter-return': 2,
    'no-sparse-arrays': 2,
    'eqeqeq': 2,
    'no-constructor-return': 2,
    'no-floating-decimal': 2,
    'no-octal': 2,
    'no-undef': 2,
  }
}