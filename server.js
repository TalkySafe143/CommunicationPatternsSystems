var PROTO_PATH = __dirname + '/protos/helloworld.proto';

var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
var packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });
var hello_proto = grpc.loadPackageDefinition(packageDefinition).helloworld;


function Name(call, callback) {
  callback(null, {name: 'maria'});
}

function Grades(call, callback){
  callback(null, {average: 1.2});
}

function Group(call, callback){
  callback(null, {groupName: 'los vagos'});
}


var serviceHandlers = {
  Name: Name, 
  Grades: Grades,
  Group: Group
};
/**
 * Starts an RPC server that receives requests for the Greeter service at the
 * sample server port
 */
function main() {
  var server = new grpc.Server();
  server.addService(hello_proto.Course.service, serviceHandlers);
  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err != null) {
      return console.error(err);
    }
    console.log(`gRPC listening on ${port}`)
  });
}

main();