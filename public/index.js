        // Authentication and User Management
        class AuthManager {
            constructor() {
                this.currentUser = null;
                this.users = JSON.parse(localStorage.getItem('jobFinderUsers') || '{}');
                this.applications = JSON.parse(localStorage.getItem('jobFinderApplications') || '{}');
                this.cvAnalyses = JSON.parse(localStorage.getItem('jobFinderCVAnalyses') || '{}');
            }

            register(name, email, password) {
                if (this.users[email]) {
                    throw new Error('User already exists with this email');
                }

                const user = {
                    id: Date.now().toString(),
                    name,
                    email,
                    password: this.hashPassword(password),
                    createdAt: new Date().toISOString()
                };

                this.users[email] = user;
                this.saveUsers();
                return user;
            }

            login(email, password) {
                const user = this.users[email];
                if (!user || user.password !== this.hashPassword(password)) {
                    throw new Error('Invalid email or password');
                }

                this.currentUser = user;
                localStorage.setItem('currentUser', JSON.stringify(user));
                return user;
            }

            logout() {
                this.currentUser = null;
                localStorage.removeItem('currentUser');
            }

            getCurrentUser() {
                if (!this.currentUser) {
                    const stored = localStorage.getItem('currentUser');
                    if (stored) {
                        this.currentUser = JSON.parse(stored);
                    }
                }
                return this.currentUser;
            }

            saveApplication(jobId, jobTitle, company, location) {
                const user = this.getCurrentUser();
                if (!user) return;

                if (!this.applications[user.email]) {
                    this.applications[user.email] = [];
                }

                const application = {
                    id: Date.now().toString(),
                    jobId,
                    jobTitle,
                    company,
                    location,
                    appliedAt: new Date().toISOString(),
                    status: 'Applied'
                };

                this.applications[user.email].push(application);
                localStorage.setItem('jobFinderApplications', JSON.stringify(this.applications));
                return application;
            }

            getUserApplications() {
                const user = this.getCurrentUser();
                if (!user) return [];
                return this.applications[user.email] || [];
            }

            saveCVAnalysis(analysis) {
                const user = this.getCurrentUser();
                if (!user) return;

                this.cvAnalyses[user.email] = {
                    ...analysis,
                    savedAt: new Date().toISOString()
                };
                localStorage.setItem('jobFinderCVAnalyses', JSON.stringify(this.cvAnalyses));
            }

            getUserCVAnalysis() {
                const user = this.getCurrentUser();
                if (!user) return null;
                return this.cvAnalyses[user.email] || null;
            }

            hashPassword(password) {
                // Simple hash function for demo purposes
                let hash = 0;
                for (let i = 0; i < password.length; i++) {
                    const char = password.charCodeAt(i);
                    hash = ((hash << 5) - hash) + char;
                    hash = hash & hash;
                }
                return hash.toString();
            }

            saveUsers() {
                localStorage.setItem('jobFinderUsers', JSON.stringify(this.users));
            }
        }

        // Initialize Auth Manager
        const authManager = new AuthManager();

        // Get DOM elements
        const authScreen = document.getElementById('authScreen');
        const header = document.getElementById('header');
        const initialScreen = document.getElementById('initialScreen');
        const loadingScreen = document.getElementById('loadingScreen');
        const dashboard = document.getElementById('dashboard');
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        // Auth form elements
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        const loginFormElement = document.getElementById('loginFormElement');
        const signupFormElement = document.getElementById('signupFormElement');
        const showSignupLink = document.getElementById('showSignup');
        const showLoginLink = document.getElementById('showLogin');
        const logoutBtn = document.getElementById('logoutBtn');
        const userName = document.getElementById('userName');

        // Initialize app
        function initializeApp() {
            console.log('Initializing app...');
            const currentUser = authManager.getCurrentUser();
            if (currentUser) {
                console.log('User found:', currentUser.name);
                showMainApp();
                loadUserData();
            } else {
                console.log('No user found, showing auth screen');
                showAuthScreen();
            }
        }

        function showAuthScreen() {
            console.log('Showing auth screen');
            authScreen.classList.remove('hide');
            header.classList.remove('show');
            initialScreen.classList.remove('show');
            dashboard.classList.remove('show');
            loadingScreen.classList.remove('show');
        }

        function showMainApp() {
            console.log('Showing main app');
            const user = authManager.getCurrentUser();
            authScreen.classList.add('hide');
            header.classList.add('show');
            initialScreen.classList.add('show');
            userName.textContent = `Welcome, ${user.name}!`;
        }

        function loadUserData() {
            const applications = authManager.getUserApplications();
            updateApplicationsList(applications);
            
            // Load previous CV analysis if exists
            const cvAnalysis = authManager.getUserCVAnalysis();
            if (cvAnalysis) {
                // Populate the analysis in the UI
                populateCVAnalysis(cvAnalysis);
                console.log('Previous CV analysis loaded');
            }
        }

        function updateApplicationsList(applications) {
            const applicationsList = document.getElementById('applicationsList');
            
            if (applications.length === 0) {
                applicationsList.innerHTML = '<p style="color: #6b7280; text-align: center; padding: 2rem;">No applications yet. Apply to jobs to see them here!</p>';
                return;
            }

            applicationsList.innerHTML = applications.map(app => `
                <div class="application-item">
                    <div class="application-info">
                        <h4>${app.jobTitle}</h4>
                        <p>${app.company} • ${app.location}</p>
                        <p style="font-size: 0.8rem; color: #9ca3af;">Applied on ${new Date(app.appliedAt).toLocaleDateString()}</p>
                    </div>
                    <div class="application-status">${app.status}</div>
                </div>
            `).join('');
        }

        // Auth form handling
        showSignupLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.style.display = 'none';
            signupForm.style.display = 'block';
            clearMessages();
        });

        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            signupForm.style.display = 'none';
            loginForm.style.display = 'block';
            clearMessages();
        });

        loginFormElement.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            try {
                authManager.login(email, password);
                showMainApp();
                loadUserData();
                clearMessages();
                showMessage('authSuccess', 'Login successful!');
                setTimeout(() => clearMessages(), 2000);
            } catch (error) {
                showMessage('authError', error.message);
            }
        });

        signupFormElement.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                showMessage('signupError', 'Passwords do not match');
                return;
            }

            try {
                authManager.register(name, email, password);
                authManager.login(email, password);
                showMainApp();
                loadUserData();
                clearMessages();
                showMessage('signupSuccess', 'Account created successfully!');
                setTimeout(() => clearMessages(), 2000);
            } catch (error) {
                showMessage('signupError', error.message);
            }
        });

        logoutBtn.addEventListener('click', () => {
            authManager.logout();
            showAuthScreen();
            // Reset forms
            loginFormElement.reset();
            signupFormElement.reset();
            clearMessages();
        });

        function showMessage(elementId, message) {
            const element = document.getElementById(elementId);
            element.textContent = message;
            element.style.display = 'block';
        }

        function clearMessages() {
            ['authError', 'authSuccess', 'signupError', 'signupSuccess'].forEach(id => {
                const element = document.getElementById(id);
                element.style.display = 'none';
                element.textContent = '';
            });
        }

        // File upload handling
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileUpload(files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileUpload(e.target.files[0]);
            }
        });

        function handleFileUpload(file) {
            // Validate file type
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            
            if (!allowedTypes.includes(file.type)) {
                alert('Please upload a PDF, DOC, or DOCX file.');
                return;
            }

            // Show loading screen
            initialScreen.classList.remove('show');
            loadingScreen.classList.add('show');

            const formData = new FormData();
            formData.append("pdfFile", file);

            fetch("/extract-text", {
                method: "post",
                body: formData
            }).then(response => {
                return response.json(); 
            }).then(analysis => {
                console.log('Analysis received:', analysis);
                
                // Save the analysis
                authManager.saveCVAnalysis({
                    fileName: file.name,
                    fileSize: file.size,
                    uploadedAt: new Date().toISOString(),
                    ...analysis
                });
                
                // Populate CV analysis in the HTML
                populateCVAnalysis(analysis);
                
                // Hide loading screen and show dashboard
                loadingScreen.classList.remove('show');
                dashboard.classList.add('show');
            }).catch(error => {
                console.error('Error processing file:', error);
                alert('Error processing file. Please try again.');
                loadingScreen.classList.remove('show');
                initialScreen.classList.add('show');
            });
        }

        // Function to populate CV analysis with Gemini data
        function populateCVAnalysis(analysis) {
            // Update strengths
            const strengthsCard = document.querySelector('.analysis-card:nth-child(2)');
            if (strengthsCard && analysis.strengths) {
                const strengthsList = analysis.strengths.map(strength => `<li>${strength}</li>`).join('');
                strengthsCard.innerHTML = `
                    <h3>🎯 Strengths</h3>
                    <ul>
                        ${strengthsList}
                    </ul>
                `;
            }

            // Update improvements
            const improvementsCard = document.querySelector('.analysis-card:nth-child(3)');
            if (improvementsCard && analysis.improvements) {
                const improvementsList = analysis.improvements.map(improvement => `<li>${improvement}</li>`).join('');
                improvementsCard.innerHTML = `
                    <h3>⚠️ Areas for Improvement</h3>
                    <ul>
                        ${improvementsList}
                    </ul>
                `;
            }

            // Update suggestions
            const suggestionsCard = document.querySelector('.analysis-card:nth-child(4)');
            if (suggestionsCard && analysis.suggestions) {
                const suggestionsList = analysis.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('');
                suggestionsCard.innerHTML = `
                    <h3>💡 Suggestions</h3>
                    <ul>
                        ${suggestionsList}
                    </ul>
                `;
            }

            // Update match score
            const matchScoreCard = document.querySelector('.analysis-card:nth-child(5)');
            if (matchScoreCard && analysis.matchScore) {
                matchScoreCard.innerHTML = `
                    <h3>📊 Match Score</h3>
                    <p>Your profile matches <strong style="color: #10b981; font-size: 1.1rem;">${analysis.matchScore}%</strong> of relevant positions in your field.</p>
                    ${analysis.experienceLevel ? `<p><strong>Experience Level:</strong> ${analysis.experienceLevel}</p>` : ''}
                `;
            }

            // Update key skills if available
            if (analysis.keySkills && analysis.keySkills.length > 0) {
                const skillsList = analysis.keySkills.map(skill => `<span class="skill-tag">${skill}</span>`).join('');
                const skillsSection = document.createElement('div');
                skillsSection.className = 'analysis-card';
                skillsSection.innerHTML = `
                    <h3>🔧 Key Skills</h3>
                    <div class="skills-list">
                        ${skillsList}
                    </div>
                `;
                
                // Insert skills section after strengths
                const strengthsCard = document.querySelector('.analysis-card:nth-child(2)');
                if (strengthsCard) {
                    strengthsCard.parentNode.insertBefore(skillsSection, strengthsCard.nextSibling);
                }
            }

            // Update recommended roles if available
            if (analysis.recommendedRoles && analysis.recommendedRoles.length > 0) {
                const rolesList = analysis.recommendedRoles.map(role => `<li>${role}</li>`).join('');
                const rolesSection = document.createElement('div');
                rolesSection.className = 'analysis-card';
                rolesSection.innerHTML = `
                    <h3>🎯 Recommended Roles</h3>
                    <ul>
                        ${rolesList}
                    </ul>
                `;
                
                // Insert roles section after suggestions
                const suggestionsCard = document.querySelector('.analysis-card:nth-child(4)');
                if (suggestionsCard) {
                    suggestionsCard.parentNode.insertBefore(rolesSection, suggestionsCard.nextSibling);
                }
            }

            // Update search jobs button text to show it uses recommended roles
            const searchJobsBtn = document.getElementById('searchJobsBtn');
            if (searchJobsBtn && analysis.recommendedRoles && analysis.recommendedRoles.length > 0) {
                const rolesText = analysis.recommendedRoles.slice(0, 2).join(', ');
                searchJobsBtn.innerHTML = `
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" style="margin-right: 8px;">
                        <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
                    </svg>
                    Search for ${rolesText} Jobs
                `;
            }

            // Show LaTeX CV generator after analysis is populated
            showLatexCVGenerator();
        }

        // Function to show LaTeX CV generator
        function showLatexCVGenerator() {
            const latexGenerator = document.getElementById('latexCVGenerator');
            if (latexGenerator) {
                latexGenerator.style.display = 'block';
            }
        }

        // Function to generate CV (LaTeX + PDF)
        async function generateCV(analysisData) {
            const generateCvBtn = document.getElementById('generateCvBtn');
            const latexError = document.getElementById('latexError');
            const latexSuccess = document.getElementById('latexSuccess');

            // Show loading state
            generateCvBtn.disabled = true;
            generateCvBtn.innerHTML = `
                <div class="latex-loading"></div>
                Generating Professional CV...
            `;

            // Hide previous messages
            latexError.style.display = 'none';
            latexSuccess.style.display = 'none';

            try {
                console.log('📤 Sending analysis data for CV generation');
                
                const response = await fetch('/generate-cv', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ analysisData })
                });

                console.log('📥 CV generation response status:', response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('❌ CV generation error response:', errorText);
                    throw new Error('Failed to generate CV');
                }

                // Get the filename from the response headers
                const contentDisposition = response.headers.get('content-disposition');
                let filename = 'professional_cv.pdf';
                if (contentDisposition) {
                    const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                    if (filenameMatch) {
                        filename = filenameMatch[1];
                    }
                }

                // Create blob from response
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                
                // Create a temporary link and trigger download
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Clean up the URL
                URL.revokeObjectURL(url);
                
                console.log('✅ Professional CV generated and downloaded successfully');
                
                // Show success message
                latexSuccess.textContent = 'Professional CV generated and downloaded successfully!';
                latexSuccess.style.display = 'block';
                
            } catch (err) {
                console.error('Error generating CV:', err);
                latexError.textContent = err.message || 'Failed to generate CV';
                latexError.style.display = 'block';
            } finally {
                // Reset button state
                generateCvBtn.disabled = false;
                generateCvBtn.innerHTML = `
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" style="margin-right: 8px;">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    </svg>
                    Generate Professional CV
                `;
            }
        }

        // Function to handle download again
        function handleDownloadAgain() {
            const cvAnalysis = authManager.getUserCVAnalysis();
            if (cvAnalysis) {
                generateCV(cvAnalysis);
            }
        }

        // Add event listeners for CV generation
        document.addEventListener('DOMContentLoaded', () => {
            const generateCvBtn = document.getElementById('generateCvBtn');
            const downloadAgainBtn = document.getElementById('downloadAgainBtn');

            if (generateCvBtn) {
                generateCvBtn.addEventListener('click', () => {
                    const cvAnalysis = authManager.getUserCVAnalysis();
                    if (cvAnalysis) {
                        generateCV(cvAnalysis);
                    }
                });
            }

            if (downloadAgainBtn) {
                downloadAgainBtn.addEventListener('click', handleDownloadAgain);
            }

            // Job search event listeners
            const searchJobsBtn = document.getElementById('searchJobsBtn');
            const retryJobsBtn = document.getElementById('retryJobsBtn');
            const searchAgainBtn = document.getElementById('searchAgainBtn');

            if (searchJobsBtn) {
                searchJobsBtn.addEventListener('click', searchJobs);
            }

            if (retryJobsBtn) {
                retryJobsBtn.addEventListener('click', retryJobSearch);
            }

            if (searchAgainBtn) {
                searchAgainBtn.addEventListener('click', retryJobSearch);
            }
        });

        // Apply button functionality
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('apply-btn') && !e.target.classList.contains('applied')) {
                const jobCard = e.target.closest('.job-card');
                const jobId = jobCard.dataset.jobId;
                const jobTitle = jobCard.querySelector('.job-title').textContent;
                const company = jobCard.querySelector('.job-company').textContent;
                const location = jobCard.querySelector('.job-location').textContent;
                
                // Save application
                authManager.saveApplication(jobId, jobTitle, company, location);
                
                // Update UI
                e.target.textContent = 'Applied!';
                e.target.classList.add('applied');
                jobCard.classList.add('applied');
                
                // Update applications list
                const applications = authManager.getUserApplications();
                updateApplicationsList(applications);
                
                setTimeout(() => {
                    alert(`Application submitted for ${jobTitle} at ${company}!`);
                }, 500);
            }
        });

        // Initialize the app when DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM loaded, initializing app');
            initializeApp();
        });

        // Job Search Functionality
        let currentJobs = [];
        let appliedJobs = new Set();
        let hasSearchedJobs = false;

        async function searchJobs() {
            if (hasSearchedJobs) return;
            hasSearchedJobs = true;
            const searchJobsBtn = document.getElementById('searchJobsBtn');
            if (searchJobsBtn) {
                searchJobsBtn.disabled = true;
                searchJobsBtn.innerHTML = `<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" style="margin-right: 8px;"><path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/></svg>Job Search Started`;
            }
            const cvAnalysis = authManager.getUserCVAnalysis();
            if (!cvAnalysis) {
                showJobsError('No CV analysis available. Please upload your CV first.');
                return;
            }

            // Get recommended roles for search
            const recommendedRoles = cvAnalysis.recommendedRoles || [];
            if (recommendedRoles.length === 0) {
                showJobsError('No recommended roles found in your CV analysis. Please try uploading your CV again.');
                return;
            }

            // Show loading state
            showJobsLoading();

            try {
                console.log('🔍 Starting job search with recommended roles:', recommendedRoles);
                
                const response = await fetch('/search-jobs', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ analysisData: cvAnalysis })
                });

                console.log('📥 Job search response status:', response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('❌ Job search error response:', errorText);
                    throw new Error('Failed to search for jobs');
                }

                const result = await response.json();
                console.log('✅ Job search completed, found', result.count, 'jobs');
                
                if (result.success && result.jobs) {
                    currentJobs = result.jobs;
                    displayJobs(result.jobs);
                } else {
                    showJobsEmpty();
                }
                
            } catch (error) {
                console.error('Job search failed:', error);
                showJobsError(error.message || 'Failed to search for jobs');
            }
        }

        function showJobsLoading() {
            hideAllJobStates();
            const loadingElement = document.getElementById('jobsLoading');
            loadingElement.style.display = 'block';
        }

        function showJobsError(message) {
            hideAllJobStates();
            const errorElement = document.getElementById('jobsError');
            const messageElement = document.getElementById('jobsErrorMessage');
            messageElement.textContent = message;
            errorElement.style.display = 'block';
        }

        function showJobsEmpty() {
            hideAllJobStates();
            const emptyElement = document.getElementById('jobsEmpty');
            emptyElement.style.display = 'block';
            
            // Re-add event listener for the new button
            const searchAgainBtn = document.getElementById('searchAgainBtn');
            if (searchAgainBtn) {
                searchAgainBtn.addEventListener('click', retryJobSearch);
            }
        }

        function hideAllJobStates() {
            document.getElementById('jobsLoading').style.display = 'none';
            document.getElementById('jobsError').style.display = 'none';
            document.getElementById('jobsEmpty').style.display = 'none';
        }

        function displayJobs(jobs) {
            hideAllJobStates();
            
            const jobsContainer = document.getElementById('jobsContainer');
            
            if (!jobs || jobs.length === 0) {
                showJobsEmpty();
                return;
            }

            // Get recommended roles from current CV analysis
            const cvAnalysis = authManager.getUserCVAnalysis();
            const recommendedRoles = cvAnalysis?.recommendedRoles || [];

            // Add header showing what roles were searched
            const searchHeader = recommendedRoles.length > 0 ? 
                `<div class="search-header">
                    <h3>Jobs found for: ${recommendedRoles.slice(0, 3).join(', ')}${recommendedRoles.length > 3 ? '...' : ''}</h3>
                    <p>Found ${jobs.length} matching job opportunities</p>
                </div>` : '';

            const jobsHTML = jobs.map((job, index) => {
                const isApplied = appliedJobs.has(job.link);
                
                return `
                    <div class="job-card" data-job-link="${job.link}">
                        <div class="job-title">${job.title}</div>
                        <div class="job-company">${job.company}</div>
                        <div class="job-location">📍 ${job.location} (${job.type || 'Full-time'})</div>
                        
                        ${job.description ? `<div class="job-description">${job.description}</div>` : ''}
                        
                        ${job.skills && job.skills.length > 0 ? `
                            <div class="job-skills">
                                ${job.skills.map(skill => `<span class="job-skill">${skill}</span>`).join('')}
                            </div>
                        ` : ''}
                        
                        ${job.salary ? `<div class="job-salary">💰 ${job.salary}</div>` : ''}
                        
                        ${job.keyword ? `<div class="job-keyword">Matched keyword: <strong>${job.keyword}</strong></div>` : ''}
                        
                        <div class="job-actions">
                            <button class="external-link-btn apply-big-btn" onclick="openJobLink('${job.link}')" title="Apply">
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" style="margin-right:8px;">
                                    <path d="M14,3V7H17.59L7.76,16.83L9.17,18.24L19,8.41V12H21V3M19,19H5V5H12V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"/>
                                </svg>
                                Apply
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

            jobsContainer.innerHTML = searchHeader + jobsHTML;
        }

        function applyToJob(jobLink, jobTitle, company, location) {
            // Save application
            authManager.saveApplication(jobLink, jobTitle, company, location);
            
            // Mark as applied
            appliedJobs.add(jobLink);
            
            // Update UI
            const jobCard = document.querySelector(`[data-job-link="${jobLink}"]`);
            if (jobCard) {
                const applyBtn = jobCard.querySelector('.apply-btn');
                applyBtn.textContent = 'Applied ✓';
                applyBtn.classList.add('applied');
                applyBtn.disabled = true;
                jobCard.classList.add('applied');
            }
            
            // Update applications list
            const applications = authManager.getUserApplications();
            updateApplicationsList(applications);
            
            // Show success message
            setTimeout(() => {
                alert(`Application submitted for ${jobTitle} at ${company}!`);
            }, 500);
        }

        function openJobLink(link) {
            window.open(link, '_blank', 'noopener,noreferrer');
        }

        function retryJobSearch() {
            searchJobs();
        }

        // Make functions globally accessible for onclick handlers
        window.applyToJob = applyToJob;
        window.openJobLink = openJobLink;
        window.retryJobSearch = retryJobSearch;