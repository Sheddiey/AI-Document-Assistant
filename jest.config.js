module.exports = {
  transformIgnorePatterns: [
    "node_modules/(?!react-pdf|pdfjs-dist/.*)", // Transform react-pdf and pdfjs-dist
  ],
  testEnvironment: "jsdom",
};
