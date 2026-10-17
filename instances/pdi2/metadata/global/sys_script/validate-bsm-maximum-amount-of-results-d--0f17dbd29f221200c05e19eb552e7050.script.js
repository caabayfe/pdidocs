// Ensure that the new node value is valid (>= 1)
var nodeValue = current.value;

if (nodeValue === '' || isNaN(nodeValue)) {
	nodeValue = 10; // use current default
	gs.addInfoMessage(gs.getMessage("Invalid Maximum amount of results displayed when searching for CIs, replaced with default of 10"));
} else if (nodeValue < 1) {
	nodeValue = 1;
	gs.addInfoMessage(gs.getMessage("Maximum amount of results displayed when searching for CIs value cannot be less than 1; replaced with 1"));
}

current.value = String(parseInt(nodeValue));
