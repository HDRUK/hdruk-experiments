module.exports = {
    tabWidth: 4,
    printWidth: 80,
    arrowParens: "avoid",
    trailingComma: "es5",
    semi: true,
    useTabs: false,
    singleQuote: false,
    bracketSpacing: true,
    jsxSingleQuote: false,
    bracketSameLine: true,
    importOrder: [
        "^react",
        "<THIRD_PARTY_MODULES>",
        "^(@/interfaces|@/types)(/.*)$",
        "^(@/components|@/modules)(/.*)$",
        "^(@/hooks|@/services)(/.*)$",
        "^(@/utils|@/config|@/consts)(/.*)$",
        "^@/(.*)$",
        "^[./]",
    ],
    overrides: [
        {
            files: ["*.yml", "*.yaml"],
            options: {
                tabWidth: 2,
            },
        },
    ],
};
