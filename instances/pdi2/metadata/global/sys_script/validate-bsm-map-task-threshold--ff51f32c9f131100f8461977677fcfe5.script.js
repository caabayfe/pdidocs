var taskThreshold = current.value;

if (taskThreshold == '' || isNaN(taskThreshold)) {
	taskThreshold = 3; // use current default
	gs.addInfoMessage(gs.getMessage("Invalid task threshold for glyph color. Value replaced with 3"));
} else if (taskThreshold < 1) {
	taskThreshold = 1;
	gs.addInfoMessage(gs.getMessage("Task threshold for glyph color cannot be less than 1. Value replaced with 1"));
}

current.value = String(parseInt(taskThreshold)); // convert floats to integers
