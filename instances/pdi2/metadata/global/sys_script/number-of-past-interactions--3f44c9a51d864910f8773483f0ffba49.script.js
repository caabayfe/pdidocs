var inputValue = current.value;
var numberOfPastInteractions = 10;
if (inputValue == '' || isNaN(inputValue)) {
    gs.addInfoMessage(gs.getMessage("Invalid number of past interactions to display value; replaced it with default value 10"));
} else {
    numberOfPastInteractions = parseInt(inputValue);
    if (numberOfPastInteractions < 1) {
        numberOfPastInteractions = 1;
        gs.addInfoMessage(gs.getMessage("Number of past interactions to display value cannot be less than 1; replaced with 1"));
    } else if (numberOfPastInteractions > 25) {
        numberOfPastInteractions = 25;
        gs.addInfoMessage(gs.getMessage("Number of past interactions to display value cannot be more than 25; replaced with 25"));
    }
}
current.value = String(parseInt(numberOfPastInteractions));
