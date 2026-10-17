function() {
	var listeners = [];
	var defaultListener;
	var categoryId;
	var categoryPicked = false;

	function setCategoryId(catId) {
		categoryId = catId;
		if (listeners.length > 0) {
			listeners.forEach(function(fn){ fn.call(null, catId); });
			return;
		}
		
		// Call the default listener if no other listeners were set
		if (defaultListener)
			defaultListener.call(null, catId);
	}
	
	function addListener(callbackFn) {
		listeners.push(callbackFn);
		
		return function removeListener() {
			var l = listeners.indexOf(callbackFn);
			if (l > -1)
				listeners.splice(l, 1);
		};
	}
	
	function addDefaultListener(callbackFn) {
		defaultListener = callbackFn;
	}
	
	function getCategoryId() {
		return categoryId;
	}

	function setCategorySelected(val) {
		categoryPicked = val;
	}

	function isCategorySelected() {
		return categoryPicked;
	}

	return {
		setCategoryId: setCategoryId,
		addListener: addListener,
		addDefaultListener: addDefaultListener,
		getCategoryId: getCategoryId,
		isCategorySelected: isCategorySelected,
		setCategorySelected: setCategorySelected
	};
}
