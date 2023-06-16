#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ParametersStack } from '../lib/parameters';
import { LambdaStack } from '../lib/lambda';

const app = new cdk.App();

const parametersStack = new ParametersStack(app, 'ParametersStack');
const lambdaStack = new LambdaStack(app, 'LambdaStack');

lambdaStack.addDependency(parametersStack);