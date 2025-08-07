import { CdklabsTypeScriptProject } from 'cdklabs-projen-project-types';

const project = new CdklabsTypeScriptProject({
  name: 'jsii-srcmak',
  projenrcTs: true,
  private: false,
  setNodeEngineVersion: false,
  description: 'generate source code in multiple languages from typescript',
  repository: 'https://github.com/cdklabs/jsii-srcmak.git',
  stability: 'experimental',
  defaultReleaseBranch: 'main',

  // superchain is needed to ensure jsii-pacmak has everything it needs
  workflowContainerImage: 'jsii/superchain:1-bookworm-slim',

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
    'jsii-rosetta',
    'fs-extra',
    'ncp',
    'yargs',
  ],

  releaseToNpm: true,
  enablePRAutoMerge: true,
  autoApproveUpgrades: true,
  autoApproveOptions: {
    allowedUsernames: ['cdklabs-automation'],
    secret: 'GITHUB_TOKEN',
  },
});

project.package.addPackageResolutions('jackspeak@2.0.3');

project.synth();
