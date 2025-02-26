// ✅ hello.js - Exported function
function printHelloWorld() {
  console.log("✅ Hello, World!");
}

// ✅ Expose the function globally so it can be used in the browser
window.printHelloWorld = printHelloWorld;
