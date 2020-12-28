const { TypeScriptProject } = require('projen');

const project = new TypeScriptProject({
  name: 'jsii-srcmak',
  description: 'generate source code in multiple languages from typescript',
  repository: 'https://github.com/aws/jsii-srcmak.git',
  authorName: 'Elad Ben-Israel',
  authorEmail: 'benisrae@amazon.com',
  stability: 'experimental',

  bin: {
    'jsii-srcmak': 'bin/jsii-srcmak',
  },

  devDeps: [
    '@types/ncp',
    '@types/fs-extra@^8',
    'constructs',
  ],

  deps: [
    'jsii',
    'jsii-pacmak',
    'fs-extra',
    'ncp',
    'yargs',
  ],

  releaseToNpm: true,
  projenUpgradeSecret: 'PROJEN_GITHUB_TOKEN',
  compileBeforeTest: true,

  // superchain is needed to ensure jsii-pacmak has everything it needs
  workflowContainerImage: 'jsii/superchain',
});

project.synth();
