#!/bin/bash
export SOLUTION_NAME=smart-fans
export DIST_OUTPUT_BUCKET=smart-fan-poc
export VERSION=0.1.0
./build-s3-dist.sh $DIST_OUTPUT_BUCKET $SOLUTION_NAME $VERSION
aws s3 cp ./global-s3-assets/ s3://smart-fan-poc-us-east-1/smart-fans/0.1.0/ --recursive --acl bucket-owner-full-control
aws s3 cp ./regional-s3-assets/ s3://smart-fan-poc-us-east-1/smart-fans/0.1.0/ --recursive --acl bucket-owner-full-control

echo 'Build complete.  Run the following command to deploy the solution.'

echo 'aws cloudformation create-stack --stack-name smart-fans-stack --template-url https://smart-fan-poc-us-east-1.s3.amazonaws.com/smart-fans/0.1.0/smart-product-solution.template --capabilities CAPABILITY_IAM'
