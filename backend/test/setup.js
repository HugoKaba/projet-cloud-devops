process.env.NODE_ENV = 'test';
process.env.AWS_REGION = 'eu-west-1';
process.env.DYNAMODB_TABLE_NAME = 'iim-project-data-test';
process.env.PORT = '3001';

console.log = jest.fn();
console.error = jest.fn();
console.warn = jest.fn();
