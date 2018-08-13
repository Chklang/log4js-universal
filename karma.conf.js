module.exports = function (config) {
    config.set({
        frameworks: ["jasmine", "karma-typescript"],
        files: [
            "src/**/*.ts",
            "test/**/*.spec.ts"
        ],
        client : {
            captureConsole: true,
        },
        logLevel: config.LOG_LOG,
        preprocessors: {
            "**/*.ts": "karma-typescript"
        },
        reporters: ["progress", "karma-typescript"],
        browsers: ["PhantomJS"],
    });
}

