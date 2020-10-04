const localStream = navigator.mediaDevices.getUserMedia({
    video : true,
    audio : true
})
const peer = new Peer(null, {
    host: location.hostname,
    port: location.hostname === "localhost" ? 5000 : location.port,
    path: '/peerjs'
})
const videoGrid = document.querySelector('#video-grid')
const ROOM_ID = location.pathname.replace("/", "")
let fire = false


peer.on('open', async (id) => {
    console.info(`connected to peerjs with id: ${id}`)
    sendIdandRoom(id, ROOM_ID)
    const video = document.createElement('video')
    video.muted = true
    addVideoStream(video, await localStream)

    const peers = await getConnectedClientsInRoom(ROOM_ID)
    for (let peerId of peers) {
        if (peerId === id) continue
        callUser(peerId)
    }
    
    // cheers button event listener
    document.querySelector("#cheers").addEventListener("click", () => {
        document.querySelector(".cheers").play()
        sendEventToAllPeers("cheers")
    });

    // change bg image
    document.querySelector("#fire-bg").addEventListener("click", () => {
        tentAFire()
        sendEventToAllPeers("change-bg")
    });
})


peer.on('call', async (call) => {
    console.info(`answering: ${call.peer}`)

    call.answer(await localStream)
    connectCall(call)
})


peer.on('connection', connection => {
    connection.on('data', event => {
        switch (event) {
            case "cheers":
                document.querySelector(".cheers").play()
                break;
            
            case "change-bg":
                tentAFire()
                break

            default:
                break;
        }
    })
    connection.on('error', console.error)
})


window.addEventListener('beforeunload', (e) => {
    e.preventDefault()
    peer.disconnect()
});


// Function declarations 


/**
 * 
 * @param {string} userId 
 */
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


/**
 * Send message to all peers in current room
 * @param {string} event event name
 */
async function sendEventToAllPeers(event) {
    const peers = await getConnectedClientsInRoom(ROOM_ID)
    for (let peerId of peers) {
        let conn = peer.connect(peerId);
        conn.on("open", () => {
            conn.send(event);
        });
    }
}


/**
 * send Client ID and Room ID to server
 * @param {string} clientId 
 * @param {string} roomId 
 */
async function sendIdandRoom(clientId, roomId) {
    const data = {
        clientId,
        roomId
    }
    _ = await fetch("/clients/save", {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(data)
    })
}


/**
 * Get list of all clients and returns clients in current room
 * @param {string} roomId
 * @returns {Promise<Array<string>>} array of peer ids
 */
async function getConnectedClientsInRoom(roomId) {
    let result = []
    const response = await fetch("/clients/list")
    const clients = await response.json()
    for (let client of clients) {
        if (client.roomId === roomId) {
            result.push(client.clientId)
        }
    }
    return result
}

/**
 * change bg image adn play campfire sound
 */
function tentAFire() {
    const DELAY = 1000 * 1 * 60
    const campfire = document.querySelector(".campfire") 

    if (!fire) {
        fire = true
        campfire.play()
        campfire.volume = 0.5
        document.querySelector("#container img.top").classList.add("transparent")
        setTimeout(() => {
            document.querySelector("#container img.top").classList.toggle("transparent")
            campfire.pause()
            fire = false
        }, DELAY);
    }
}