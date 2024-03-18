const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const fs = require('fs');

// Cargar el archivo de definición del protocolo gRPC
const packageDefinition = protoLoader.loadSync('./proto/student.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const studentProto = grpc.loadPackageDefinition(packageDefinition).StudentService;

// Crear un cliente gRPC
const client = new studentProto('localhost:50051', grpc.credentials.createInsecure());

// Leer el archivo de solicitudes
const solicitudes = fs.readFileSync('solicitudes.txt', 'utf-8').split('\n');
function isNumeric(value) {
  return /^-?\d+$/.test(value);
}


function printServerAnswer(query, action, message) {
  console.log("--------------")
  console.log(`Respuesta del servidor para '${action}' con la siguiente consulta`)
  console.log(query)
  console.log(message);
  console.log("--------------\n")
}

// Procesar cada solicitud
solicitudes.forEach((linea) => {
  const [metodo, parametro] = linea.split(' ');
  const lMetodo = metodo.toLowerCase();
  switch (lMetodo) {
    case 'nombre':
      client.getFullName({ id: parseInt(parametro) }, (error, response) => {
        if (error) {
          console.error('Error recuperando los nombres:', error.message);
        } else {
          printServerAnswer(
              { id: parseInt(parametro) },
              lMetodo,
              'Nombre: '+ response.name
          );
        }
      });
      break;
      case 'notas':
        let query;
        if (isNumeric(parametro)) query = {id: parametro, name: ""}
        else query = {id: "", name: parametro}
        client.getAverageGrades(query, (error, response) => {
          if (error) {
            console.error('Error recuperando las notas:', error.message);
          } else {
            printServerAnswer(
                query,
                lMetodo,
                'Promedio de notas: ' + response.average
            );
          } 
        });
      break;
          
    case 'grupo':
      client.getGroup({ id: parseInt(parametro) }, (error, response) => {
        if (error) {
          console.error('Error recuperando el grupo:', error.message);
        } else {
          printServerAnswer(
              { id: parseInt(parametro) },
              lMetodo,
              'Grupo: ' + response.group
          )
        }
      });
      break;
    default:
      console.error('Solicitud no reconocida:', metodo);
  }
});
