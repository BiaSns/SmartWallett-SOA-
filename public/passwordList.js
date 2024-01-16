//Assegno alla variabile il contenuto dell'array passato dal LocalStorage
elements = localStorage.getItem("elements"); //Creo una variabile che conterrà l'array elements(di oggetti)

//Variabili
let jsonElement = [];
//Usata per funzione "Export"
let csv;
//Variabili usate per funzione "List"
let jsonString;
let list;


//Struttura di controllo per gestire errori in caso l'array fosse vuoto
if (elements != null && elements != []) {
  jsonElement = JSON.parse(elements);
}

//Elementi presi dall'Html
let btnAddPass = document.getElementById("btnAddPass");
let addPasswordPopup = document.getElementById("addPasswordPopup");
let btnCloseForm = document.getElementById("btnCloseForm");
let credentialsContainer = document.getElementById("credentialsContainer");
let credentialsAsPopup = document.getElementById("credentialAsPopup");
let btnClear = document.getElementById("btnClearPass");
let btnExport = document.getElementById("btnExport");
let containerList = document.getElementById("containerList");
let btnList = document.getElementById("btnList");




//FUNZIONI PRINCIPALI

//Per ogni elemento(oggetto) dell'array chiamo la funzione createDiv che chiamerà a sua volta altre functions
jsonElement && //Condizione in linea (se jsonElement non è null quindi true)
  jsonElement.forEach((element, index) => {
    createDiv("div", element, index);
  });

function createDiv(type, element, index) {
  let returnedDiv = fillDiv(type, element, index);
  let btnRemovePass = document.createElement("button");

  btnRemovePass.classList = "btnRemovePass";
  btnRemovePass.innerText = "Remove";
  returnedDiv.appendChild(btnRemovePass);
  credentialsContainer.appendChild(returnedDiv);

  btnRemovePass.addEventListener("click", (e) => {
    e.preventDefault();
    //Fondamentale per rendere indipendente il bottone remove(Prima sull'onclick attivava anche il div Popup)
    e.stopPropagation();
    //Splice serve ad eliminare dall'array.(p,p)
    //Il 1 parametro(index) indica quale eliminare, il secondo(1) indica quanti elementi.
    jsonElement.splice(index, 1);
    localStorage.setItem("elements", JSON.stringify(jsonElement));
    location.reload();
  });

  returnedDiv.addEventListener("click", () => {
    divAsPopup("div", element, index);
  });
  return returnedDiv;
}

function divAsPopup(type, element, index) {
  let divPopup = document.createElement("div");
  let indexElementPopup = document.createElement("h1");
  let indexTextPopup = document.createTextNode(index);

  let btnClosePopup = document.createElement("button");
  btnClosePopup.innerText = "Close";
  btnClosePopup.classList = "btnClosePopup";
  divPopup.appendChild(btnClosePopup);

  let nameCredentialsPopup = document.createElement("h4");
  let nameCredentialsPopupText = document.createTextNode(
    element.nameCredentials
  );
  nameCredentialsPopup.appendChild(nameCredentialsPopupText);

  let userPopup = document.createElement("input");
  let labelUserPopup = document.createElement("label");
  let labelUserPopupText = document.createTextNode("User o Email");
  labelUserPopup.appendChild(labelUserPopupText);

  userPopup.setAttribute("type", "text");
  userPopup.setAttribute("value", element.user);

  let passwordPopup = document.createElement("input");
  let labelPasswordPopup = document.createElement("label");
  let labelPasswordPopupText = document.createTextNode("Password");
  labelPasswordPopup.appendChild(labelPasswordPopupText);

  passwordPopup.setAttribute("type", "text");
  passwordPopup.setAttribute("value", element.password);

  divPopup.type = type;
  divPopup.value = element.nameCredentials; //Nome del nuovo elemento creato
  divPopup.classList.add("divPopup");
  divPopup.appendChild(nameCredentialsPopup); //Inserisco nome al div
  divPopup.appendChild(labelUserPopup);
  divPopup.appendChild(userPopup); //Inserisco user al div
  divPopup.appendChild(labelPasswordPopup);
  divPopup.appendChild(passwordPopup); //Inserisco password al div
  divPopup.appendChild(btnClosePopup);
  indexElementPopup.appendChild(indexTextPopup);
  divPopup.appendChild(indexElementPopup);
  credentialsAsPopup.appendChild(divPopup);
  indexElementPopup.style.display = "none";
  containerList.style.pointerEvents = "none";
  btnExport.style.pointerEvents = "none";
  btnClearPass.style.pointerEvents = "none";

  btnClosePopup.addEventListener("click", (e) => {
    e.preventDefault();
    divPopup.remove(index);
    containerList.style.pointerEvents = "auto";
    btnExport.style.pointerEvents = "auto";
    btnClearPass.style.pointerEvents = "auto";
  });
}

//La funzione serve a creare un nuovo div nel momento in cui viene richiamata
function fillDiv(type, element, index) {
  let newDiv = document.createElement("div");
  let nameCredentials = document.createElement("h1");
  let nameText = document.createTextNode(element.nameCredentials);
  let user = document.createElement("h1");
  let userText = document.createTextNode(element.user);
  let password = document.createElement("h1");
  let passText = document.createTextNode(element.password);
  let indexElement = document.createElement("h1");
  let indexText = document.createTextNode(index);

  newDiv.type = type;
  newDiv.value = element.nameCredentials; //Nome del nuovo elemento creato
  nameCredentials.appendChild(nameText);
  user.appendChild(userText);
  password.appendChild(passText);
  indexElement.appendChild(indexText);
  newDiv.appendChild(nameCredentials); //Inserisco nome al div
  newDiv.appendChild(user); //Inserisco user al div
  newDiv.appendChild(password); //Inserisco password al div
  newDiv.appendChild(indexElement);
  newDiv.classList.add("returnedDiv"); //Setto class="returnedDiv"

  //Imposto user e password nascosti
  user.style.display = "none";
  password.style.display = "none";
  indexElement.style.display = "none";

  //Ritorno il div che userò in function createDiv
  return newDiv;
}





//Event Listeners
  
//Evento che esegue la pulizia dei dati salvati in locale
btnClear.addEventListener("click", () => {
  localStorage.setItem("elements", []); //Setto elements come array vuoto
  location.reload(); //Avvia il refresh
});

//Bottoni per visualizzazione form stile popup
btnAddPass.addEventListener("click", (e) => {
  e.preventDefault();
  addPasswordPopup.style.display = "flex";
  containerList.style.pointerEvents = "none";
  btnExport.style.pointerEvents = "none";
  btnClearPass.style.pointerEvents = "none";
});

btnCloseForm.addEventListener("click", () => {
  addPasswordPopup.style.display = "none";
  containerList.style.pointerEvents = "auto";
  btnExport.style.pointerEvents = "auto";
  btnClearPass.style.pointerEvents = "auto";
});

btnExport.addEventListener("click", () => {
  credentialsToCsv();
 try {
    //Chiamata AJAX usando API Fetch
    fetch('/csvZip', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({csv}),
    })
    .then(function (response) {
        
        //Leggi header archive-password -> password per aprire il file ZIP cifrato
        password = response.headers.get('archive-password');
        
        return response.blob();
    })
    .then(function (blob) {
        
        //Crea bottone temporaneo per trigger download
        var a = document.createElement("a");
        a.href = window.URL.createObjectURL(blob);
        a.download = "Credentials";
  
        //Click bottone per far partire il download
        a.click();
        
        //Rimuovi bottone
        a.remove();
    })
    .catch(function(error) {
        
        console.log(error);
  
    });
  
  } catch(error){
    console.log(error);
  }

});

//CREAZIONE LISTA PASSWORD SCARICABILE(JSON), RIEMPITA DALLA VARIABILE INVIATA AL SERVER E RISPEDITA AL CLIENT.
btnList.addEventListener("click", async () => {
  jsonString = JSON.stringify(jsonElement, null, 2);

  try {
    await sendList(); // Effettua la prima chiamata POST
    console.log("First call completed.");

    await getList(); // Effettua la seconda chiamata GET
    console.log("Second call completed.", jsonString);
  } catch (error) {
    console.error("Error:", error.message);
  }
});




//Funzioni AJAX usando XMLHTTpRequest per interrogazione e restituzione dati in JSON

async function sendList() {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = "/savePasswordList";
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          console.log("List sent.");
          resolve();
        } else {
          reject(
            new Error(`Error in first call: ${xhr.status} ${xhr.statusText}`)
          );
        }
      }
    };

    //jsonString = JSON.stringify(jsonElement, null, 2);
    xhr.send(jsonString);
  });
}

async function getList() {
  return new Promise((resolve, reject) => {
    const xhr1 = new XMLHttpRequest();
    const url = "/savePasswordList";
    xhr1.open("GET", url, true);
    xhr1.setRequestHeader("Content-Type", "application/json");

    xhr1.onreadystatechange = function () {
      if (xhr1.readyState === XMLHttpRequest.DONE) {
        if (xhr1.status === 200) {
          list = JSON.parse(xhr1.responseText);
          jsonString = list;
          console.log("Received!");
          downloadList();
          resolve();
        } else {
          reject(
            new Error(`Error in second call: ${xhr1.status} ${xhr1.statusText}`)
          );
        }
      }
    };

    xhr1.send();
  });
}



//Altre funzioni

function downloadList() {
  // Crea un elemento "a" e simula un clic per avviare il download.
  const a = document.createElement("a");
  const blob = new Blob([JSON.stringify(list)], { type: "application/json" });
  const url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = "passwordList.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}


function credentialsToCsv() {
  //Object.keys -> restituisce le chiavi dell'oggetto dato
  const elementsKeys = [Object.keys(elements[0])];
  //Concatena le keys separandole con una virgola
  const concatenatedArray = elementsKeys.concat(elements); 
  csv = concatenatedArray
    .map((element) => {
      //crea un csv mappando per ogni elemento i valori delle chiavi dell'oggetto(element) parsando con toString()
      return Object.values(element).toString();
    }).join("---");
}