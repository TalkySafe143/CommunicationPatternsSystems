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
const fs = require('fs');

function requestNombre(client, request){
  client.Name({ id: request }, function (err, response) {
    if (err) {
      console.error('Error al llamar a Name:', err);
      return;
    }
    console.log(response.name);
  });
}

function requestGrade(client, request){
  client.Grades({ name: request }, function (err, response) {
    if (err) {
      console.error('Error al llamar a Grades:', err);
      return;
    }
    console.log(response.average);
  });
}

function requestGroup(client, request){
  client.Group({ id: request }, function (err, response) {
    if (err) {
      console.error('Error al llamar a Group:', err);
      return;
    }
    console.log(response.groupName);
  });
}

function main() {
  var target = 'localhost:50051';
  var client = new hello_proto.Course(target, grpc.credentials.createInsecure());
  var argv = parseArgs(process.argv.slice(2));

  if (argv._.length > 0) {
    console.log('Se ha leido el archivo: ' + argv._[0]);
    // Leer el archivo
    fs.readFile(argv._[0], 'utf8', (err, data) => {
      if (err) {
        console.error('Error al leer el archivo:', err);
        return;
      }
      const lineas = data.split('\n');

      // Iterar sobre cada línea
      lineas.forEach((linea, index) => {
        // Separar la línea por espacio
        const partes = linea.split(' ');

        const tipo = partes[0];
        const valor = partes.slice(1).join(' '); 

        if(tipo == 'nombre'){
          requestNombre(client, valor);
        }else if(tipo == 'notas'){
          requestGrade(client, valor);
        }else if(tipo == 'grupo'){
          requestGroup(client, valor);
        }
      });
    });
    
  } else {
    console.log('Debe proveer archivo de entrada.');
  }
}

main();