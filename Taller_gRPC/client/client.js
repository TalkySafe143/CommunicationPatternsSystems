const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const fs = require('fs');

/**
 * Antes de cargar la defincion, hay que especificar ciertas configuraciones del archivo
 * @type {PackageDefinition}
 */
const packageDefinition = protoLoader.loadSync('./proto/student.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

/**
 * Se debe cargar la definicion del .proto para poder consumir la implementacion
 * @type {grpc.GrpcObject | grpc.ServiceClientConstructor | grpc.ProtobufTypeDefinition}
 */
const studentProto = grpc.loadPackageDefinition(packageDefinition).StudentService;


/**
 * La definicion del servicio retorna un constructor para poder realizar el respectivo cliente
 * @type {ServiceClient}
 */
const client = new studentProto('localhost:50051', grpc.credentials.createInsecure());

/**
 * Para efectos del ejercicio, las peticiones estan descritas en un archivo de texto
 * Este archivo tiene como formato: <ACTION> <QUERY>;
 * Donde <ACTION> es el nombre del procedimiento a llamar y <QUERY> la informacion especificada en el .proto
 * @type {string[]}
 */
const solicitudes = fs.readFileSync('solicitudes.txt', 'utf-8').split('\n');

/**
 * Esta funcion tiene como objetivo verificar por medio de expresiones regulares si un texto es un numero
 * @param value Un string a verificar
 * @returns {boolean} True en caso de que el string sea un numero, false en caso contrario
 */
function isNumeric(value) {
  return /^-?\d+$/.test(value);
}


/**
 * Esta funcion tiene como objetivo imprimir la respuesta del servidor gRPC
 * @param query El objeto con el que fue enviada la query al servidor
 * @param action El nombre del procedimiento llamado
 * @param message El mensaje a imprimir
 */
function printServerAnswer(query, action, message) {
  console.log("--------------")
  console.log(`Respuesta del servidor para '${action}' con la siguiente consulta`)
  console.log(query)
  console.log(message);
  console.log("--------------\n")
}


/**
 * Es necesario procesar cada solicitud, las cuales estan contenidas en el arreglo de string procesado
 * a partir de la lectura del archivo
 */
solicitudes.forEach((linea) => {
  const [metodo, parametro] = linea.split(' ');
  const lMetodo = metodo.toLowerCase();
  switch (lMetodo) {
    case 'nombre':

      /**
       * En este momento, 'cliente' contiene las definiciones especificadas por el servidor para su uso
       * Cada una de las funciones debe tener el parametro especificado en el .proto y un callback
       * Este callback fue definido en el servidor
       */
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
