var PROTO_PATH = __dirname + '/protos/helloworld.proto';

var parseArgs = require('minimist');
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
var packageDefinition = protoLoader.loadSync(
  PROTO_PATH,
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  });
var hello_proto = grpc.loadPackageDefinition(packageDefinition).helloworld;

function main() {
  var target = 'localhost:50051';

  var client = new hello_proto.Course(target, grpc.credentials.createInsecure());

  client.Name({ id: 2 }, function (err, response) {
    if (err) {
      console.error('Error al llamar a Name:', err);
      return;
    }
    console.log(response.name);
  });

  client.Grades({ name: 'pepito' }, function (err, response) {
    if (err) {
      console.error('Error al llamar a Grades:', err);
      return;
    }
    console.log(response.average);
  });

  client.Group({ id: 2 }, function (err, response) {
    if (err) {
      console.error('Error al llamar a Group:', err);
      return;
    }
    console.log(response.groupName);
  });

}

main();