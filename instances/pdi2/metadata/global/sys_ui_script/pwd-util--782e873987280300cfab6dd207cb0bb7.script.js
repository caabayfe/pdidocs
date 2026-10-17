// To be invoked by JS events, in order to update the red asterisk to grey if a field is filled or vice versa
function updateMandatoryMarker(fieldElem, requiredMarkerId) {

    var valueToCheck = fieldElem.value.trim();

	// Special case for select elements with a -- None -- value such as the selector on the $pwd_change page
	if (fieldElem.tagName.toLowerCase() == 'select') {
	    var selectedOption = fieldElem.options[fieldElem.selectedIndex];
	    valueToCheck = selectedOption.value === '0'? '' : selectedOption.value;
    }

    var requiredElem = $j('#' + requiredMarkerId);
	if (valueToCheck != "")
		requiredElem.addClass("is-filled");
	else
		requiredElem.removeClass("is-filled");
}


// Adds the appropriate event UI Macro event listeners.
function addMacroEventListeners(loadElemId, reloadElemId) {
	addMacroLoadedEventListener(loadElemId || null);
	addMacroReloadEventListener(reloadElemId || loadElemId || null); // Use the loadElem if no reloadElem is passed
}

// Adds a event listener to set focus to a certain element
// when the "macroLoaded" event is fired
function addMacroLoadedEventListener(elementId) {
	if (elementId != null) {
		CustomEvent.observe('macroLoaded', function(e) {
			  focusElemIfFound(elementId);
		});
	}
}

// Adds a event listener to set focus to a certain element
// when the "macroReloaded" event is fired
function addMacroReloadEventListener(elementId) {
	if (elementId != null) {
		CustomEvent.observe('macroReloaded', function(e) {
			  focusElemIfFound(elementId);
		});
	}
}

function focusElemIfFound(elementId) {
	var focusElem = gel(elementId);
	if (focusElem)
		focusElem.focus();
}
