const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// 提供静态文件服务
app.use(express.static('public'));

// 存储在线用户
const users = new Map();

io.on('connection', (socket) => {
    console.log('用户已连接');

    // 处理用户加入
    socket.on('userJoin', (username) => {
        users.set(socket.id, username);
        io.emit('userList', Array.from(users.values()));
        io.emit('message', {
            type: 'system',
            content: `${username} 加入了聊天室`
        });
    });

    // 处理聊天消息
    socket.on('chatMessage', (message) => {
        const username = users.get(socket.id);
        io.emit('message', {
            type: 'chat',
            username: username,
            content: message
        });
    });

    // 处理断开连接
    socket.on('disconnect', () => {
        const username = users.get(socket.id);
        users.delete(socket.id);
        io.emit('userList', Array.from(users.values()));
        io.emit('message', {
            type: 'system',
            content: `${username} 离开了聊天室`
        });
    });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
}); 