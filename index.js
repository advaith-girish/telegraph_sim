const express = require('express');
const app = express();
const server = require('http').createServer(app);
const { Server } = require('socket.io');
const path=require('path');
const session=require('express-session');
const io = new Server(server);
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(session({ secret: 'sha256', resave: true, saveUninitialized: true }));


//2 buttons . and -
//for login, username and room_id , logs into  the corresponding room

const PORT =9000;

app.get('/login',(req,res)=>{
    res.render('login');
});

let room_key='';
app.post('/login',(req,res)=>{
    let username=req.body.username;
    let roomkey=req.body.roomkey;

    req.session.username=username;
    req.session.roomkey=roomkey;

    room_key=roomkey;

    console.log(username);
    res.redirect('/');
});

io.on('connection',(socket)=>{ //socket contains client details
    console.log("User connected",socket.id);

    //console.log("is this" ,room_key[0]);
    if(room_key){
        socket.emit('join_room', room_key);
        socket.on("join_room", (data) => {

            socket.join(data);
          });
    }
    else room_key=socket.id;
      
    socket.on('user_message',(data)=>{

        if (data.sender === 'server') {
            socket.to(data.room).emit('final_message', data);
        }
        else 
            socket.to(data.room).emit('server_message',{ sender: data.sender, message: data.message });//distribute to required
            console.log("Dest roomkey:",data);
            //io.to(data.room).emit('message', data);
    });
});

app.get('/', (req, res) => {
    const {username}=req.session;
    const {roomkey}=req.session;
    res.render('index',{username,roomkey});
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
