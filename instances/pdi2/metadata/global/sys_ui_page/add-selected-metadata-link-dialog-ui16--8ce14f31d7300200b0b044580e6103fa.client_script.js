showHideLoadWhenField();

function showHideLoadWhenField() { 
	var loadFieldLabelParent = angular.element(document.getElementById("status.add_metadata_link.load_when").parentElement.parentElement);
	var loadFieldChoiceParent = angular.element(document.getElementById("dir_choicelist").parentElement);

	if ('$[gs.isCurrentApplicationCustom()]' == 'false') {
		loadFieldLabelParent.hide();
		loadFieldChoiceParent.hide();
	}
	else {
		loadFieldLabelParent.show();
		loadFieldChoiceParent.show();
	}
}
