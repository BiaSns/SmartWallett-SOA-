const BASE_URL = location.hostname === "localhost"
  ? "http://localhost:3000"
  : "https://yoursmartwallett.onrender.com";



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
  fetch(`${BASE_URL}/passwords`)
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


function createDiv(type, element, index) {
  let returnedDiv = fillDiv(type, element, index);
  let btnRemovePass = document.createElement("button");

  btnRemovePass.classList = "btnRemovePass";
  btnRemovePass.innerText = "Remove";

  
  btnRemovePass.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation(); // ❗️Evita che venga attivato anche il popup

    if (confirm(`Vuoi davvero rimuovere "${element.nameCredentials}"?`)) {
      fetch(`${BASE_URL}/passwords/${element.id}`, {
        method: 'DELETE'
      })
        .then(res => {
          if (!res.ok) throw new Error("Errore nella rimozione");
          return res.json();
        })
        .then(() => {
          loadPasswords(); // 🔁 Aggiorna la lista dopo la rimozione
        })
        .catch(err => {
          console.error('Errore nel DELETE:', err);
          alert('Errore durante la rimozione');
        });
    }
  });

  returnedDiv.appendChild(btnRemovePass);
  credentialsContainer.appendChild(returnedDiv);

  // 👇 Questo apre il popup al click sul div, MA non se clicchi su "Remove"
  returnedDiv.addEventListener("click", () => {
    divAsPopup("div", element, index);
  });

  return returnedDiv;
}


// CREA DIV COME POPUP
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
  passwordPopup.type = "password";
  passwordPopup.value = element.password;
  passwordPopup.style.cursor = "pointer";

  // Evento mouseover → mostra password
passwordPopup.addEventListener("mouseover", () => {
  passwordPopup.type = "text";
});

// Evento mouseout → torna a nasconderla
passwordPopup.addEventListener("mouseout", () => {
  passwordPopup.type = "password";
});

  let divButtons = document.createElement("div");
//divButtons.classList.add("popupButtonsContainer"); // classe per lo stile
divButtons.appendChild(btnSaveChanges);
divButtons.appendChild(btnClosePopup);
  
// POPUP STYLE
  divPopup.type = type;
  divPopup.classList.add("divPopup");
  divPopup.append(
    nameCredentialsPopup,
    labelUserPopup,
    userPopup,
    labelPasswordPopup,
    passwordPopup,
    divButtons,
  );
  
  credentialsAsPopup.appendChild(divPopup);

  containerList.style.pointerEvents = "none";
  btnClearPass.style.pointerEvents = "none";

  // CHIUDI POPUP
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

    if (!updated.user || !updated.password) {
      alert("⚠️ I campi User e Password non possono essere vuoti.");
      return;
    }
    console.log("🔄 Payload PUT:", updated);

    // Verifica password sicura
    validatePasswordSOAP(updated.password, isValid => {
      if (!isValid) {
        alert("❌ Password non sicura! Deve avere almeno 8 caratteri, una maiuscola, un numero e un simbolo.");
        return;
      }

      // Password ok, aggiorna
      fetch(`${BASE_URL}/passwords/${element.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),

      })
        /*.then(res => {
          if (!res.ok) throw new Error("Errore update");
          return res.json();
        })*/
         .then(res => {
         if (!res.ok) {
         // ⛔️ LOG DETTAGLIATO
        return res.text().then(text => {
        console.error("❌ PUT non riuscita:", res.status, text);
        throw new Error("Errore update");
      });
    }
    return res.json();
  })
        .then(() => {
          loadPasswords();
          divPopup.remove(); // chiusura popup SOLO dopo aggiornamento OK
          containerList.style.pointerEvents = "auto";
          btnClearPass.style.pointerEvents = "auto";
        })
        .catch(err => {
          console.error("Errore:", err);
          alert("Errore durante aggiornamento");
        });
    });
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

    fetch(`${BASE_URL}/passwords`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formDataObj)
    })
    //.then(response => response.text())  
    .then(response => response.json())
      .then(newPassword => {
        loadPasswords(); // Ricarica tutto
        form.reset();
         addPasswordPopup.style.display = "none"; // 👈 chiude il popup
         containerList.style.pointerEvents = "auto";
         btnClearPass.style.pointerEvents = "auto";
      })
      .catch(err => {
        console.error("Errore durante il salvataggio:", err);
        alert("Errore durante il salvataggio");
      });
  });
});



// VALIDAZIONE PASSWORD
function validatePasswordSOAP(password, callback) {
  fetch(`${BASE_URL}/validate-password`, {
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
  fetch(`${BASE_URL}/passwords`, { method: 'DELETE' })
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



