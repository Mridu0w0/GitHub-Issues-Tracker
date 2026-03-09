let globalIssues = [];

const showLoader = () => {
    const issuesContainer = document.getElementById('issues-grid');
    if (!issuesContainer) return;
    
    issuesContainer.innerHTML = `
        <div class="col-span-full flex justify-center items-center py-20">
            <span class="loading loading-ring loading-xl text-[#4B00FF]"></span>
        </div>
    `;
};

const loadIssues = async () => {
    const issuesContainer = document.getElementById('issues-grid');
    if (!issuesContainer) return; 

    issuesContainer.innerHTML = `
        <div class="border border-gray-200 rounded-lg p-6 bg-white flex items-center gap-4 col-span-full animate-pulse shadow-sm">
            <div class="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
                <svg class="w-6 h-6 text-[#4B00FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
            </div>
            <div>
                <h3 class="font-bold text-gray-900 text-lg mb-1">Loading Issues...</h3>
                <p class="text-sm text-gray-500">Track and manage your project issues</p>
            </div>
        </div>
    `;

    try {
        const res = await fetch('https://phi-lab-server.vercel.app/api/v1/lab/issues');
        const json = await res.json();
        
        globalIssues = Array.isArray(json) ? json : (json.data || []);
        
        displayIssues(globalIssues);
    } catch (err) {
        console.error("Error fetching issues:", err);
        issuesContainer.innerHTML = `<p class="text-red-500 col-span-full py-8 text-center w-full font-semibold">Failed to load issues. Please try refreshing the page.</p>`;
        document.getElementById('issue-count').innerText = "Failed to load issues";
    }
}

const filterIssues = (filterType) => {
    const btnAll = document.getElementById('btn-all');
    const btnOpen = document.getElementById('btn-open');
    const btnClosed = document.getElementById('btn-closed');

    const activeClass = "bg-[#4B00FF] text-white px-6 py-1.5 rounded-md text-sm font-medium transition-colors";
    const inactiveClass = "text-gray-600 hover:bg-gray-50 px-6 py-1.5 rounded-md text-sm font-medium border border-transparent hover:border-gray-200 transition-colors";

    btnAll.className = inactiveClass;
    btnOpen.className = inactiveClass;
    btnClosed.className = inactiveClass;

    if (filterType === 'all') btnAll.className = activeClass;
    if (filterType === 'open') btnOpen.className = activeClass;
    if (filterType === 'closed') btnClosed.className = activeClass;

    showLoader();

    setTimeout(() => {
        let filteredData = [];

        if (filterType === 'all') {
            filteredData = globalIssues; 
        } 
        else if (filterType === 'open') {
            filteredData = globalIssues.filter(issue => (issue.status || 'open').toLowerCase() === 'open');
        } 
        else if (filterType === 'closed') {
            filteredData = globalIssues.filter(issue => (issue.status || 'open').toLowerCase() === 'closed');
        }

        displayIssues(filteredData);
    }, 400);
}

const displayIssues = (issues) => {
    const issuesContainer = document.getElementById('issues-grid'); 
    const countHeader = document.getElementById('issue-count');

    if (countHeader) {
        countHeader.innerText = `${issues.length} Issues`;
    }

    issuesContainer.innerHTML = ''; 

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
        
        let priorityBadge = '';
        if (priority === 'HIGH') {
            priorityBadge = `<span class="bg-[#ffebe9] text-[#cf222e] text-[10px] font-bold px-2 py-1 rounded-full uppercase">HIGH</span>`;
        } else if (priority === 'MEDIUM') {
            priorityBadge = `<span class="bg-[#fff8c5] text-[#9a6700] text-[10px] font-bold px-2 py-1 rounded-full uppercase">MEDIUM</span>`;
        } else {
            priorityBadge = `<span class="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase">LOW</span>`;
        }

        const card = document.createElement('div');
        card.className = `border border-gray-200 rounded-lg p-4 border-t-4 ${borderColor} flex flex-col hover:shadow-md transition-shadow bg-white cursor-pointer`;
        card.onclick = () => openModal(issue);

       card.innerHTML = `
            <div class="flex justify-between items-center mb-3">
                ${isClosed 
                    ? '<img src="./assets/closed-status.png" alt="Closed" class="w-5 h-5">' 
                    : '<img src="./assets/open-status.png" alt="Open" class="w-5 h-5">'
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
let searchTimeout; 

if (searchInput) {
    searchInput.addEventListener('input', (event) => {
        clearTimeout(searchTimeout);

        showLoader();

        const activeClass = "bg-[#4B00FF] text-white px-6 py-1.5 rounded-md text-sm font-medium transition-colors";
        const inactiveClass = "text-gray-600 hover:bg-gray-50 px-6 py-1.5 rounded-md text-sm font-medium border border-transparent hover:border-gray-200 transition-colors";
        
        document.getElementById('btn-all').className = activeClass;
        document.getElementById('btn-open').className = inactiveClass;
        document.getElementById('btn-closed').className = inactiveClass;

        searchTimeout = setTimeout(() => {
            const searchTerm = event.target.value.toLowerCase().trim();

            const searchedData = globalIssues.filter(issue => {
                const title = (issue.title || '').toLowerCase();
                return title.includes(searchTerm);
            });

            displayIssues(searchedData);
        }, 400);
    });
}

const openModal = (issue) => {
    const modal = document.getElementById('issue-modal');
    
    const title = issue.title || 'Untitled Issue';
    const desc = issue.description || 'No description provided.';
    const status = (issue.status || 'open').toLowerCase();
    const priority = (issue.priority || 'low').toUpperCase();
    const author = issue.author || 'User'; 
    const date = issue.date || '1/15/2024';
    const assignee = issue.assignee || author; 

    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-desc').innerText = desc;
    document.getElementById('modal-author').innerText = author;
    document.getElementById('modal-date').innerText = date;
    document.getElementById('modal-assignee').innerText = assignee;

    const statusBadge = document.getElementById('modal-status-badge');
    if (status === 'closed') {
        statusBadge.innerText = 'Closed';
        statusBadge.className = 'px-3 py-1 rounded-full text-white text-xs font-semibold bg-[#8250df]';
    } else {
        statusBadge.innerText = 'Opened';
        statusBadge.className = 'px-3 py-1 rounded-full text-white text-xs font-semibold bg-[#2da44e]';
    }

    let priorityBadgeHTML = '';
    if (priority === 'HIGH') {
        priorityBadgeHTML = `<span class="bg-[#ffebe9] text-[#cf222e] text-[10px] font-bold px-2 py-1 rounded-full uppercase">HIGH</span>`;
    } else if (priority === 'MEDIUM') {
        priorityBadgeHTML = `<span class="bg-[#fff8c5] text-[#9a6700] text-[10px] font-bold px-2 py-1 rounded-full uppercase">MEDIUM</span>`;
    } else {
        priorityBadgeHTML = `<span class="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase">LOW</span>`;
    }
    document.getElementById('modal-priority').innerHTML = priorityBadgeHTML;

    modal.classList.remove('hidden');
}

const closeModal = () => {
    document.getElementById('issue-modal').classList.add('hidden');
}

loadIssues();