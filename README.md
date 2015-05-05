Anvil (experimental)
====================
A CloudWatch Metrics dashboard builder

<img src="https://raw.githubusercontent.com/blacklocus/anvil/master/doc/Cumulonimbus_incus_cloud_Jan2008.jpg" width="400"/>

## Users ##

Anyone can use it. Just go to https://anvil.blacklocus.com/#/config/ to configure it with your account. Anvil just needs to be configured with credentials with write access to an S3 bucket (to save your Anvil data) and read access to CloudWatch metrics. These credentials are stored in your browser's local storage and are used to communicate directly from your browser to AWS. This app runs entirely in the browser.

Use Anvil to create *walls* of *boards*. A wall is simply a collection of boards. A board is a graph with any number of series (graph lines), its associated controls (e.g. window, period, ...), and additional user data (custom series names, ...).


## Deployment ##

These instructions are for BlackLocus to update anvil.blacklocus.com.

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
