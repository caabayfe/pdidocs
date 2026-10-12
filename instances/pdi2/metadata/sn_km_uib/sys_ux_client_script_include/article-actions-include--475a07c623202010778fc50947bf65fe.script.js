function include() {
	return {
		getOrigin: function() {
			return location.origin;
		},
		getClipboard: function() {
			return navigator.clipboard;
		},
		getTrimmedValue: function(value) {
			return (new DOMParser)
				.parseFromString(value, 'text/html')
				.documentElement.textContent.toString()
				.trim();
		}
	};
}
