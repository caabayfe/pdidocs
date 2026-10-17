// Parallels the level_selection script in the KeyLines UI Page 
var maxLevelDepth = current.value;

if (maxLevelDepth == '' || isNaN(maxLevelDepth)) {
	maxLevelDepth = 3; // use current default
	gs.addInfoMessage(gs.getMessage("Invalid maximum level depth. Value replaced with 3"));
} else if (maxLevelDepth < 1) {
	maxLevelDepth = 1;
	gs.addInfoMessage(gs.getMessage("Maximum level depth cannot be less than 1. Value replaced with 1"));
} else if (maxLevelDepth > 49) {
	maxLevelDepth = 49;
	gs.addInfoMessage(gs.getMessage("Maximum level value depth cannot be more than 49. Value replaced with 49"));
}

current.value = String(parseInt(maxLevelDepth));
