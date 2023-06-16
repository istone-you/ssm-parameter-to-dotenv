import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import "dotenv/config";

export class LambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const runCommandRole = new iam.Role(this, "SSMRole", {
      assumedBy: new iam.ServicePrincipal("ssm.amazonaws.com"),
    });

    runCommandRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["sns:Publish"],
        resources: [`${process.env.SNS_ARN}`],
      })
    );

    const executionRole = new iam.Role(this, "LambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMFullAccess"),
      ],
    });

    executionRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["iam:PassRole"],
        resources: [`${runCommandRole.roleArn}`],
      })
    );

    const lambdaFunction = new lambda.Function(
      this,
      "UpdateDotenvFileFunction",
      {
        functionName: "UpdateDotenvFileFunction",
        environment: {
          SSM_ROLE_ARN: runCommandRole.roleArn,
          SNS_ARN: process.env.SNS_ARN || "",
          INSTANCE_ID: process.env.INSTANCE_ID || "",
        },
        runtime: lambda.Runtime.PYTHON_3_8,
        code: lambda.Code.fromAsset("lambda/"),
        handler: "index.lambda_handler",
        timeout: cdk.Duration.seconds(60),
        role: executionRole,
      }
    );

    const rule = new events.Rule(this, "rule", {
      ruleName: "UpdateDotenvFileEventRule",
      eventPattern: {
        source: ["aws.ssm"],
        detailType: ["Parameter Store Change"],
        detail: {
          name: [
            {
              prefix: `${process.env.SSM_PARAMETER_PREFIX}`,
            },
          ],
          operation: ["Create", "Update", "Delete"],
        },
      },
      enabled: true,
    });

    rule.addTarget(new targets.LambdaFunction(lambdaFunction));
  }
}
