const { TypeScriptLibraryProject, Semver } = require('projen');

const project = new TypeScriptLibraryProject({
  name: 'jsii-srcmak',
  jsiiVersion: Semver.caret('1.5.0'),
  description: 'generate source code in multiple languages from typescript',
  repository: 'https://github.com/eladb/jsii-srcmak.git',
  authorName: 'Elad Ben-Israel',
  authorEmail: 'benisrae@amazon.com',
  stability: 'experimental',
  devDependencies: {
    '@types/node': Semver.caret('10.0.0')
  },
  dependencies: {
    'jsii': Semver.pinned('1.1.0'),
    'jsii-pacmak': Semver.pinned('1.1.0'),
  },
  releaseToNpm: true
});

project.synth();
