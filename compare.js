const http = require('http');
const fs = require('fs');
const validhtml="<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'><meta http-equiv='X-UA-Compatible' content='IE=edge'><meta name='viewport' content='width=device-width, initial-scale=1.0'><title>Document</title></head><body><h1>Hello World</h1></body></html>";

const server = http.createServer((req, res) => {
    if(req.url === '/') {
        if(req.method === 'GET') {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(validhtml);
            res.end();
        } else if(req.method === 'POST') {
             res.write("hi");
                res.end();
        }else{
            res.write("Method not allsowed");
            res.end();
        }
    } else if(req.url === '/homepage') {
        res.write("homepage");
        res.end();
    } else {
        res.write("page");
        res.end();
    }

});
server.listen(3030, () => {
    console.log("server is running on port 3030");
}); 