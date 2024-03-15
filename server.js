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
  console.log('Nombre: ', call.request.id);
}

function Grades(call, callback){
  callback(null, {average: 1.2});
  console.log('Notas: ', call.request.name);
}

function Group(call, callback){
  callback(null, {groupName: 'los vagos'});
  console.log('Grupo: ', call.request.id);
}

var serviceHandlers = {
  Name: Name, 
  Grades: Grades,
  Group: Group
};

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