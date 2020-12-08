const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const {v4: uuidV4} = require('uuid')


app.set('view engine','ejs')
app.use(express.static('public'))

var userIds = {}


app.get('/',(req,res) => {
	res.redirect(`/${uuidV4()}`)
})

app.get('/:room',(req,res)=>{
	res.render('room',{roomId:req.params.room})
})

io.on('connection', socket => {
	socket.on('join-room',(roomId,userId) => {
		console.log("Room: "+ roomId+ " User: "+	userId)
		userIds[userId] = 1

		socket.join(roomId)

		socket.to(roomId).broadcast.emit('user-connected',userId)

		socket.to(roomId).emit('all-connection',userIds)


		socket.on('disconnect', ()=>{
			socket.to(roomId).broadcast.emit('user-disconnected',userId)
			delete userIds[userId]
		})	

	})

})

server.listen(process.env.PORT || 3000);

