// Karma configuration file.
// https://karma-runner.github.io/6.4/config/configuration-file.html

// Si 'puppeteer' está instalado, usamos su Chromium embebido para que los
// tests corran en CI sin depender de un Chrome instalado en el sistema.
// Si no está disponible, Karma usará el CHROME_BIN del sistema o el Chrome
// que ya esté instalado localmente.
try {
  const puppeteer = require('puppeteer');
  process.env.CHROME_BIN = puppeteer.executablePath();
} catch (e) {
  // puppeteer no está instalado: se usará Chrome/Chromium del sistema.
}

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
    ],
    client: {
      jasmine: {
        // puedes ajustar configuraciones de Jasmine aquí
        // p.ej.: random: false
      },
      clearContext: false, // deja visible el resultado de Jasmine Spec Runner en el navegador
    },
    jasmineHtmlReporter: {
      suppressAll: true, // elimina los logs duplicados en la consola
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/261dsw-s3-angular-sigcon-frontend'),
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'text-summary' }],
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeHeadlessCI'],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
      },
    },
    singleRun: true,
    restartOnFileChange: true,
  });
};
