// ✅ hello.js - Exported function
function printHelloWorld() {
  console.log("✅ Hello, World!");
}

function printGoodbyeWorld() {
  console.log("✅ Goodbye, World!");
}

// ✅ Expose the function globally so it can be used in the browser
window.printHelloWorld = printHelloWorld;
window.printGoodbyeWorld = printGoodbyeWorld;
