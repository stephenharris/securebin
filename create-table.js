var AWS = require('aws-sdk');
AWS.config.loadFromPath('./config.json');

var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

var params = {
    AttributeDefinitions: [
        {
            AttributeName: "uuid", 
            AttributeType: "S"
        }
    ], 
    KeySchema: [
        {
            AttributeName: "uuid", 
            KeyType: "HASH"
        }
    ], 
    ProvisionedThroughput: {
        ReadCapacityUnits: 5, 
        WriteCapacityUnits: 5
    }, 
    TableName: "Secrets"
   };

   ddb.createTable(params, function(err, data) {
     if (err) console.log(err, err.stack); // an error occurred
     else     console.log(data);           // successful response
   });