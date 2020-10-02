const localStream = navigator.mediaDevices.getUserMedia({
    video : true,
    audio : true
})
const peer = new Peer(null, {
    // host: 'localhost',
    host: location.hostname,
    // port: location.hostname === "localhost" ? 5000 : "",
    path: '/peerjs'
})
const videoGrid = document.querySelector('#video-grid')


peer.on('open', async (id) => {
    console.info(`connected to peerjs with id: ${id}`)
    const video = document.createElement('video')
    video.muted = true
    addVideoStream(video, await localStream)

    peer.listAllPeers(peers => {
        for (const peerId of peers) {
            if (peerId === id) { continue }
            callUser(peerId)
        }
    })
})


peer.on('call', async (call) => {
    console.info(`answering: ${call.peer}`)

    call.answer(await localStream)
    connectCall(call)
})


peer.on('connection', connection => {
    connection.on('data', data => {
        console.dir(data)
    })
    connection.on('error', console.error)
})


async function callUser (userId) {
    console.info(`calling: ${userId}`)

    const call = peer.call(userId, await localStream)

    connectCall(call);
}


function connectCall (call) {
    const video = document.createElement('video')

    call.on('stream', remoteStream => {
        addVideoStream(video, remoteStream)
    })
    call.on('close', _ => {
        removeVideoStream(video)
    })
    call.on('error', console.error)
}


function addVideoStream (videoEl, stream) {
    videoEl.srcObject = stream
    videoEl.addEventListener('loadedmetadata', _ => {
        videoEl.play()
    })
    videoGrid.appendChild(videoEl)
}


function removeVideoStream (videoEl) {
    videoEl.stop()
    videoEl.remove()
}
