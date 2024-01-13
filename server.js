
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const archiver = require('archiver');
const cors = require('cors');


const app = express();
const port = 3000;
let jsonString;
let csvRec;

app.use(bodyParser.json());
app.use(cors());


// Definisci la directory contenente la tua pagina HTML
const publicDirectory = path.join(__dirname, 'public');

// Configura Express per servire file statici dalla directory 'public'
app.use(express.static(publicDirectory));

// Crea una route per la tua pagina principale
app.get('/', (req, res) => {
  res.sendFile(path.join(publicDirectory, 'passwordList.html'));
});



//POST
// Gestisci la richiesta POST per salvare la lista delle password.
// QUESTA API SOLAMENTE VALORIZZA LA VARIABILE CHE HO GLOBLAMENTE SALVATA NEL MIO SERVER. 
// QUINDI QUANDO LA CHIAMERO DOVRO DARLE UN QUALCOSA DA INSERIRE DENTRO LA VARIABILE 
 app.post('/savePasswordList', (req, res) => {
  console.log('Request POST to /savePasswordList received.'); 
  // Supponiamo che il file JSON inviato dal client sia memorizzato in req.body

   // Converte l'oggetto JSON in una stringa JSON
   jsonString = JSON.stringify(req.body, null, 2);
   console.log(jsonString);

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






//PROCEDURE CREAZIONE FILE ZIP CON PASSWORD ED INVIO AL CLIENT
app.post('/csvZip', (req, res) => {
  console.log('Request POST to /csvZip received.'); 
  // Supponiamo che il file JSON inviato dal client sia memorizzato in req.body

   // Converte l'oggetto JSON in una stringa JSON
   //csvRec = JSON.stringify(req.body, null, 2);
   csvRec = req.body
   console.log(csvRec);

   // Invia il contenuto del file JSON al client
   //res.json(csvRec);
   //res.json({OK : 'DONE'});
   res.send(csvRec);  
});

//QUI SI INVIA LA VARIABILE CSV MESSA IN UN ZIP PROTETTO DA PASSWORD.
app.get('/csvZip', (req, res) => {
  console.log('Request GET to /savePasswordList received.'); 
   // Invia il contenuto del file JSON al client
   res.send(csvRec);
   //res.json({ csv: csv });
  //res.send(csv);
});






// Avvia il server e mettilo in ascolto sulla porta specificata
app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});





