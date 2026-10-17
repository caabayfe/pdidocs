(function() {
	try {
		if (!gel) return;
		if (!gel("sysverb_create_with_now_assist")) return;
		var buttonText = getMessage("Create with Now Assist");
		gel("sysverb_create_with_now_assist").innerHTML = "<img src='/images/ai-sparkle.svg'/> " + buttonText;
	} catch (e) {
		return;
	}
})();
function onCellEdit(sysIDs, table, oldValues, newValue, callback) {
  var saveAndClose = true;
  callback(saveAndClose); 
}
