const express = require("express");
const http = require("http");
const soap = require("soap");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 8001;

// Espone il file WSDL statico per il browser
app.get("/wsdl", (req, res) => {
  res.set("Content-Type", "text/xml");
  const wsdl = fs.readFileSync(path.join(__dirname, "wsdl", "passwordService.wsdl"), "utf8");
  res.send(wsdl);
});

// Server SOAP (solo POST SOAP, non serve il file)
const service = {
  PasswordService: {
    PasswordServiceSoapPort: {
      checkPasswordSecurity(args) {
        const pwd = args.password;
        const isSecure = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{6,}/.test(pwd);
        return { result: isSecure };
      }
    }
  }
};

const wsdlXml = fs.readFileSync(path.join(__dirname, "wsdl", "passwordService.wsdl"), "utf8");
const server = http.createServer(app);
soap.listen(server, "/soap", service, wsdlXml);

server.listen(PORT, () => {
  console.log(`🧼 SOAP server attivo su http://localhost:${PORT}/soap`);
  console.log(`📄 WSDL accessibile su http://localhost:${PORT}/wsdl`);
});
