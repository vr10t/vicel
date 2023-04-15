module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
    'prettier',
    "plugin:import/typescript", // this is needed because airbnb uses eslint-plugin-import
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  overrides: [
    {
      files: [
        "**/*.test.ts",
      ],
      env: {
        jest: true,
      },
    }
  ],

  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
      tsx:true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'react',
    '@typescript-eslint',
  ],
  settings: {
    "import/extensions": [".js", ".jsx", ".mjs", ".ts", ".tsx"],
    "import/resolver": {
      "typescript": {}
  },
    "react": {
      version: "detect",
    },
  },
  rules: {
    strict: [2, "never"],
    "no-multi-spaces": 0,
    "spaced-comment": 0,
    "no-multi-assign": 0,
    "camelcase": 0,
    //Import rules
    
    "import/extensions": ["error", "ignorePackages", { "js": "never", "jsx": "never","ts": "never", "tsx": "never" } ],
    "import/no-unresolved": 2,
    "import/no-extraneous-dependencies":  ["error", {"devDependencies": true}],
    "import/no-named-as-default-member": 0,
    "import/prefer-default-export": 0,
    //ts related rules
    "indent": 0,
    "@typescript-eslint/indent": 0,
    "@typescript-eslint/explicit-member-accessibility": 0,
    "@typescript-eslint/camelcase": 0,
    "import/no-webpack-loader-syntax": 0,
    "@typescript-eslint/prefer-interface": 0,
    "import/no-cycle": 1,
    "react/prop-types": 0,
    "react/jsx-filename-extension": ["warn", { "extensions": [".tsx",] }],
    "react/react-in-jsx-scope": "error",
    "@typescript-eslint/explicit-function-return-type": 0,
    "@typescript-eslint/no-this-alias": 0,
    
  },
};
