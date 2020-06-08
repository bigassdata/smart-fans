#!/bin/bash

aws s3 sync --cache-control 'max-age=604800' \
    --exclude index.html \
    s3://smart-fan-devoutputbucket-1f5bkjob6sxdm/smart-product-solution/v0.0.2/console \
    s3://smartproductsolutionstac-smartproductownerwebappw-1lh59cyzvxeaa/


aws s3 sync --cache-control 'no-cache' \
    s3://smart-fan-devoutputbucket-1f5bkjob6sxdm/smart-product-solution/v0.0.2/console \
    s3://smartproductsolutionstac-smartproductownerwebappw-1lh59cyzvxeaa/