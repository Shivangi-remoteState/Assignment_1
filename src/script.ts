interface FileDocument {
  id: number;
  name: string;
  status: StatusType;
  pendingCount: number;
  date: string;
  time: string;
}
type StatusType = "Needs Signing" | "Pending" | "Completed";
const STATUS = {
  "Needs Signing": {
    button: "Sign Now",
    className: "needs-signing",
  },
  "Pending": {
    button: "Preview",
    className: "pending",
  },
 "Completed": {
    button: "Download PDF",
    className: "completed",
  },
};
let editId: number | null = null;

let documents: FileDocument[] = JSON.parse(
  localStorage.getItem("documents") || "[]",
);
function saveToLocal() {
  localStorage.setItem("documents", JSON.stringify(documents));
}

const dropDownBtn = document.querySelector(".dropdown") as HTMLButtonElement;
const logOutMenu = document.querySelector(".logout-menu") as HTMLElement;

if (dropDownBtn) {
  dropDownBtn.addEventListener("click", () => {
    if (logOutMenu.style.display === "block") {
      logOutMenu.style.display = "none";
    } else {
      logOutMenu.style.display = "block";
    }
  });
}

document.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  const clickDropBtn = dropDownBtn.contains(target);
  const clickLogBtn = logOutMenu.contains(target);

  if (!clickDropBtn && !clickLogBtn) {
    logOutMenu.style.display = "none";
  }
});

const addBtn = document.querySelector(".add-btn");
const addDoc = document.querySelector(".addDoc") as HTMLElement;

if (addBtn) {
  addBtn.addEventListener("click", () => {
    if (addDoc) {
      addDoc.style.display = "flex";
    }
  });
}

const cancelForm = document.getElementById("cancelAdd");
if (cancelForm) {
  cancelForm.addEventListener("click", () => {
    if (addDoc) {
      addDoc.style.display = "none";
    }
  });
}

addDoc.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  if (target === addDoc) {
    addDoc.style.display = "none";
  }
});


const docStatus = document.getElementById("docStatus") as HTMLInputElement;
const pendingPeopleDiv = document.getElementById("pendingPeopleDiv");
if (docStatus) {
  docStatus.addEventListener("change", () => {
    if (pendingPeopleDiv) {
      if (docStatus.value === "Pending") {
        pendingPeopleDiv.style.display = "block";
      } else {
        pendingPeopleDiv.style.display = "none";
      }
    }
  });
}

const docName = document.getElementById("docName") as HTMLInputElement;
const addForm = document.getElementById("addForm") as HTMLFormElement;
if (addForm) {
  addForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = docName.value.trim();
    const status = docStatus.value as StatusType;
    const pendcount = document.getElementById(
      "pendingCount",
    ) as HTMLInputElement;
    const pentcountval = pendcount.value;
    const pendingCount = status === "Pending" ? Number(pentcountval) : 0;

    if (name == "") {
      alert("Please enter a valid name");
      return;
    }
    const d = new Date();
    const date = d.toLocaleDateString("en-gb");
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
}

const tbody = document.querySelector(".doc-table tbody");
function generateTableRow(doc: FileDocument) {
  const statusData = STATUS[doc.status];
  const buttonText = statusData.button;
  const badgeClass = statusData.className;
  let badge = `<span class="badge ${badgeClass}">${doc.status}</span>`;
  let pendingText= "";
  if (doc.status === "Pending") {
    pendingText = `<span class="subtext"><i>Waiting for <b>${doc.pendingCount} persons</b></i></span>`;
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


function load() {
  if (tbody) {
    tbody.innerHTML = documents.map((doc) => generateTableRow(doc)).join("");
  }
}
load();


document.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;

  if (target.classList.contains("edit")) {
    const tr = target.closest("tr") as HTMLElement;
    const id = Number(tr.dataset.id);
    editId = id;
    const doc = documents.find((d) => d.id === id);
    if (doc) {
      if (pendingPeopleDiv) {
        if (doc.status === "Pending") {
          pendingPeopleDiv.style.display = "block";
        } else {
          pendingPeopleDiv.style.display = "none";
        }
      }
      docName.value = doc.name;
      docStatus.value = doc.status;
    }
    addDoc.style.display = "flex";
  }
});

document.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  if (target.classList.contains("delete")) {
    const tr = target.closest("tr") as HTMLElement;
    const id = Number(tr.dataset.id);

    documents = documents.filter((doc) => doc.id !== id);
    load();
    alert("Document deleted successfully");
  }
});


const searchInp = document.querySelector("#searchInput") as HTMLInputElement;
function search(searchText: string) {
  searchText = searchText.toLowerCase();
  const filterDoc = documents.filter((doc) => {
    const myName = doc.name.toLowerCase().includes(searchText);
    const myStatus = doc.status.toLowerCase().includes(searchText);
    const myDate = doc.date.toLowerCase().includes(searchText);
    return myName || myStatus || myDate;
  });
  if (tbody) {
    tbody.innerHTML = filterDoc.map((doc) => generateTableRow(doc)).join("");
  }
}
if (searchInp) {
  searchInp.addEventListener("input", () => {
    search(searchInp.value);
  });
}
