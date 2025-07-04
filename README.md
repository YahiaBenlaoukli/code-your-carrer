# CareerLift

CareerLift is an AI-powered career assistant that analyzes your CV, provides actionable insights, and matches you with relevant job opportunities. It features a modern, user-friendly interface and supports PDF/DOC/DOCX uploads, LaTeX CV generation, and more.

## Features

- **AI CV Analysis**: Upload your resume and receive instant, AI-powered feedback on strengths, areas for improvement, and suggestions.
- **Job Matching**: Get personalized job recommendations based on your CV analysis.
- **LaTeX CV Generator**: Generate a professional CV in LaTeX and download a ready-to-use PDF.
- **User Authentication**: Register and log in securely to save your progress and applications.
- **Application Tracking**: Keep track of jobs you've applied to.
- **Modern UI**: Clean, responsive design for a seamless experience.

## Tech Stack

- **Frontend**: HTML, CSS (custom + Tailwind), JavaScript (vanilla)
- **Backend**: Node.js, Express.js
- **PDF & DOC Parsing**: pdf-parse, (add docx parser if used)

## Project Structure

```
CareerLift/
├── public/
│   ├── index.html           # Main app UI
│   ├── landingpage.html     # Landing page
│   ├── style.css            # Main styles
│   ├── index.js             # Main frontend JS
│   └── ...
├── server.js                # Express backend
├── package.json             # Dependencies and scripts
├── README.md                # Project documentation
└── ...
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CareerLift
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Start the server**
   ```bash
   npm start
   ```
4. **Open your browser**
   - Visit `http://localhost:3000` (or the port shown in your terminal)

## Usage

1. **Go to the landing page** and click "Get Started" or "Start Analysis".
2. **Register/Login** to your account.
3. **Upload your CV** (PDF, DOC, or DOCX).
4. **View your AI-powered analysis** and job matches.
5. **Generate a LaTeX CV** or browse job recommendations.
6. **Apply to jobs** (external link) and track your applications.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add feature'`)
4. Push to your branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Future Enhancements

- [ ] Advanced AI analysis with machine learning
- [ ] Integration with more job APIs
- [ ] Email notifications for job matches
- [ ] Resume builder and optimization tools
- [ ] Interview preparation resources
- [ ] Mobile app version
