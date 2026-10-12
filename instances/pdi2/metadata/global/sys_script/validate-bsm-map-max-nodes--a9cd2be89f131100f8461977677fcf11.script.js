// Ensure that max nodes value is valid (>= 1. Integer)
var maxNodes = current.value;

if (maxNodes == '' || isNaN(maxNodes)) {
	maxNodes = 1000; // use current default
	gs.addInfoMessage("Invalid maximum number of CIs to display. Value replaced with 1000");
} else if (maxNodes < 1) {
	maxNodes = 1;
	gs.addInfoMessage("Maximum number of CIs to display cannot be less than 1. Value replaced with 1");
}

current.value = String(parseInt(maxNodes)); // force floats to ints
