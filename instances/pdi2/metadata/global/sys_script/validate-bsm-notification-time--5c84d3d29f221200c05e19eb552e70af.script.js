// Ensure that the new node value is valid (>= 1)
var nodeValue = current.value;

if (nodeValue === '' || isNaN(nodeValue)) {
	nodeValue = 5000; // use current default
	gs.addInfoMessage(gs.getMessage("Invalid amount of notification display time, replaced with default of 5000"));
} else if (nodeValue < 1) {
	nodeValue = 1;
	gs.addInfoMessage(gs.getMessage("Amount of notification display time value cannot be less than 1; replaced with 1"));
}

current.value = String(parseInt(nodeValue));
