import "source-map-support/register";
import { App } from "aws-cdk-lib";
import { ApiStack } from "../lib/api-stack";

const app = new App();
new ApiStack(app, "ServerlessApiStack", {
      env: {
            account: '650251698778',
            region: 'ap-northest-1'
      }
});