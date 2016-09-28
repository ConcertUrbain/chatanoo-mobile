echo "Zipping sources"
mkdir build
cd public
zip -r ../build/mobile.zip .
cd ..

echo "Deploy $TRAVIS_TAG version to S3"
aws s3 cp infra/mobile.cfn.yml s3://chatanoo-deployment/infra/mobile/$TRAVIS_TAG.cfn.yml
aws s3 cp build/mobile.zip s3://chatanoo-deployment/mobile/$TRAVIS_TAG.zip

echo "Upload latest"
aws s3api put-object \
  --bucket chatanoo-deployment \
  --key infra/mobile/latest.cfn.yml \
  --website-redirect-location /infra/mobile/$TRAVIS_TAG.cfn.yml
aws s3api put-object \
  --bucket chatanoo-deployment \
  --key mobile/latest.zip \
  --website-redirect-location /mobile/$TRAVIS_TAG.zip
