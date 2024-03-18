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
 * Se debe cargar la definicion del .proto para poder especificar la implementacion
 * @type {GrpcObject | ServiceClientConstructor | ProtobufTypeDefinition}
 */
const studentProto = grpc.loadPackageDefinition(packageDefinition).StudentService;

/**
 * Esta clase va a tener como objetivo guardar los datos de los estudiantes y exponer las operaciones necesarias
 */
class Course {

  /**
   * Va a ser un array de objetos con el siguiente schema:
   *             group: Grupo al que pertenece,
   *             id: Id del estudiante,
   *             firstName: Primer nombre del estudiante,
   *             secondName: Segundo nombre del estudiante,
   *             grades: array de enteros indicando las notas del estudiante
   */
  studentsData;

  /**
   * En el constructor se inicializa los datos con el archivo
   */
  constructor() {
    this.studentsData = fs
        .readFileSync('./data/students.txt', 'utf-8')
        .split('\n')
        .map(student => {
          const infoStudent = student.split(" ")
          return {
            group: infoStudent[0],
            id: infoStudent[1],
            firstName: infoStudent[2].substring(0, infoStudent[2].length-1),
            secondName: infoStudent[3],
            grades: [parseInt(infoStudent[4]), parseInt(infoStudent[5])]
          }
        });
  }

  /**
   * Este metodo tiene como objetivo buscar un estudiante por ID y retornarlo
   * @param id Id del estudiante
   * @returns {*} Undefined si no existe un estudiante con dicho ID, de lo contrario, retorna el objeto con el estudiante
   */
  searchStudentById = (id) => this.studentsData.find(student => student.id === id)

  /**
   * Este metodo tiene como objetivo buscar un estudiante por nombre y retornarlo
   * @param name Id del estudiante
   * @returns {*} Undefined si no existe un estudiante con dicho nombre, de lo contrario, retorna el objeto con el estudiante
   */
  searchStudentByName = (name) => this.studentsData.find(student => student.firstName === name || student.secondName === name)
}

const course = new Course();

/**
 * Implementacion del metodo remoto getFullName especificado en el .proto
 * @param call informacion de la llamada
 * @param callback callback del cliente, en el primer parametro se envía un error en caso de existir
 */
function getFullName(call, callback) {
  console.log(`¡Se recibió un mensaje de consulta 'nombre' desde ${call.getPeer()}!\n`)
  const studentID = call.request.id;
  const student = course.searchStudentById(studentID)
  if (student) {
    callback(null, { name: student.secondName + " " + student.firstName });
  } else {
    callback(new Error('No se encontró el estudiante.'));
  }
}


/**
 * Implementacion del metodo remoto getAverageGrades especificado en el .proto
 * @param call informacion de la llamada
 * @param callback callback del cliente, en el primer parametro se envía un error en caso de existir
 */
function getAverageGrades(call, callback) {
  console.log(`¡Se recibió un mensaje de consulta 'notas' desde ${call.getPeer()}!\n`)
  const studentInfo = call.request;
  let student;

  if (studentInfo.id !== "") student = course.searchStudentById(studentInfo.id)
  else student = course.searchStudentByName(studentInfo.name)
  if (student) {
    const average = student.grades.reduce((prev, curr) => prev+curr) / student.grades.length;
    callback(null, { average });
  } else {
    callback(new Error('No se encontró el estudiante.'));
  }
}

/**
 * Implementacion del metodo remoto getGroup especificado en el .proto
 * @param call informacion de la llamada
 * @param callback callback del cliente, en el primer parametro se envía un error en caso de existir
 */
function getGroup(call, callback) {
  console.log(`¡Se recibió un mensaje de consulta 'grupo' desde ${call.getPeer()}!\n`)
  const studentID = call.request.id;
  const student = course.searchStudentById(studentID);
  if (student) {
    callback(null, { group: student.group });
  } else {
    callback(new Error('No se encontró el estudiante.'));
  }
}

/**
 * Funcion principal para inicializar el servidor e indicar sus implementaciones
 * Para simplicidad de la sintaxis, esta funcion es una IIFE, leer: https://developer.mozilla.org/es/docs/Glossary/IIFE
 */
(function() {
  const server = new grpc.Server();
  server.addService(studentProto.service, {
    getFullName: getFullName,
    getAverageGrades: getAverageGrades,
    getGroup: getGroup
  });
  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error('Error starting server:', err);
    } else {
      console.log('Server running at http://0.0.0.0:50051 in port ' + port);
    }
  });
})();