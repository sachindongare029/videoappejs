const socket = io('/')
const videoGrid = document.getElementById('video-grid')

const myPeer = new Peer(undefined,{
	// host: '/',
	// port: '3001'
})

const myVideo = document.createElement('video')
const peers =  {}

navigator.mediaDevices.getUserMedia({
	video: true,
	audio: true
}).then(stream => {
	addVideoStream(myVideo,stream)

	socket.on('user-connected',userId=>{
		console.log("User connected  "+userId)
		connectToNewUSer(userId,stream)
	})

	socket.on('user-disconnected',userId=>{
		console.log("User disconnect  "+userId)
		if(peers[userId]){
			peers[userId].close()
			delete peers[userId]
		}
			
	})

	socket.on('all-connection',userIds=>{
		console.log("all connections "+userIds.toString())
	})
	
	myPeer.on('call',call => {
		call.answer(stream)

		const video = document.createElement('video') 

		call.on('stream',userVideoStream => {
			addVideoStream(video,userVideoStream)
		})
	})
})

//Mute so that you dont hear your own microphone. Other peopl will still be able to hear you
myVideo.muted = true 


myPeer.on('open', id=> {
	socket.emit('join-room',ROOM_ID,id)

})



function addVideoStream(video,stream) {
	video.srcObject = stream
	video.addEventListener('loadedmetadata',()=> {
		video.play()
	})
	videoGrid.append(video)
}


function connectToNewUSer(userId,stream) {
	const call =myPeer.call(userId, stream)

	const video = document.createElement('video')
	call.on('stream',userVideoStream => {
		addVideoStream(video, userVideoStream)	
	})

	call.on('close',()=>{
		video.remove()
	})

	peers[userId] = call
}