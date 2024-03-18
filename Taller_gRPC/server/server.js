const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const fs = require('fs');

const packageDefinition = protoLoader.loadSync('./proto/student.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const studentProto = grpc.loadPackageDefinition(packageDefinition).StudentService;

class Course {

  studentsData;
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
  searchStudentById = (id) => this.studentsData.find(student => student.id === id)
  searchStudentByName = (name) => this.studentsData.find(student => student.firstName === name || student.secondName === name)
}

const course = new Course();

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

function main() {
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
      console.log('Server running at http://0.0.0.0:50051');
    }
  });
}

main();
