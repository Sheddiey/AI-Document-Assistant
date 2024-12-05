## Installation
Clone the repository:
`git clone <repository-url>`
Navigate to the project directory:
`cd ai-document-assistant`
Install dependencies:
`npm install`
or
`yarn install`

## Running the Development Server
1. Start the server:
    `npm start`
      or
    `yarn start`
2. Open the application in your browser:
    `http://localhost:3000`

## Application Features and How to Use Them
## Upload Component
1. Drag and drop a document (formats supported: .txt, .docx, .pdf) into the upload area, or click to select a file from your system.
2. If the file format is unsupported, an error message will be displayed.
## Document Viewer
1. After a successful upload, the original document will be displayed on the left side, and the improved version will be displayed on the right side.
2. The system processes the document to extract text and provide suggested improvements.
## Suggestion Interface
1. Suggested improvements (for grammar, clarity, etc.) are highlighted in the improved version on the right.
2. Users can review and accept or reject suggestions:
    Accept: Applies the suggestion.
   Reject: Retains the original text.
3. Users can save the improved document in the desired format (TXT, DOCX, or PDF) or proceed without saving.
