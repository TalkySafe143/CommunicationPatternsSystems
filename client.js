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

  var client = new hello_proto.Greeter(target, grpc.credentials.createInsecure());
  var user = 'esto es lo que se envía al servidor :)';

  client.sayHello({ name: user }, function (err, response) {
    if (err) {
      console.error('Error al llamar a sayHello:', err);
      return;
    }
    console.log(response.message);
  });

  client.testOne({ id: 2 }, function (err, response) {
    if (err) {
      console.error('Error al llamar a testOne:', err);
      return;
    }
    console.log(response.repl);
  });

}

main();