var testPageFrame = document.getElementById("inner-frame");
var testPageWindow = testPageFrame.contentWindow;
var testPageDocument = testPageWindow.document;

// Create a new GlideAutomateWait instance to test inside of an isolated
// environment that is unaffected by whatever our sys_ui_page might be doing
var gaw = new GlideAutomateWait(
	function() {
		return testPageFrame;
	},
	function() {
		return testPageWindow;
	},
	function() {
		return testPageDocument;
	}
);
top.gaw = gaw;
