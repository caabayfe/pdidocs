// Ensure that the new node value is valid (>= 1)
var nodeValue = current.value;

if (nodeValue === '' || isNaN(nodeValue)) {
	nodeValue = 5; // use current default
	gs.addInfoMessage(gs.getMessage("Invalid Maximum amount of results displayed when searching for Relationship Types, replaced with default of 5"));
} else if (nodeValue < 1) {
	nodeValue = 1;
	gs.addInfoMessage(gs.getMessage("Maximum amount of results displayed when searching for Relationship Types value cannot be less than 1; replaced with 1"));
}

current.value = String(parseInt(nodeValue));
