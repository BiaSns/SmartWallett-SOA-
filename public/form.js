/*let elements = [];
let checkLocal = localStorage.getItem("elements");
//Struttura di controllo
if (checkLocal != null && checkLocal!= []) {//Inizio con l'array preso in locale Attenzione if null evitare!
  elements = JSON.parse(localStorage.getItem("elements")); //Ogni volta che vado a prendere la variabile devo controllare se è null
}
*/

/*
const form = document.getElementById("dataForm");

function createCredentials(elements) {
  //Contengo tutto in una funzione createCredentials() per questione di chiarezza

  form.addEventListener("submit", (e) => {
   
    e.preventDefault(); //Serve a non riaggiornare subito dopo il submit
    const myFormData = new FormData(e.target);
    const nameCredentials = myFormData.get("nameCredentials");
    const user = myFormData.get("user");
    const password = myFormData.get("password");
    const formDataObj = Object.fromEntries(myFormData.entries()); //Creo un nuovo oggetto usando la API FormData
    form.reset(); //Pulisce i campi dopo il submit
    elements.push(formDataObj); //Inserisco l'oggetto nell'array
    location.reload(); //Avvia il refresh automatico dopo il submit
    
    //La utilizzo per passare variabili in locale
    localStorage.setItem("elements", JSON.stringify(elements)); 
    
  });
}
createCredentials(elements);
*/



