import js from '@eslint/js';
export default [{ ignores: ['uploads'] }, { files: ['**/*.js'], languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: { process: 'readonly', console: 'readonly', Buffer: 'readonly' } }, rules: { ...js.configs.recommended.rules, 'no-unused-vars': ['error', { argsIgnorePattern: '^_' }] } }];
