let jobsData = [];    // save JSON data
let favorites = [];   // array that has job id(bookmark favorite)
let currentUser = "user1";

function switchUser() {
  const selector = document.getElementById("user-select");
  currentUser = selector.value;
  filterJobs();
  displayApplications();
}

// Gain data from JSON file
async function fetchJobs() {
  const localData = localStorage.getItem("jobsData");
  if (localData) {
    jobsData = JSON.parse(localData);
    console.log("Loaded from localStorage:", jobsData);
  } else {
    try {
      const response = await fetch('comp1004.json');
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      jobsData = await response.json();
      jobsData.forEach(job => job.appliedBy = job.appliedBy || []);
      localStorage.setItem("jobsData", JSON.stringify(jobsData));
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  }
  // Process for restoring application history from localStorage.
  const storedApplications = localStorage.getItem("jobApplications");
  if (storedApplications) {
  const parsed = JSON.parse(storedApplications);
  jobsData.forEach(job => {
    const key= job.id;
    if (parsed[key]) {
      job.appliedBy = parsed[key]; // seperscription（already applied）
    } else if (!job.appliedBy) {
      job.appliedBy = []; // initialised（not apply yet）
    }
  });
  } else {
  // initialised, the case of nothing history of applying
  jobsData.forEach(job => {
    if (!job.appliedBy) job.appliedBy = [];
  });
  }

  displayJobs(jobsData);
  displayFavorites();
  displayApplications(); // display history of applications
}


// function to display registering form
function showRegisterForm() {
  // hide main job list and others
  document.getElementById('job-list').style.display = 'none';
  document.getElementById('favorite-container').style.display = 'none';
  document.getElementById('search-input').style.display = 'none';
  document.getElementById('category-filter').style.display = 'none';
  
  // display registering form
  document.getElementById('register-section').style.display = 'block';
  // display form body
  document.getElementById('job-form').style.display = 'block';
}

// function to go back to main screen with hiding registering form
function hideRegisterForm() {
  // hide registering form
  document.getElementById('register-section').style.display = 'none';
  
  // redisplay main job list and others
  document.getElementById('job-list').style.display = 'block';
  document.getElementById('favorite-container').style.display = 'block';
  document.getElementById('search-input').style.display = 'inline-block';
  document.getElementById('category-filter').style.display = 'inline-block';
}

// sending event handler for job registering form
document.getElementById('job-form').addEventListener('submit', function(event){
  event.preventDefault();
  
  // gain logical input value
  const title = document.getElementById('job-title').value;
  const category = document.getElementById('job-category').value;
  const location = document.getElementById('job-location').value;
  const reward = parseFloat(document.getElementById('job-reward').value);
  const description = document.getElementById('job-description').value;
  const contact = document.getElementById('job-contact').value;
  
  // ID of new job is existing max ID + 1 (1 if jobsData is empty)
  const newId = jobsData.length > 0 ? Math.max(...jobsData.map(job => job.id)) + 1 : 1;
  
  // create new job objects
  const newJob = {
    id: newId,
    title: title,
    category: category,
    location: location,
    reward: reward,
    description: description,
    contact: contact,
    appliedBy: [] // initialised for localStorage
  };
  
  // adding jobsData、uplade list
  jobsData.push(newJob);localStorage.setItem("jobsData", JSON.stringify(jobsData)); // saved
  displayJobs(jobsData);
  
  // reset form
  this.reset();

  // complete registering, back to main
  hideRegisterForm();
});

// the main job list (excluding jobs registered as favourites).
function displayJobs(jobs) {
  const jobList = document.getElementById('job-list');
  jobList.innerHTML = ''; // initialised

  // gain Search text and category filter values
  const searchInputElem = document.getElementById('search-input');
  const categoryFilterElem = document.getElementById('category-filter');
  const searchInput = searchInputElem ? searchInputElem.value.toLowerCase() : "";
  const categoryFilter = categoryFilterElem ? categoryFilterElem.value : "";

  // If jobs is not passed, use jobsData
  if (!jobs) {
    jobs = jobsData;
  }

  jobs.forEach(job => {
    // If you have already added it to your favourites, it will not appear in the main list.
    if (favorites.includes(job.id)) return;

    // apply search and category filter
    const matchesSearch = job.title.toLowerCase().includes(searchInput);
    const matchesCategory = categoryFilter === "" || job.category === categoryFilter;
    if (matchesSearch && matchesCategory) {
      
      const jobItem = document.createElement('div');
      jobItem.classList.add('job-item');
      jobItem.innerHTML = `
        <h2><a href="#" onclick="showJobDetails(${job.id})">${job.title}</a></h2>
        <p><strong>Category:</strong> ${job.category}</p>
        <p><strong>Location:</strong> ${job.location}</p>
        <p><strong>Reward:</strong> £${job.reward}/hour</p>
        <p><strong>Description:</strong>${job.description}</p>
        <p><storong>Contact:<strong/>${job.contact}</p>
      `;
      jobList.appendChild(jobItem);
    }
  });
}

// display detail page
function showJobDetails(jobId) {
  console.log("Selected Job ID:", jobId);
  const job = jobsData.find(j => j.id === jobId);
  if (!job) {
    console.error("Job not found!");
    return;
  }
  console.log("Job found:", job);
 
  history.pushState({ jobId }, '', `#job-${jobId}`);

  const jobList = document.getElementById('job-list');
  const jobDetails = document.getElementById('job-details');

  jobList.style.display = 'none';      // hide main list
  jobDetails.style.display = 'block';    // display detail

  // judge whether the current user has already applied
  const hasApplied = job.appliedBy.includes(currentUser);
  const applyButtonText = hasApplied ? "Cancel Application" : "Apply Now";
  const applyButtonAction = hasApplied
    ? `cancelApplication(this, ${job.id})`
    : `applyForJob(this, ${job.id})`;

  // display favorite button in detail page
  jobDetails.innerHTML = `
    <h2>${job.title}</h2>
    <p><strong>Category:</strong> ${job.category}</p>
    <p><strong>Location:</strong> ${job.location}</p>
    <p><strong>Reward:</strong> £${job.reward}/hour</p>
    <p><strong>Description:</strong> ${job.description}</p>
    <p><strong>Contact:</strong> ${job.contact}</p>
    <button onclick="${applyButtonAction}">${applyButtonText}</button>
    <button onclick="goBack()">Back</button>
    <button onclick="toggleFavorite(this, ${job.id})">Favorite</button>
  `;
}


//User view application
function applyForJob(button, jobId) {
  const job = jobsData.find(j => j.id === jobId);
  if (!job.appliedBy) job.appliedBy = [];
  if (job.appliedBy.includes(currentUser)) return;

  const confirmApply = confirm("Apply for this job?");
  if (!confirmApply) return;

  job.appliedBy.push(currentUser);
  button.innerText = "Applied";
  button.disabled = true;
  button.classList.add("applied");

  saveApplications();
  alert("Application successful!");
  displayApplications();
}

function saveApplications() {
  const data = {};
  jobsData.forEach(job => {
    if (job.appliedBy) {
      data[job.id] = job.appliedBy;
    }
  });
  localStorage.setItem("jobApplications", JSON.stringify(data));
}

//Enployer view
function toggleEmployerView() {
  const panel = document.getElementById("employer-view");
  if (panel.style.display === "none") {
    panel.style.display = "block";
    displayApplications();
  } else {
    panel.style.display = "none";
  }
}

function showApplicationsOnly() {
  // hide except history screen
  document.getElementById("job-list").style.display = "none";
  document.getElementById("favorite-container").style.display = "none";
  document.getElementById("search-input").style.display = "none";
  document.getElementById("category-filter").style.display = "none";
  document.getElementById("register-section").style.display = "none";
  document.getElementById("job-details").style.display = "none";

  // only display history of application
  document.getElementById("employer-view").style.display = "block";

  // rewrite contents
  displayApplications();
}

function goBackFromApplications() {
  document.getElementById("employer-view").style.display = "none";
  document.getElementById("job-list").style.display = "block";
  document.getElementById("favorite-container").style.display = "block";
  document.getElementById("search-input").style.display = "inline-block";
  document.getElementById("category-filter").style.display = "inline-block";
}


function displayApplications() {
  const panel = document.getElementById("employer-view");

  panel.innerHTML = `
    <h2>Applications Received</h2>
    <button onclick="goBackFromApplications()"> Back</button>
  `;

  jobsData.forEach(job => {
    if (job.appliedBy && job.appliedBy.length > 0) {
      const box = document.createElement("div");
      box.className = "job-item";
      box.innerHTML = `
        <h3>${job.title}</h3>
        <p><strong>Applicants:</strong> ${job.appliedBy.join(", ")}</p>
      `;
      panel.appendChild(box);
    }
  });
}

function cancelApplication(button, jobId) {
  const job = jobsData.find(j => j.id === jobId);
  if (!job || !job.appliedBy.includes(currentUser)) return;

  const confirmCancel = confirm("Do you want to cancel your application?");
  if (!confirmCancel) return;

  // remove applicants list
  job.appliedBy = job.appliedBy.filter(user => user !== currentUser);

  // update shown button
  button.innerText = "Apply Now";
  button.onclick = () => applyForJob(button, jobId);
  button.disabled = false;
  button.classList.remove("applied");

  saveApplications();
  alert("Application has been cancelled.");
  displayApplications(); // update employer-view 
}



// back button
function goBack() {
  history.pushState({}, '', 'comp1004.html');
  document.getElementById('job-list').style.display = 'block';
  document.getElementById('job-details').style.display = 'none';
}

// searching & filtering 
function filterJobs() {
  const searchInput = document.getElementById('search-input').value.toLowerCase();
  const categoryFilter = document.getElementById('category-filter').value;
  const filteredJobs = jobsData.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchInput);
    const matchesCategory = categoryFilter === "" || job.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  displayJobs(filteredJobs);
}


// Favorite list
function displayFavorites() {
  const favoriteList = document.getElementById('favorite-list');
  favoriteList.innerHTML = ''; // initialised

  jobsData.forEach(job => {
    if (favorites.includes(job.id)) {
      // Job items for the favourites list are created using createJobItem().
      const jobItem = createJobItem(job, true);
      const li = document.createElement('li');
      li.appendChild(jobItem);
      favoriteList.appendChild(li);
    }
  });
}

// Create DOM elements for one job (for the favourites list).
// if isFavorite is true,button display as「Unfavorite」
function createJobItem(job, isFavorite) {
  const jobItem = document.createElement('div');
  jobItem.classList.add('job-item');
  const buttonText = isFavorite ? "Unfavorite" : "Favorite";
  jobItem.innerHTML = `
    <h2>${job.title}</h2>
    <p><strong>Category:</strong> ${job.category}</p>
    <p><strong>Location:</strong> ${job.location}</p>
    <p><strong>Reward:</strong> £${job.reward}/hour</p>
    <p><strong>Description:</strong> ${job.description}</p>
    <p><strong>Contact:</strong> ${job.contact}</p>
    <button onclick="toggleFavorite(${job.id})">${buttonText}</button>
  `;
  return jobItem;
}

// bookmark and remove favorite 
function toggleFavorite(buttonOrJobId, jobId) {
  let button;
  if (typeof buttonOrJobId === 'number') {
    
    jobId = buttonOrJobId;
    button = null;
  } else {
    button = buttonOrJobId;
  }
  
  jobId = Number(jobId);

  if (favorites.includes(jobId)) {
    
    favorites = favorites.filter(id => id !== jobId);
    if (button) {
      button.innerText = "Favorite";
      button.style.backgroundColor = "";
      alert("Removed from favorites!");
    }
  } else {
    
    favorites.push(jobId);
    if (button) {
      button.innerText = "Unfavorite";
      button.style.backgroundColor = "lightgreen";
      alert("Added to favorites!");
    }
  }
  console.log("Current favorites:", favorites);

  localStorage.setItem("favorites", JSON.stringify(favorites));

  
  displayJobs(jobsData);
  displayFavorites();
}


window.addEventListener('load', () => {
  const favData = localStorage.getItem("favorites");
  if (favData) favorites = JSON.parse(favData);

  fetchJobs(); // ページロード時に必ずデータ取得
});


