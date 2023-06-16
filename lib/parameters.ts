import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ssm from "aws-cdk-lib/aws-ssm";

export class ParametersStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const parameters = require("../parameters.json");

    for (const key in parameters) {
      new ssm.StringParameter(this, key, {
        parameterName: `/${key}`,
        stringValue: parameters[key],
      });
    }
  }
}
