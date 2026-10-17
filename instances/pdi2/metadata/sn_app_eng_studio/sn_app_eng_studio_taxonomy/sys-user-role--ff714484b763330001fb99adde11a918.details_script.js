(function(file) {
	// The application file being operated on is called 'file'. The function must return an object.
	// The object's keys will override any calculated values from the configuration.
	// Keys available to override are: name, description, launch_url, editor_url
	// The fields name, description, and type should be translated values
	function _getName(file) {
		return file.getValue("suffix") || file.getValue("name") || gs.getMessage("(empty)");
	} 
	
	return {
		name: _getName(file)
	};
})(globalFileObjectRecord);
