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
                // Could restore previous analysis here
                console.log('Previous CV analysis found');
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

            // Simulate AI processing and save analysis
            setTimeout(() => {
                const analysis = {
                    fileName: file.name,
                    fileSize: file.size,
                    uploadedAt: new Date().toISOString(),
                    strengths: ['Strong technical background', 'Problem-solving skills', 'Project management'],
                    improvements: ['Add quantifiable achievements', 'Include certifications'],
                    suggestions: ['Add professional summary', 'Include portfolio links'],
                    matchScore: 85
                };

                authManager.saveCVAnalysis(analysis);
                loadingScreen.classList.remove('show');
                dashboard.classList.add('show');
            }, 3000);

            const formData = new FormData();

            formData.append("pdfFile", file);

            fetch("/extract-text", {
                method : "post",
                body : formData
            }).then(response => {
                return response.text(); 
            }).then(extractedText => {
                console.log(extractedText);
            })
        }

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