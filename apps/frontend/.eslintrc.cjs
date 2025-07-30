/** @type {import('@types/eslint').Linter.BaseConfig} */
module.exports = {
  root: true,
  // Base rules para Remix/React/Prettier
  extends: [
    "@remix-run/eslint-config",
    // Se não rodar código Node no frontend, pode remover a linha abaixo
    "@remix-run/eslint-config/node",
    "@remix-run/eslint-config/jest-testing-library",
    "plugin:react-hooks/recommended", // Garante uso correto dos hooks
    "plugin:jsx-a11y/recommended",    // Regras de acessibilidade JSX
    "prettier"
  ],
  plugins: [
    "react-hooks",
    "jsx-a11y"
  ],
  globals: {
    shopify: "readonly"
  },
  rules: {
    // Exemplos de customização (adicione conforme necessidade)
    // "react/prop-types": "off",
    // "jsx-a11y/no-autofocus": "off"
  }
};