Vis.factory('Boards', Boards);

Boards.$inject = [];

function Boards() {
  var factory = this,
      s3 = new AWS.S3;

  var sampleBoard = {
    name: 'Sample Board',
    description: 'This sample represents a typical schema connected to 2 CloudWatch metrics.',
    created: moment(),
    modified: moment(),
    things: [{
      type: 'CloudWatch:metric',
      namespace: 'prod/guillotine-worker',
      name: 'io.dropwizard.jetty.MutableServletContextHandler.2xx-responses',
      dimensions: {
        type: 'meterSum'
      },
      aggregation: 'Sum',
      period: '1 minute',
      window: '1 hour'
    }, {
      type: 'CloudWatch:metric',
      namespace: 'prod/guillotine-worker',
      name: 'io.dropwizard.jetty.MutableServletContextHandler.2xx-responses',
      dimensions: {
        type: 'meterSum'
      },
      aggregation: 'Sum',
      period: '1 minute',
      window: '1 hour'
    }]
  };

  factory.get = function(name) {
    if (name == sampleBoard.name) {
      return sampleBoard;
    }
  };

  factory.ls = function () {
    return [sampleBoard];
  };

  return factory;
}