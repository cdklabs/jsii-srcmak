const { CdklabsTypeScriptProject } = require('cdklabs-projen-project-types');

const project = new CdklabsTypeScriptProject({
  name: 'jsii-srcmak',
  private: false,
  setNodeEngineVersion: false,
  workflowNodeVersion: '16.x',
  description: 'generate source code in multiple languages from typescript',
  repository: 'https://github.com/aws/jsii-srcmak.git',
  stability: 'experimental',
  defaultReleaseBranch: 'main',

  bin: {
    'jsii-srcmak': 'bin/jsii-srcmak',
  },

  devDeps: [
    '@types/ncp',
    '@types/fs-extra@^8',
    'constructs',
    'cdklabs-projen-project-types',
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
  workflowContainerImage: 'jsii/superchain:1-buster-slim-nightly',
  autoApproveOptions: {
    allowedUsernames: ['cdklabs-automation'],
    secret: 'GITHUB_TOKEN',
  },
  autoApproveUpgrades: true,
});

project.package.addPackageResolutions('jackspeak@2.0.3');

project.synth();
