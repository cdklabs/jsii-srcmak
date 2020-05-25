const { TypeScriptLibraryProject, Semver, Jest, Eslint } = require('projen');

const project = new TypeScriptLibraryProject({
  name: 'jsii-srcmak',
  jsiiVersion: Semver.caret('1.5.0'),
  description: 'generate source code in multiple languages from typescript',
  repository: 'https://github.com/eladb/jsii-srcmak.git',
  authorName: 'Elad Ben-Israel',
  authorEmail: 'benisrae@amazon.com',
  stability: 'experimental',
  devDependencies: {
    '@types/node': Semver.caret('13.9.8'),
    '@types/fs-extra': Semver.caret('9.0.1'),
  },
  dependencies: {
    'jsii': Semver.pinned('1.1.0'),
    'jsii-pacmak': Semver.pinned('1.1.0'),
    'fs-extra': Semver.caret('9.0.0')
  },
  releaseToNpm: true
});

new Jest(project);
new Eslint(project);

project.synth();
