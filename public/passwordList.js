/*
// ELEMENTI HTML
let btnAddPass = document.getElementById("btnAddPass");
let addPasswordPopup = document.getElementById("addPasswordPopup");
let btnCloseForm = document.getElementById("btnCloseForm");
let credentialsContainer = document.getElementById("credentialsContainer");
let credentialsAsPopup = document.getElementById("credentialAsPopup");
let btnClearPass = document.getElementById("btnClearPass");
const form = document.getElementById("dataForm");

let jsonElement = [];

// CARICA PASSWORD DAL SERVER
function loadPasswords() {
  fetch('http://localhost:3000/passwords')
    .then(res => res.json())
    .then(data => {
      jsonElement = data;
      credentialsContainer.innerHTML = '';
      jsonElement.forEach((element, index) => {
        createDiv("div", element, index);
      });
    })
    .catch(err => console.error('Errore nel caricamento:', err));
}

// CREA DIV PER OGNI PASSWORD
function createDiv(type, element, index) {
  let returnedDiv = fillDiv(type, element, index);
  let btnRemovePass = document.createElement("button");

  btnRemovePass.classList = "btnRemovePass";
  btnRemovePass.innerText = "Remove";
  returnedDiv.appendChild(btnRemovePass);
  credentialsContainer.appendChild(returnedDiv);

  btnRemovePass.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    fetch(`http://localhost:3000/passwords/${element.id}`, {
      method: 'DELETE'
    })
      .then(res => {
        if (res.ok) loadPasswords();
        else alert('Errore nella rimozione');
      })
      .catch(err => {
        console.error('Errore nel DELETE:', err);
        alert('Errore nel server');
      });
  });

  returnedDiv.addEventListener("click", () => {
    divAsPopup("div", element, index);
  });

  return returnedDiv;
}

// MOSTRA POPUP CON DETTAGLI
function divAsPopup(type, element, index) {
  let divPopup = document.createElement("div");
  let btnClosePopup = document.createElement("button");
  let btnSaveChanges = document.createElement("button");

  btnClosePopup.innerText = "Close";
  btnClosePopup.classList = "btnClosePopup";

  btnSaveChanges.innerText = "Salva modifiche";
  btnSaveChanges.classList = "btnSaveChanges";

  // ELEMENTI FORM MODIFICA
  let nameCredentialsPopup = document.createElement("h4");
  nameCredentialsPopup.textContent = element.nameCredentials;

  let labelUserPopup = document.createElement("label");
  labelUserPopup.textContent = "User o Email";

  let userPopup = document.createElement("input");
  userPopup.type = "text";
  userPopup.value = element.user;

  let labelPasswordPopup = document.createElement("label");
  labelPasswordPopup.textContent = "Password";

  let passwordPopup = document.createElement("input");
  passwordPopup.type = "text";
  passwordPopup.value = element.password;

  // POPUP STYLE
  divPopup.type = type;
  divPopup.classList.add("divPopup");
  divPopup.append(
    nameCredentialsPopup,
    labelUserPopup,
    userPopup,
    labelPasswordPopup,
    passwordPopup,
    btnSaveChanges,
    btnClosePopup
  );
  credentialsAsPopup.appendChild(divPopup);

  // BLOCCO INTERAZIONI SOTTOSTANTI
  containerList.style.pointerEvents = "none";
  btnClearPass.style.pointerEvents = "none";

  // CHIUSURA POPUP
  btnClosePopup.addEventListener("click", () => {
    divPopup.remove();
    containerList.style.pointerEvents = "auto";
    btnClearPass.style.pointerEvents = "auto";
  });

  // SALVA MODIFICHE
  btnSaveChanges.addEventListener("click", () => {
    const updated = {
      nameCredentials: nameCredentialsPopup.textContent,
      user: userPopup.value,
      password: passwordPopup.value
    };
    updatePassword(element.id, updated);
  });
}

// CREA DIV LISTA PRINCIPALE
function fillDiv(type, element, index) {
  let newDiv = document.createElement("div");
  newDiv.classList.add("returnedDiv");

  ["nameCredentials", "user", "password"].forEach(key => {
    let h1 = document.createElement("h1");
    h1.textContent = element[key];
    if (key !== "nameCredentials") h1.style.display = "none";
    newDiv.appendChild(h1);
  });

  return newDiv;
}

// SUBMIT FORM AGGIUNTA PASSWORD
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const myFormData = new FormData(e.target);
  const nameCredentials = myFormData.get("nameCredentials");
  const user = myFormData.get("user");
  const password = myFormData.get("password");

  validatePasswordSOAP(password, isValid => {
    if (!isValid) {
      alert("❌ Password non sicura! Deve avere almeno 8 caratteri, una maiuscola, un numero e un simbolo.");
      return;
    }

    const formDataObj = { nameCredentials, user, password };

    fetch("http://localhost:3000/passwords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formDataObj)
    })
      .then(response => response.json())
      .then(newPassword => {
        loadPasswords(); // Ricarica tutto
        form.reset();
      })
      .catch(err => {
        console.error("Errore durante il salvataggio:", err);
        alert("Errore durante il salvataggio");
      });
  });
});

// UPDATE PASSWORD
function updatePassword(id, updatedData) {
  fetch(`http://localhost:3000/passwords/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedData)
  })
    .then(res => {
      if (!res.ok) throw new Error("Errore update");
      return res.json();
    })
    .then(() => loadPasswords())
    .catch(err => {
      console.error("Errore:", err);
      alert("Errore durante aggiornamento");
    });
}

// VALIDAZIONE PASSWORD via SOAP
function validatePasswordSOAP(password, callback) {
  const url = "http://localhost:8001/wsdl";
  const xml = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                      xmlns:urn="urn:PasswordService">
      <soapenv:Body>
        <urn:checkPasswordSecurity>
          <password>${password}</password>
        </urn:checkPasswordSecurity>
      </soapenv:Body>
    </soapenv:Envelope>`;

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      "SOAPAction": "checkPasswordSecurity"
    },
    body: xml
  })
    .then(response => response.text())
    .then(xml => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const result = doc.getElementsByTagName("result")[0].textContent;
      callback(result === "true");
    })
    .catch(err => {
      console.error("Errore SOAP:", err);
      callback(false);
    });
}

// POPUP FORM APERTURA E CHIUSURA
btnAddPass.addEventListener("click", (e) => {
  e.preventDefault();
  addPasswordPopup.style.display = "flex";
  containerList.style.pointerEvents = "none";
  btnClearPass.style.pointerEvents = "none";
});

btnCloseForm.addEventListener("click", () => {
  addPasswordPopup.style.display = "none";
  containerList.style.pointerEvents = "auto";
  btnClearPass.style.pointerEvents = "auto";
});

// CLEAR PASSWORDS
btnClearPass.addEventListener("click", () => {
  fetch('http://localhost:3000/passwords', { method: 'DELETE' })
    .then(res => {
      if (res.ok) loadPasswords();
      else alert('Errore nella pulizia');
    })
    .catch(err => {
      console.error('Errore nel DELETE:', err);
      alert('Errore server');
    });
});

// CARICA PASSWORD AL LOAD
window.addEventListener("load", loadPasswords);
*/







// ELEMENTI HTML
let btnAddPass = document.getElementById("btnAddPass");
let addPasswordPopup = document.getElementById("addPasswordPopup");
let btnCloseForm = document.getElementById("btnCloseForm");
let credentialsContainer = document.getElementById("credentialsContainer");
let credentialsAsPopup = document.getElementById("credentialAsPopup");
let btnClearPass = document.getElementById("btnClearPass");
const form = document.getElementById("dataForm");

let jsonElement = [];

// CARICA PASSWORD DAL SERVER
function loadPasswords() {
  fetch('http://localhost:3000/passwords')
    .then(res => res.json())
    .then(data => {
      jsonElement = data;
      credentialsContainer.innerHTML = '';
      jsonElement.forEach((element, index) => {
        createDiv("div", element, index);
      });
    })
    .catch(err => console.error('Errore nel caricamento:', err));
}

// CREA DIV PER OGNI PASSWORD
function createDiv(type, element, index) {
  let returnedDiv = fillDiv(type, element, index);
  let btnRemovePass = document.createElement("button");

  btnRemovePass.classList = "btnRemovePass";
  btnRemovePass.innerText = "Remove";
  returnedDiv.appendChild(btnRemovePass);
  credentialsContainer.appendChild(returnedDiv);

  btnRemovePass.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    fetch(`http://localhost:3000/passwords/${element.id}`, {
      method: 'DELETE'
    })
      .then(res => {
        if (res.ok) loadPasswords();
        else alert('Errore nella rimozione');
      })
      .catch(err => {
        console.error('Errore nel DELETE:', err);
        alert('Errore nel server');
      });
  });

  returnedDiv.addEventListener("click", () => {
    divAsPopup("div", element, index);
  });

  return returnedDiv;
}

// MOSTRA POPUP CON DETTAGLI
function divAsPopup(type, element, index) {
  let divPopup = document.createElement("div");
  let btnClosePopup = document.createElement("button");
  let btnSaveChanges = document.createElement("button");

  btnClosePopup.innerText = "Close";
  btnClosePopup.classList = "btnClosePopup";

  btnSaveChanges.innerText = "Salva modifiche";
  btnSaveChanges.classList = "btnSaveChanges";

  // ELEMENTI FORM MODIFICA
  let nameCredentialsPopup = document.createElement("h4");
  nameCredentialsPopup.textContent = element.nameCredentials;

  let labelUserPopup = document.createElement("label");
  labelUserPopup.textContent = "User o Email";

  let userPopup = document.createElement("input");
  userPopup.type = "text";
  userPopup.value = element.user;

  let labelPasswordPopup = document.createElement("label");
  labelPasswordPopup.textContent = "Password";

  let passwordPopup = document.createElement("input");
  passwordPopup.type = "text";
  passwordPopup.value = element.password;

  // POPUP STYLE
  divPopup.type = type;
  divPopup.classList.add("divPopup");
  divPopup.append(
    nameCredentialsPopup,
    labelUserPopup,
    userPopup,
    labelPasswordPopup,
    passwordPopup,
    btnSaveChanges,
    btnClosePopup
  );
  credentialsAsPopup.appendChild(divPopup);

  containerList.style.pointerEvents = "none";
  btnClearPass.style.pointerEvents = "none";

  btnClosePopup.addEventListener("click", () => {
    divPopup.remove();
    containerList.style.pointerEvents = "auto";
    btnClearPass.style.pointerEvents = "auto";
  });

  btnSaveChanges.addEventListener("click", () => {
    const updated = {
      nameCredentials: nameCredentialsPopup.textContent,
      user: userPopup.value,
      password: passwordPopup.value
    };
    updatePassword(element.id, updated);
  });
}

// CREA DIV LISTA PRINCIPALE
function fillDiv(type, element, index) {
  let newDiv = document.createElement("div");
  newDiv.classList.add("returnedDiv");

  ["nameCredentials", "user", "password"].forEach(key => {
    let h1 = document.createElement("h1");
    h1.textContent = element[key];
    if (key !== "nameCredentials") h1.style.display = "none";
    newDiv.appendChild(h1);
  });

  return newDiv;
}

// SUBMIT FORM AGGIUNTA PASSWORD
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const myFormData = new FormData(e.target);
  const nameCredentials = myFormData.get("nameCredentials");
  const user = myFormData.get("user");
  const password = myFormData.get("password");

 if (!nameCredentials || !user || !password) {
    alert("⚠️ Tutti i campi sono obbligatori.");
    return;
  }

  validatePasswordSOAP(password, isValid => {
    if (!isValid) {
      alert("❌ Password non sicura! Deve avere almeno 8 caratteri, una maiuscola, un numero e un simbolo.");
      return;
    }

    const formDataObj = { nameCredentials, user, password };

    fetch("http://localhost:3000/passwords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formDataObj)
    })
    //.then(response => response.text())  
    .then(response => response.json())
      .then(newPassword => {
        loadPasswords(); // Ricarica tutto
        form.reset();
      })
      .catch(err => {
        console.error("Errore durante il salvataggio:", err);
        alert("Errore durante il salvataggio");
      });
  });
});


// ✅ VALIDAZIONE PASSWORD via BACKEND (non più direttamente SOAP)
function validatePasswordSOAP(password, callback) {
  fetch("http://localhost:3000/validate-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ password })
  })
    .then(res => res.json())
    .then(data => {
      callback(data.result === true);
    })
    .catch(err => {
      console.error("Errore chiamata REST:", err);
      callback(false);
    });
}


// UPDATE PASSWORD
function updatePassword(id, updatedData) {
  fetch(`http://localhost:3000/passwords/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedData)
  })
    .then(res => {
      if (!res.ok) throw new Error("Errore update");
      return res.json();
    })
    .then(() => loadPasswords())
    .catch(err => {
      console.error("Errore:", err);
      alert("Errore durante aggiornamento");
    });
}


// POPUP FORM APERTURA E CHIUSURA
btnAddPass.addEventListener("click", (e) => {
  e.preventDefault();
  addPasswordPopup.style.display = "flex";
  containerList.style.pointerEvents = "none";
  btnClearPass.style.pointerEvents = "none";
});

btnCloseForm.addEventListener("click", () => {
  addPasswordPopup.style.display = "none";
  containerList.style.pointerEvents = "auto";
  btnClearPass.style.pointerEvents = "auto";
});

// CLEAR PASSWORDS
btnClearPass.addEventListener("click", () => {
  fetch('http://localhost:3000/passwords', { method: 'DELETE' })
    .then(res => {
      if (res.ok) loadPasswords();
      else alert('Errore nella pulizia');
    })
    .catch(err => {
      console.error('Errore nel DELETE:', err);
      alert('Errore server');
    });
});

// CARICA PASSWORD AL LOAD
window.addEventListener("load", loadPasswords);



