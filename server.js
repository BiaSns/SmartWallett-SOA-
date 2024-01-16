//Inizializzazione moduli
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const archiver = require('archiver');
const cors = require('cors');
const generator = require('generate-password');

const app = express();
const port = 3000;


archiver.registerFormat('zip-encrypted', require("archiver-zip-encrypted"));

let jsonString;
let csvRec;

app.use(bodyParser.json());
app.use(cors());


//Definisci la directory contenente la pagina HTML
const publicDirectory = path.join(__dirname, 'public');

//Configura Express per servire file statici dalla directory 'public'
app.use(express.static(publicDirectory));

//Crea una route per la pagina principale
app.get('/', (req, res) => {
  res.sendFile(path.join(publicDirectory, 'passwordList.html'));
});



//POST
// Gestisci la richiesta POST per salvare la lista delle password.
// QUESTA API SOLAMENTE VALORIZZA LA VARIABILE CHE HO GLOBLAMENTE SALVATA NEL MIO SERVER. 
// QUINDI QUANDO LA CHIAMERO DOVRO DARLE UN QUALCOSA DA INSERIRE DENTRO LA VARIABILE 
 app.post('/savePasswordList', (req, res) => {
  console.log('Request POST to /savePasswordList received.'); 

   // Converte l'oggetto JSON in una stringa JSON
   jsonString = JSON.stringify(req.body, null, 2);

   // Invia il contenuto del file JSON al client
   res.send(jsonString);  
});

// QUESTA API SOLAMENTE TORNA INDIETRO QUEL CHE HO SALVATO N ELLA MIA VARIABILE !!!
// sE LA MIA VARIABILE E' VUOTA TORNERO LA VARIABILE VUOTA 
// QUANDO LA CHIAMERO NON DOVRO DARLE NULLA MA SARA LEI A DARMI QUALCOSA
app.get('/savePasswordList', (req, res) => {
  console.log('Request GET to /savePasswordList received.'); 
   // Invia il contenuto del file JSON al client
   res.send(jsonString);
});


 //PROVIAMO CON UNA SOLA CHIAMATA CLIENT E UNA SOLA CHIAMATA SERVER
//PROCEDURE CREAZIONE FILE ZIP CON PASSWORD ED INVIO AL CLIENT
app.post('/csvZip', (req, res) => {
  console.log('Request POST to /csvZip received.'); 

   //Converte l'oggetto JSON in una stringa JSON(Necessario poichè nel buffer posso caricare solo tipo "stringa")
   csvRec = JSON.stringify(req.body);
   //Rimuovo le graffe create con la conversione JSON
   csvRec = csvRec.replace(/[{}]/g, '');
   //Questa dichiarazione risolve l'errore al buffer
   const bufferData = Buffer.from(csvRec);
   //Creo una password dinamica
   const password = generator.generate({ length: 8, numbers: true });

   // Crea oggetto archivio ZIP cifrato
  let archive = archiver.create('zip-encrypted', { zlib: { level: 8 }, encryptionMethod: 'aes256', password: password });
 
  //Catch eventuali warnings
  archive.on('warning', function (err) {
    if (err.code === 'ENOENT') {
      console.log(err);
    } else {
      throw err;
    }
  });

  //Catch eventuali errori
  archive.on('error', function (err) {
    throw err;
  });

  //Aggiunge file credentials.json con le credenziali nell'archivio
  archive.append(bufferData, { name: 'credentials.csv' });
  //Aggiunge header Content-Disposition nella risposta
  res.attachment('credentials.zip');
  //Aggiunge header con password dell'archivio nella risposta
  res.setHeader("archive-password", password);

  //Imposta stream di scrittura dell'archivio
  archive.pipe(res);

  // Flush oggetto archivio per poter restituire la response al frontend
  archive.finalize();
    
});




// Avvia il server e lo mette in ascolto sulla porta specificata
app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});





