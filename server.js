const express = require('express')
const { ExpressPeerServer } = require('peer')
const fs = require("fs");
const path = require('path');


const port = process.env.PORT || 5000
const app = express()
const server = require('http').createServer(app)
const peerServer = ExpressPeerServer(server, {
    allow_discovery: true
})

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.json())
app.use('/peerjs', peerServer)

app.get('/:roomId', (req, res) => {
    res.render('index')
})

app.get("/clients/list", (req, res) => {
    res.send(getClients())
})


app.post("/clients/save", (req, res) => {
    console.log(req.body);
    let currentClients = getClients()
    currentClients.push(req.body)
    fs.writeFileSync(path.resolve(__dirname, 'clients.json'), JSON.stringify(currentClients, null, 4));
    res.statusCode = 200
    res.send()
})


peerServer.on('connection', client => {
    console.info(`new connection: ${client.id}`)
})


// remove client from storage
peerServer.on("disconnect", client => {
    let currentClients = getClients()
    let index = 0
    for (let item of currentClients) {
        if (item.clientId === client.id) {
            currentClients.splice(index, 1)
        }
        index++
    }
    fs.writeFileSync(path.resolve(__dirname, 'clients.json'), JSON.stringify(currentClients, null, 4));
    console.log(`client disconnect: ${client.id}`)
})


server.listen(port, () => {
    console.log(`server is listening on port ${port}`);
})


function getClients() {
    let rawdata = fs.readFileSync(path.resolve(__dirname, 'clients.json'));
    return JSON.parse(rawdata);
}
