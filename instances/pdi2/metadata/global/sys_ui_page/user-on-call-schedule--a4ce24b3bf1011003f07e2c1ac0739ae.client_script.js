/**
 * Hides or displays the start and end date input fields
 * 
 * @param boolean display (true = show, false = hide)
 */
function showDateSelectors(display) {
	var attribute = (display ? "block" : "none");
	if (gel("schedule_date"))
		gel("schedule_date").style.display = attribute;
	else {
		gel("schedule_start_date").style.display = attribute;
		gel("schedule_end_date").style.display = attribute;
	}
}

/**
 * Event handler for when schedule range value changes
 */
function onChangeScheduleRange() {
   var range = gel("schedule_range").value;

   // show or hide the start and end date selector depending on the range value
   showDateSelectors(range === "date_range");
}
