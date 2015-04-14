Anvil (experimental)
====================
A CloudWatch Metrics dashboard builder

<img src="https://raw.githubusercontent.com/blacklocus/anvil/master/doc/Cumulonimbus_incus_cloud_Jan2008.jpg" width="400"/>


## Deployment ##

```bash
# For tooling
npm install

# For browser dependencies
bower install

# To sync browser application to s3://anvil.blacklocus.com/
gulp publish
# or
node node_modules/gulp/bin/gulp.js publish
# Publishing requires the aws-cli configured with credentials
# that have write access to `s3://anvil.blacklocus.com`
```