// Ensure that max child nodes value is valid (>= 1)
var maxLinksPerNodes = current.value;

if (maxLinksPerNodes === '' || isNaN(maxLinksPerNodes)) {
	maxLinksPerNodes = 100; // use current default
	gs.addInfoMessage(gs.getMessage("Invalid max links per node value, replaced with default of 100"));
} else if (maxLinksPerNodes < 1) {
	maxLinksPerNodes = 1;
	gs.addInfoMessage(gs.getMessage("Max links per node value cannot be less than 1; replaced with 1"));
}

current.value = String(parseInt(maxLinksPerNodes));
