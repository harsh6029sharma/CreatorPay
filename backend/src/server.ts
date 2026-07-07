import 'dotenv/config'
import app from "./app";
import { createServer } from 'node:http';

const port = process.env.PORT || 6001

const server = createServer(app)

server.listen(port, ()=>{
    console.log(`server is listening on port:${port}`)
})