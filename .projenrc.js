const { TypeScriptLibraryProject, Semver, Jest, Eslint } = require('projen');

const project = new TypeScriptLibraryProject({
  name: 'jsii-srcmak',
  jsiiVersion: Semver.caret('1.5.0'),
  description: 'generate source code in multiple languages from typescript',
  repository: 'https://github.com/eladb/jsii-srcmak.git',
  authorName: 'Elad Ben-Israel',
  authorEmail: 'benisrae@amazon.com',
  stability: 'experimental',
  bin: {
    'jsii-srcmak': 'bin/jsii-srcmak'
  },
  devDependencies: {
    '@types/ncp': Semver.caret('2.0.4'),
    '@types/node': Semver.caret('13.9.8'),
    '@types/fs-extra': Semver.caret('9.0.1'),
  },
  dependencies: {
    'jsii': Semver.caret('1.5.0'),
    'jsii-pacmak': Semver.caret('1.5.0'),
    'fs-extra': Semver.caret('9.0.0'),
    'ncp': Semver.caret('2.0.0'),
    'yargs': Semver.caret('11.1.1'),
  },
  releaseToNpm: true
});

new Jest(project);
new Eslint(project);

project.synth();
