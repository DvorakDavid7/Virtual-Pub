const express = require('express')
const { ExpressPeerServer } = require('peer')

const port = process.env.PORT || 5000
const app = express()
const server = require('http').createServer(app)
const peerServer = ExpressPeerServer(server, {
    allow_discovery: true,
    perMessageDeflate: false
})

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use('/peerjs', peerServer)

app.get('/', (req, res) => {
    res.render('index')
})

peerServer.on('connection', client => {
    console.info(`new connection: ${client.id}`)
})

server.listen(port, () => {
    console.log(`server is listening on port ${port}`);
})
