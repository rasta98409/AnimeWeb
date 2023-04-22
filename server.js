const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const MongoClient = require('mongodb').MongoClient;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const getTranslationFromDatabase = async (text) => {
    const result = await db.collection('translations').findOne({ text });
    return result ? result.translatedText : null;
  };
// Conexión a la base de datos MongoDB
const uri = "mongodb+srv://rasta:quiceno12@cluster0.m55qvkl.mongodb.net/translations?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let db;

client.connect(err => {
  if (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  }

  console.log('Connected to MongoDB');
  db = client.db("translations");

  // Inicie el servidor
  server.listen(3001, "0.0.0.0", () => {
    console.log('Server listening on port 3001');
  });
});

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('save_translation', async (data) => {
    const { text, translatedText } = data;
    await db.collection('translations').updateOne(
      { text },
      { $set: { text, translatedText } },
      { upsert: true }
    );
    io.emit('translation_updated', data);
  });
  socket.on('get_translation', async (text) => {
    const translatedText = await getTranslationFromDatabase(text);
    socket.emit('translation_result', { text, translatedText });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});