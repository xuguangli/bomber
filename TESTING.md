# Testing Instructions

To validate the Bomber project locally, run the following commands from the repository root:

```bash
node --check web-server/public/js/lib/local/bomber.js
node web-server/app.js
```

The first command performs a syntax check of the bomber client script, while the second launches the development web server so you can verify the application starts without runtime errors. Use `Ctrl+C` to stop the server after confirming it starts successfully.
