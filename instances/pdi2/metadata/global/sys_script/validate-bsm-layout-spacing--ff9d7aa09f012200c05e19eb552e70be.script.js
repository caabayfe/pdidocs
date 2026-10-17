// Check for boundries 
var val = current.value;

if (val == '' || isNaN(val) ) {
	val = 125; // use current default
	gs.addInfoMessage(gs.getMessage("Invalid layout spacing value, replaced with 125"));
} else if (val < 20) {
	val = 20;
	gs.addInfoMessage(gs.getMessage("Minimum layout spacing value cannot be less than 20. Value replaced with 20"));
} else if (val > 1000) {
	val = 200;
	gs.addInfoMessage(gs.getMessage("Maximum layout spacing value cannot exeed 1000. Value replaced with 200"));
}

current.value = String(parseInt(val));
