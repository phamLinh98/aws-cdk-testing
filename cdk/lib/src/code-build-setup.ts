import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import { Construct } from 'constructs';

export const codeBuildSetup = (scope:Construct) => {
  return new codebuild.Project(scope, 'LinhCodeBuildSetup', {
      source: codebuild.Source.gitHub({
        owner: 'phamLinh98',
        repo: 'codebuild-cicd'
      }),
      buildSpec: codebuild.BuildSpec.fromSourceFilename('buildspec.yaml') // source from github
    });
}