const express = require("express");
const cors = require("cors");
const path = require("path");
const soap = require("soap");

const app = express();
const port = 3000;
const soapUrl = "http://localhost:8001/wsdl";

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // Serve file statici

// Array in memoria
let credentials = [];

app.get("/passwords", (req, res) => {
  res.json(credentials);  // ✅ deve essere un array o oggetto
});


// ➤ GET tutte le credenziali
app.post("/validate-password", (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: "Password mancante" });
  }

  soap.createClient(soapUrl, (err, client) => {
    if (err) {
      console.error("❌ Errore creazione client SOAP:", err);
      return res.status(500).json({ error: "Errore SOAP" });
    }

    client.checkPasswordSecurity({ password }, (err, result) => {
      if (err) {
        console.error("❌ Errore chiamata SOAP:", err);
        return res.status(500).json({ error: "Errore durante verifica" });
      }

      const isSecure = result.result === true || result.result === 'true';
      return res.json({ result: isSecure });
    });
  });
});

app.post("/passwords", (req, res) => {
  const { nameCredentials, user, password } = req.body;

  // (logica di validazione SOAP, ecc.)
  const newCredential = {
    id: Date.now(),
    nameCredentials,
    user,
    password
  };

  credentials.push(newCredential);
  res.status(201).json(newCredential); // <<< deve rispondere in JSON!
});


app.put("/passwords/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { nameCredentials, user, password } = req.body;

  const index = credentials.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Credenziale non trovata" });
  }

 // 🔍 Validazione dati in input
  if (!nameCredentials || !user || !password) {
    return res.status(400).json({ error: "Tutti i campi sono obbligatori" });
  }

  // 🔐 Controllo sicurezza password via SOAP
  soap.createClient(soapUrl, (err, client) => {
    if (err) {
      console.error("❌ Errore creazione client SOAP (PUT):", err);
      return res.status(500).json({ error: "Errore SOAP" });
    }

    client.checkPasswordSecurity({ password }, (err, result) => {
      if (err) {
        console.error("❌ Errore chiamata SOAP (PUT):", err);
        return res.status(500).json({ error: "Errore verifica SOAP" });
      }

      const isSecure = result.result === true || result.result === 'true';
      if (!isSecure) {
        console.log("🚫 Password NON sicura (PUT)");
        return res.status(400).json({ error: "Password non sicura" });
      }

      // ✅ Se è sicura, aggiorna la password
      credentials[index] = {
        ...credentials[index],
        nameCredentials,
        user,
        password
      };

      res.status(200).json({ message: "Modifica avvenuta con successo", updated: credentials[index] });
    });
  });
});





// ➤ DELETE una password per ID
app.delete("/passwords/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = credentials.findIndex(c => c.id === id);
  if (index === -1) return res.status(400).json({ error: "ID non valido" });

  credentials.splice(index, 1);
  res.status(200).json({ message: "Rimosso con successo" });
});

// ➤ DELETE tutte
app.delete("/passwords", (req, res) => {
  credentials = [];
  res.status(200).json({ message: "Tutte le credenziali sono state eliminate" });
});

// ➤ HTML fallback
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "passwordList.html"));
});

// ➤ Start
app.listen(port, () => {
  console.log(`✅ Server REST attivo su http://localhost:${port}`);
});




