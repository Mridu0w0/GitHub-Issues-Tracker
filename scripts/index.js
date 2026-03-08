// ==========================================
// DASHBOARD PAGE LOGIC
// ==========================================

// Create a global variable to store the issues so we can filter them locally
let globalIssues = [];

// 1. Fetch the issues from the API
const loadIssues = async () => {
    const issuesContainer = document.getElementById('issues-grid');
    if (!issuesContainer) return; 

    try {
        const res = await fetch('https://phi-lab-server.vercel.app/api/v1/lab/issues');
        const json = await res.json();
        
        // Save the fetched data to our global variable
        globalIssues = Array.isArray(json) ? json : (json.data || []);
        
        // Display all issues initially
        displayIssues(globalIssues);
    } catch (err) {
        console.error("Error fetching issues:", err);
        document.getElementById('issue-count').innerText = "Failed to load issues";
    }
}

// 2. Filter Issues Function (NEW)
const filterIssues = (filterType) => {
    // Get the buttons
    const btnAll = document.getElementById('btn-all');
    const btnOpen = document.getElementById('btn-open');
    const btnClosed = document.getElementById('btn-closed');

    // Define the CSS classes for active (purple) and inactive (gray) states
    const activeClass = "bg-[#4B00FF] text-white px-6 py-1.5 rounded-md text-sm font-medium transition-colors";
    const inactiveClass = "text-gray-600 hover:bg-gray-50 px-6 py-1.5 rounded-md text-sm font-medium border border-transparent hover:border-gray-200 transition-colors";

    // Reset all buttons to inactive first
    btnAll.className = inactiveClass;
    btnOpen.className = inactiveClass;
    btnClosed.className = inactiveClass;

    // Filter the data based on the button clicked and highlight the active button
    let filteredData = [];

    if (filterType === 'all') {
        btnAll.className = activeClass;
        filteredData = globalIssues; // Show everything
    } 
    else if (filterType === 'open') {
        btnOpen.className = activeClass;
        // Filter array: keep only items where status is 'open'
        filteredData = globalIssues.filter(issue => (issue.status || 'open').toLowerCase() === 'open');
    } 
    else if (filterType === 'closed') {
        btnClosed.className = activeClass;
        // Filter array: keep only items where status is 'closed'
        filteredData = globalIssues.filter(issue => (issue.status || 'open').toLowerCase() === 'closed');
    }

    // Pass the newly filtered list to the display function
    displayIssues(filteredData);
}



// 3. Display the issues in the grid (KEEP YOUR EXISTING CODE HERE)
const displayIssues = (issues) => {
    const issuesContainer = document.getElementById('issues-grid'); 
    const countHeader = document.getElementById('issue-count');

    if (countHeader) {
        countHeader.innerText = `${issues.length} Issues`;
    }

    issuesContainer.innerHTML = ''; 

    // If there are no issues matching the filter, show a friendly message
    if (issues.length === 0) {
        issuesContainer.innerHTML = `<p class="text-gray-500 col-span-full py-8 text-center w-full">No issues found.</p>`;
        return;
    }

    issues.forEach(issue => {
        const title = issue.title || 'Untitled Issue';
        const desc = issue.description || 'No description provided.';
        const status = (issue.status || 'open').toLowerCase();
        const priority = (issue.priority || 'low').toUpperCase();
        
        const author = issue.author || 'user';
        const date = issue.date || '1/15/2024';
        const id = issue.id || Math.floor(Math.random() * 100);

        const isClosed = status === 'closed';
        const borderColor = isClosed ? 'border-t-[#8250df]' : 'border-t-[#2da44e]';
        const iconColor = isClosed ? 'text-[#8250df]' : 'text-[#2da44e]';
        
        let priorityBadge = '';
        if (priority === 'HIGH') {
            priorityBadge = `<span class="bg-[#ffebe9] text-[#cf222e] text-[10px] font-bold px-2 py-1 rounded-full uppercase">HIGH</span>`;
        } else if (priority === 'MEDIUM') {
            priorityBadge = `<span class="bg-[#fff8c5] text-[#9a6700] text-[10px] font-bold px-2 py-1 rounded-full uppercase">MEDIUM</span>`;
        } else {
            priorityBadge = `<span class="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase">LOW</span>`;
        }

    const card = document.createElement('div');
    // Added 'cursor-pointer' so the mouse turns into a hand when hovering
        card.className = `border border-gray-200 rounded-lg p-4 border-t-4 ${borderColor} flex flex-col hover:shadow-md transition-shadow bg-white cursor-pointer`;
    // When clicked, send this specific issue's data to the openModal function
        card.onclick = () => openModal(issue);

        card.innerHTML = `
<div class="flex justify-between items-center mb-3">
                ${isClosed 
                    ? '<img src="../assets/Closed- Status .png" alt="Closed" class="w-5 h-5">' 
                    : '<img src="../assets/Open-Status.png" alt="Open" class="w-5 h-5">'
                }
                ${priorityBadge}
            </div>
            <h3 class="font-bold text-gray-900 text-sm mb-2">${title}</h3>
            <p class="text-xs text-gray-500 mb-4 line-clamp-2">${desc}</p>
            <div class="flex gap-2 mb-4 text-[10px] font-semibold flex-wrap">
                <span class="px-2 py-1 rounded-full border border-[#ff8182] text-[#cf222e] flex items-center gap-1 bg-[#FEECEC]"><i class="fa-solid fa-bug"></i> BUG</span>
                <span class="px-2 py-1 rounded-full border border-[#d4a72c] text-[#9a6700] flex items-center gap-1 bg-[#FFF8DB]"><i class="fa-regular fa-life-ring"></i>HELP WANTED</span>
            </div>
            <div class="mt-auto text-[11px] text-gray-400">
                <p>#${id} by ${author}</p>
                <p class="mt-0.5">${date}</p>
            </div>
        `;
        
        issuesContainer.appendChild(card);
    });
}
const searchInput = document.getElementById('search-input');

if (searchInput) {
    // Listen for every time the user types a key in the search box
    searchInput.addEventListener('input', (event) => {
        // Get what the user typed and make it lowercase so the search isn't case-sensitive
        const searchTerm = event.target.value.toLowerCase().trim();

        // Filter the global array to only include issues where the title includes the search term
        const searchedData = globalIssues.filter(issue => {
            const title = (issue.title || '').toLowerCase();
            return title.includes(searchTerm);
        });

        // Display the newly filtered list
        displayIssues(searchedData);

 
        const activeClass = "bg-[#4B00FF] text-white px-6 py-1.5 rounded-md text-sm font-medium transition-colors";
        const inactiveClass = "text-gray-600 hover:bg-gray-50 px-6 py-1.5 rounded-md text-sm font-medium border border-transparent hover:border-gray-200 transition-colors";
        
        document.getElementById('btn-all').className = activeClass;
        document.getElementById('btn-open').className = inactiveClass;
        document.getElementById('btn-closed').className = inactiveClass;
    });
}
const openModal = (issue) => {
    // 1. Get the modal elements
    const modal = document.getElementById('issue-modal');
    
    // 2. Extract data safely (just like we did for the cards)
    const title = issue.title || 'Untitled Issue';
    const desc = issue.description || 'No description provided.';
    const status = (issue.status || 'open').toLowerCase();
    const priority = (issue.priority || 'low').toUpperCase();
    const author = issue.author || 'User'; 
    const date = issue.date || '1/15/2024';
    const assignee = issue.assignee || author; // Fallback to author if no assignee

    // 3. Populate text elements
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-desc').innerText = desc;
    document.getElementById('modal-author').innerText = author;
    document.getElementById('modal-date').innerText = date;
    document.getElementById('modal-assignee').innerText = assignee;

    // 4. Set Status Badge colors
    const statusBadge = document.getElementById('modal-status-badge');
    if (status === 'closed') {
        statusBadge.innerText = 'Closed';
        statusBadge.className = 'px-3 py-1 rounded-full text-white text-xs font-semibold bg-[#8250df]';
    } else {
        statusBadge.innerText = 'Opened';
        statusBadge.className = 'px-3 py-1 rounded-full text-white text-xs font-semibold bg-[#2da44e]';
    }

    // 5. Set Priority Badge
    let priorityBadgeHTML = '';
    if (priority === 'HIGH') {
        priorityBadgeHTML = `<span class="bg-[#ffebe9] text-[#cf222e] text-[10px] font-bold px-2 py-1 rounded-full uppercase">HIGH</span>`;
    } else if (priority === 'MEDIUM') {
        priorityBadgeHTML = `<span class="bg-[#fff8c5] text-[#9a6700] text-[10px] font-bold px-2 py-1 rounded-full uppercase">MEDIUM</span>`;
    } else {
        priorityBadgeHTML = `<span class="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase">LOW</span>`;
    }
    document.getElementById('modal-priority').innerHTML = priorityBadgeHTML;

    // 6. Reveal the modal by removing the 'hidden' class
    modal.classList.remove('hidden');
}

const closeModal = () => {
    // Hide the modal by adding the 'hidden' class back
    document.getElementById('issue-modal').classList.add('hidden');
}


loadIssues();