const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
    console.log("got a request");
    res.write("Hello World");
    res.end();
    
});
server.listen(3030, () => {
    console.log("server is running on port 3030");
}); 