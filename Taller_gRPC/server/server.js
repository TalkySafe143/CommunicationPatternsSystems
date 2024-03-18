const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const fs = require('fs');

const packageDefinition = protoLoader.loadSync('proto/student.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const studentProto = grpc.loadPackageDefinition(packageDefinition).StudentService;

const studentsData = fs.readFileSync('data/students.txt', 'utf-8').split('\n');

function getFullName(call, callback) {
  const studentID = call.request.id;
  const student = studentsData.find(student => student.includes(studentID));
  if (student) {
    const fullName = student.split(' ').slice(2, -2).join(' ');
    callback(null, { name: fullName });
  } else {
    callback(new Error('No se encontró el estudiante.'));
  }
}

function isNumeric(value) {
  return /^-?\d+$/.test(value);
}
function getAverageGrades(call, callback) {
  const studentInfo = String(call.request.idOrName);
  
  let student;
  if (!isNaN(studentInfo)) {
    const studentID = parseInt(studentInfo);
    student = studentsData.find(student => student.split(' ')[1] === studentID);
  } else {
    student = studentsData.find(student => {
      const studentData = student.split(' ');
      const fullName = studentData.slice(2, -2).join(' ');
      return fullName && fullName.toLowerCase().includes(studentInfo.toLowerCase());
    });
  }

  if (student) {
    const grades = student.split(' ').slice(-2).map(Number);
    const average = grades.reduce((acc, curr) => acc + curr, 0) / grades.length;
    callback(null, { average });
  } else {
    callback(new Error('No se encontró el estudiante.'));
  }
}

function getGroup(call, callback) {
  const studentID = call.request.id;
  const student = studentsData.find(student => student.includes(studentID));
  if (student) {
    const group = student.split(' ')[0];
    callback(null, { group });
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
