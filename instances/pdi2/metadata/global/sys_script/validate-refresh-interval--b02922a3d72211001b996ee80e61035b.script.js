var interval = current.value;

if (interval == '' || isNaN(interval)) {
	interval = 30; // use current default
	gs.addInfoMessage(gs.getMessage("Invalid refresh interval was replaced with default of 30"));
} else if (interval < 1) {
	interval = 1;
	gs.addInfoMessage(gs.getMessage("Refresh interval value cannot be less than 1; replaced with 1"));
} else if (interval > 3600) {
	interval = 3600;
	gs.addInfoMessage(gs.getMessage("Refresh interval value cannot be more than 3600; replaced with 3600"));
}

current.value = String(parseInt(interval));
