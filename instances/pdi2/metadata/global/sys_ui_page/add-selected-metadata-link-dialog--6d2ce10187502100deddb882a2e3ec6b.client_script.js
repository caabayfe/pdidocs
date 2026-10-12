toggleCompactModalPane(); // initial setup
CustomEvent.observe('compact', toggleCompactModalPane);
showHideLoadWhenField();

function showHideLoadWhenField() {
	var loadFieldLabel = document.getElementById("label.add_metadata_link.load_when");
	var loadFieldChoice = document.getElementById("dir_choicelist");
	
	var loadFieldLabelParent = loadFieldLabel && loadFieldLabel.up();
	var loadFieldChoiceParent = loadFieldChoice && loadFieldChoice.up();
	
	if (!loadFieldLabelParent || !loadFieldChoiceParent)
		return;

	if (!$[gs.isCurrentApplicationCustom()])  {
		loadFieldLabelParent.hide();
		loadFieldChoiceParent.hide();
	}
	else {
		loadFieldLabelParent.show();
		loadFieldChoiceParent.show();
	}
}

function toggleCompactModalPane(e) {
	var modalElement = document.getElementById("add_metadata_link_dialog_container");
	var modalElems = [];
	if (window.NOW.compact) {
		modalElems = modalElement.querySelectorAll(".row");
		modalElement.className = "compact";
		for (var i = 0; i<modalElems.length; i++) {
			modalElems[i].classList.remove("row");
			modalElems[i].classList.add("row-compact");
		}
	} else {
		modalElement.className = "";
		modalElems = modalElement.querySelectorAll(".row-compact");
		for (var j = 0; j < modalElems.length; j++) {
			modalElems[j].classList.remove("row-compact");
			modalElems[j].classList.add("row");
		}
	}
}
