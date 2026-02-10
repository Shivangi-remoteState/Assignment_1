interface Documents {
  id: number;
  name: string;
  status: string;
  pendingCount: number;
  date: string;
  time: string;
}

let editId: number|null = null;

let documents: Documents[] = JSON.parse(localStorage.getItem("documents") || "[]");
function saveToLocal(): void {
  localStorage.setItem("documents", JSON.stringify(documents));
}

const dropDownBtn =<HTMLButtonElement> document.querySelector(".dropdown");
const logOutMenu = <HTMLElement>document.querySelector(".logout-menu");

if(dropDownBtn){
  dropDownBtn.addEventListener("click", () => {
  if (logOutMenu.style.display === "block") {
    logOutMenu.style.display = "none";
  } else {
    logOutMenu.style.display = "block";
  }
});
}

document.addEventListener("click", (e:MouseEvent) => {
  const target = <HTMLElement>e.target;
  // console.log(target);
  const clickDropBtn:boolean = dropDownBtn.contains(target);
  const clickLogBtn:boolean = logOutMenu.contains(target);

  if (!clickDropBtn && !clickLogBtn) {
    logOutMenu.style.display = "none";
  }
});

// add doc when clicking add button
const addBtn = <HTMLButtonElement>document.querySelector(".add-btn");
const addDoc = <HTMLElement>document.querySelector(".addDoc");

if(addBtn){
  addBtn.addEventListener("click", () => {
  addDoc.style.display = "flex";
});
}

// cancel
const cancelForm =<HTMLElement> document.getElementById("cancelAdd");
if(cancelForm){
  cancelForm.addEventListener("click", () => {
  addDoc.style.display = "none";
});
}

addDoc.addEventListener("click", (e:MouseEvent) => {
  const target = <HTMLElement>e.target;
  if (target === addDoc) {
    addDoc.style.display = "none";
  }
});

// pending status
const docStatus = <HTMLInputElement>document.getElementById("docStatus");
const pendingPeopleDiv =<HTMLElement> document.getElementById("pendingPeopleDiv");
docStatus.addEventListener("change", () => {
  if (docStatus.value === "Pending") {
    pendingPeopleDiv.style.display = "block";
  } else {
    pendingPeopleDiv.style.display = "none";
  }
});

const docName =<HTMLInputElement> document.getElementById("docName");
// form
const addForm = <HTMLFormElement>document.getElementById("addForm");
addForm.addEventListener("submit", (e:SubmitEvent) => {
  e.preventDefault();
  const name = docName.value.trim();
  const status = docStatus.value;
  const pendcount = <HTMLInputElement>document.getElementById("pendingCount");
  const pentcountval = pendcount.value;
  const pendingCount = status === "Pending" ? Number(pentcountval) : 0;

  if (name == "") {
    alert("Please enter a valid name");
    return;
  }
  const d = new Date();
  const date = d.toLocaleDateString();
  const time = d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (editId) {
    const doc = documents.find((d) => d.id === editId);
    if (doc) {
      doc.name = name;
      doc.status = status;
      doc.pendingCount = pendingCount;
      doc.date = date;
      doc.time = time;
      saveToLocal();
      load();
      addDoc.style.display = "none";
      alert("Document updated successfully");
      editId = null;
      return;
    }
  }

  const newDoc = {
    id: Date.now(),
    name,
    status,
    pendingCount,
    date,
    time,
  };
  documents.push(newDoc);
  saveToLocal();
  load();
  addForm.reset();
  addDoc.style.display = "none";
  alert("Document added successfully");
});

// row
const tbody =<HTMLTableSectionElement> document.querySelector(".doc-table tbody");
function generateTableRow(doc: Documents):string {
  let buttonText: string = "";
  if (doc.status === "Needs Signing") {
    buttonText = "Sign Now";
  }
  if (doc.status === "Pending") {
    buttonText = "Preview";
  }
  if (doc.status === "Completed") {
    buttonText = "Download PDF";
  }
  let badge = `<span class="badge ${doc.status.toLowerCase().replace(" ", "-")}">${doc.status}</span>`;
  let pendingText: string = "";
  if (doc.status === "Pending") {
    pendingText = `<span class="subtext"><i>Waiting for <b>${doc.pendingCount}</b></i></span>`;
  }
  return `<tr data-id = ${doc.id}>
            <td><input type="checkbox" /></td>
            <td><a href="#" class="doc-link">${doc.name}</a></td>
            <td>
              ${badge}
              <br>
              ${pendingText}
            </td>
            <td>
              <div class="last-date">${doc.date}</div>
              <span class="time">${doc.time}</span>
            </td>
            <td class="action-btn-cell">
              <button class="btn">${buttonText}</button>
            </td>
            <td class="action-menu-cell">
              <div class="menu">
                <button class="dots">
                  <img src="./images/more-vertical.svg" alt="">
                </button>
                <div class="menu-dropdown">
                  <div class="menu-item edit">Edit</div>
                  <div class="menu-item delete">Delete</div>
                </div>
              </div>
            </td>
          </tr>`;
}

// loading table
function load() {
  tbody.innerHTML = "";
  documents.forEach((doc) => {
    tbody.innerHTML += generateTableRow(doc);
  });
}
load();

// edit
document.addEventListener("click", (e:MouseEvent) => {
  //    console.log(e)
  const target =<HTMLElement> e.target ;
  //    console.log(target.classList.contains("menu-item"))
  //   const tr = target.closest("tr");
  //   console.log(target.closest("tr"))
  if (target.classList.contains("edit")) {
    const tr = <HTMLElement>target.closest("tr");
    const id = Number(tr.dataset.id);
    editId = id;
    const doc = documents.find((d) => d.id === id);
    if (doc) {
      if (doc.status === "Pending") {
        pendingPeopleDiv.style.display = "block";
      } else {
        pendingPeopleDiv.style.display = "none";
      }
      docName.value = doc.name;
      docStatus.value = doc.status;
    }
    addDoc.style.display = "flex";
  }
});


// delete
document.addEventListener("click",(e:MouseEvent)=>{
    const target =<HTMLElement> e.target;
    if(target.classList.contains("delete")){
        const tr = <HTMLElement>target.closest("tr");
        const id = Number(tr.dataset.id)

        documents = documents.filter((doc)=>doc.id !==id)
        saveToLocal();
        tbody.innerHTML ="";
        load();
        alert("Document deleted successfully")
    }
})

// search
const searchInp =<HTMLInputElement> document.querySelector("#searchInput")
function search(searchText:string){
    searchText = searchText.toLowerCase();
    const filterDoc = documents.filter((doc)=>{
        const myName:boolean= doc.name.toLowerCase().includes(searchText)
        const myStatus:boolean = doc.status.toLowerCase().includes(searchText)
        const myDate:boolean = doc.date.toLowerCase().includes(searchText)
        return myName || myStatus || myDate;
    })
    tbody.innerHTML ="";
    filterDoc.forEach((doc)=>{
        tbody.innerHTML += generateTableRow(doc)
    })
}
searchInp.addEventListener("input",()=>{
    search(searchInp.value);
})


