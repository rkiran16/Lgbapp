let io;

module.exports = {
    init: httpServer => {
        io = require('socket.io')(httpServer, {
            cookie: false
        });
        return io
    },
    getIO: () => {
        if(!io){
            throw new Error('Connection not initialized');
        }
        return io;
    },
}