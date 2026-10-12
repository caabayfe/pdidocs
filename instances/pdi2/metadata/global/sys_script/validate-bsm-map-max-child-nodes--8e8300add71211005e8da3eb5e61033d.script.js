// Ensure that max child nodes value is valid (>= 1)
var maxChildNodes = current.value;

if (maxChildNodes == '' || isNaN(maxChildNodes)) {
	maxChildNodes = 10; // use current default
	gs.addInfoMessage("Invalid max child nodes value replaced with default of 10");
} else if (maxChildNodes < 1) {
	maxChildNodes = 1;
	gs.addInfoMessage("Max child node value cannot be less than 1; replaced with 1");
}

current.value = String(parseInt(maxChildNodes));
