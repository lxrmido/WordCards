// http://eslint.org/docs/user-guide/configuring

module.exports = {
    root: true,
    'rules': {
        'arrow-parens': 0,
        'generator-star-spacing': 0,
        'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
        'indent': ['warn', 4, {"SwitchCase": 1}],
        'no-multiple-empty-lines': 'off',
        'semi': 'off',
        'no-console': 0
    },
}
