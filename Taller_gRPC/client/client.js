const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const fs = require('fs');

// Cargar el archivo de definición del protocolo gRPC
const packageDefinition = protoLoader.loadSync('proto/student.proto', {
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

// Procesar cada solicitud
solicitudes.forEach((linea) => {
  const [metodo, parametro] = linea.split(' ');
  const lMetodo = metodo.toLowerCase();
  switch (lMetodo) {
    case 'nombre':
      client.getFullName({ id: parseInt(parametro) }, (error, response) => {
        if (error) {
          console.error('Error:', error.message);
        } else {
          console.log('Nombre:', response.name);
        }
      });
      break;
      case 'notas':
        const cParametro = parametro.trim();
        const isId = isNumeric(cParametro);
        const idOrName = isId ? { id: parseInt(cParametro) } : { name: cParametro };
        client.getAverageGrades(idOrName, (error, response) => {
          if (error) {
            console.error('Error:', error.message);
          } else {
            console.log('Promedio de notas:', response.average);
          } 
        });
      break;
          
    case 'grupo':
      client.getGroup({ id: parseInt(parametro) }, (error, response) => {
        if (error) {
          console.error('Error:', error.message);
        } else {
          console.log('Grupo:', response.group);
        }
      });
      break;
    default:
      console.error('Solicitud no reconocida:', metodo);
  }
});
