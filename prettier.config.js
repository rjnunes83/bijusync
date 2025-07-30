/** @type {import('prettier').Config} */
module.exports = {
  semi: true,                 // Sempre usar ponto e vírgula no final de cada linha
  singleQuote: true,          // Preferir aspas simples
  printWidth: 100,            // Quebra de linha em 100 caracteres
  tabWidth: 2,                // Indentação de 2 espaços
  trailingComma: 'all',       // Vírgula no final de objetos/arrays/múltiplas linhas
  bracketSpacing: true,       // Espaço entre chaves { foo: bar }
  arrowParens: 'always',      // Sempre usar parênteses em arrow functions
  endOfLine: 'lf',            // Usar "lf" como quebra de linha (evita problemas no Git e CI/CD)
  jsxSingleQuote: false,      // Aspas duplas no JSX (padrão React)
  plugins: [],
};