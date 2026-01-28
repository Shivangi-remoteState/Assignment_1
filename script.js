let documents = JSON.parse(localStorage.getItem("documents")) || [];
function saveToLocal(){
  localStorage.setItem("documents",JSON.stringify(documents));
}
let editId="";
const dropdownBtn = document.getElementById("user-drop");
const logoutMenu = document.querySelector(".logout-menu");

dropdownBtn.addEventListener("click", () => {
  logoutMenu.style.display =
    logoutMenu.style.display === "block" ? "none" : "block";
});
document.addEventListener("click",(e)=>{
  if(!dropdownBtn.contains(e.target) && !logoutMenu.contains(e.target)){
    logoutMenu.style.display="none"
  }
})

// add document when pressing add button
const addBtn = document.querySelector(".add-btn");
const addDoc = document.querySelector(".addDoc");
//open
addBtn.addEventListener("click",()=>{
    addForm.reset();
    addDoc.style.display ="flex";
})

// cancel
const cancelAdd = document.getElementById("cancelAdd");
cancelAdd.addEventListener("click",()=>{
    addDoc.style.display="none";
})

addDoc.addEventListener("click", (e) => {
  if (e.target === addDoc) {
    addDoc.style.display = "none";
  }
});

//status pending
const docName = document.getElementById("docName");
// console.log(docName.value);
const docStatus = document.getElementById("docStatus");
// console.log(docStatus.value)
const pendingPeopleDiv = document.getElementById("pendingPeopleDiv");

docStatus.addEventListener("change", () => {
  if (docStatus.value === "Pending") {
    pendingPeopleDiv.style.display = "block";
  } else {
    pendingPeopleDiv.style.display = "none";
  }
});


//form
const addForm = document.getElementById("addForm");

addForm.addEventListener("submit",(e)=>{
  e.preventDefault();
  const name= docName.value.trim();
  console.log(name) 
const status=docStatus.value;
// console.log(status);
const pendNum=document.getElementById("pendingCount").value;
// console.log(pendNum)
const pendingCount=(status==="Pending"?pendNum:0);

 if(name=="")
{
  alert("Enter a valid name");
  return;
}

const now = new Date();
const date = now.toLocaleDateString();
const time = now.toLocaleTimeString([],{
  hour:"2-digit",
  minute:"2-digit"
});


if(editId)
{
  const doc = documents.find(d=>d.id === editId);
  doc.name =name;
  doc.status=status;
  doc.pendingCount=pendingCount;
  doc.date = date;
  doc.time=time;
  saveToLocal();
  tbody.innerHTML="";
  loadTable();
  addDoc.style.display="none";
  alert("Updated Successfully");
  editId=null;
  return;
}

const newDocument={
  id:Date.now(),
  name,
  status,
  pendingCount,
  date,
  time
};

documents.push(newDocument);
saveToLocal();
loadTable();
addDoc.style.display="none";
alert("Added Successfully");
})



// table
const tbody = document.querySelector(".doc-table tbody");
function generateRow(doc)
{
  let buttonText ="";
  if(doc.status === "Needs Signing"){
    buttonText="Sign Now";
  }
  if(doc.status === "Pending"){
    buttonText="Preview";
  }
  if(doc.status === "Completed"){
    buttonText="Download PDF";
  }
  // check
  let statusBadge = `<span class="badge ${doc.status.toLowerCase().replace(" ","-")}">${doc.status}</span>`
  let pendingText="";
  if(doc.status ==="Pending"){
    pendingText=`<span class="subtext"><i>Waiting for <b>${doc.pendingCount} persons</b></i></span>`         
  }
  return`<tr data-id="${doc.id}">
            <td><input type="checkbox" /></td>
            <td><a href="#" class="doc-link">${doc.name}</a></td>
            <td>
                ${statusBadge}
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
                  <div class="menu-item edit"><button class="edit-btn">Edit</button></div>
                  <div class="menu-item delete"><button class="delete-btn">Delete</button></div>
                </div>
              </div>
            </td>
          </tr>`
}

//load table
function loadTable(){
  tbody.innerHTML="";
  documents.forEach(doc => {
   tbody.innerHTML += generateRow(doc);

})}


// edit
document.addEventListener("click",(e)=>{
  // console.log(e.target.classList.contains("edit-btn"));
  // const tr = (e.target.closest("tr"));
  // console.log(tr)
  if(e.target.classList.contains("edit-btn")){
    const tr = e.target.closest("tr");
    const id = Number(tr.dataset.id);
    // console.log(id);
    editId=id;
   
    let doc;
    for(let i=0;i<documents.length;i++)
    {
      if(documents[i].id===id)
      {
        doc=documents[i];
        break;
      }
    }
    if (doc.status === "Pending") {
    pendingPeopleDiv.style.display = "block";
  } else {
    pendingPeopleDiv.style.display = "none";
  }

    docName.value = doc.name;
    docStatus.value=doc.status;
    addDoc.style.display="flex";

  }
})

// delete
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) {

    const tr = e.target.closest("tr");
    const id = Number(tr.dataset.id);

    documents = documents.filter(doc => doc.id !== id);

    saveToLocal();
    tbody.innerHTML="";
    loadTable();
    alert("Deleted successfully")
  }
});
// search bar
function searchDoc(searchText){
  searchText = searchText.toLowerCase();
  const filtered =documents.filter(doc=>{
    const myName = doc.name.toLowerCase().includes(searchText);
    const myStatus =doc.status.toLowerCase().includes(searchText);
    const myDate = (doc.date || "").toLowerCase().includes(searchText);

    return myName || myStatus || myDate;
  })
  tbody.innerHTML="";
  filtered.forEach(doc=>{
  tbody.innerHTML+=generateRow(doc);
})
}

const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("input", function () {
  searchDoc(this.value);
});
window.addEventListener("DOMContentLoaded", loadTable);