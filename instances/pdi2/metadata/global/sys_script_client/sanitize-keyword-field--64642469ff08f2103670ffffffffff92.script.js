function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
   control.setValue(generateKeywordFromInput(newValue));
}

function generateKeywordFromInput(inputValue) {

	var keyword = inputValue.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_');

	// Compact any multiple sequential underscores
	while (keyword.indexOf("__") != -1) {
		keyword = keyword.replace(/__/g, "_");
	}

	// Replace any trailing underscores
	while (keyword != '' && keyword.charAt(keyword.length - 1) == '_') {
		keyword = keyword.substring(0, keyword.length - 1);
	}

	return keyword;
}
