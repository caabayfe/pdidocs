function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || isTemplate || !newValue)
      return;
   
	// Only auto populate path_pattern if it's empty
	var pathPattern = g_form.getValue('path_pattern');
	if (pathPattern)
		return;
	
	g_form.setValue('path_pattern', generatePath(newValue));
   
	/**
	 * Generates a URL-safe path from a title string
	 * @param {string} title - The title to convert to a path
	 * @returns {string|null} - A URL-safe path string prefixed with "/" or null if title is empty/null/undefined
	 */
	function generatePath(title) {
		if (!title || title.trim() === '')
			return null;

		// Convert to lowercase
		var path = title.toLowerCase();

		// Replace characters that need URL encoding or spaces with underscore
		// Keep only alphanumeric, hyphens, and underscores
		path = path.replace(/[^a-z0-9\-_]/g, '_');

		// Replace multiple consecutive underscores with a single underscore
		path = path.replace(/_+/g, '_');

		// Remove leading and trailing underscores
		path = path.replace(/^_+|_+$/g, '');

		// Prefix with "/"
		return '/' + path;
	}
}
