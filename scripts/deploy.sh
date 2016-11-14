echo "Zipping sources"
mkdir build
cd public
zip -r ../build/mobile.zip .
cd ..

echo "Deploy $TRAVIS_TAG version to S3"
aws s3 cp infra/mobile.cfn.yml s3://chatanoo-deployments-eu-west-1/infra/mobile/$TRAVIS_TAG.cfn.yml
aws s3 cp build/mobile.zip s3://chatanoo-deployments-eu-west-1/mobile/$TRAVIS_TAG.zip

echo "Upload latest"
aws s3api put-object \
  --bucket chatanoo-deployments-eu-west-1 \
  --key infra/mobile/latest.cfn.yml \
  --website-redirect-location /infra/mobile/$TRAVIS_TAG.cfn.yml
aws s3api put-object \
  --bucket chatanoo-deployments-eu-west-1 \
  --key mobile/latest.zip \
  --website-redirect-location /mobile/$TRAVIS_TAG.zip
