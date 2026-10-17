// Discovery

/*
 * The following functions are working on the parameters resulted from "ps" command
 */
 
var ProcessParamParser = Class.create();
ProcessParamParser.prototype = {
	
    initialize: function(parameters) {
		this.parameters = parameters;
    },
	
	/* 
	 * splits the parameters based on the value of the input deliminator
	 * and returns the parameterPart with index = pIndex
	 * If the deliminator is not passed, the default value is the whitespace
	 */
	getParameterByIndex: function(pIndex, deliminator) {
		deliminator = typeof deliminator != 'undefined' ? deliminator : /\s+/;
		var paramParts = this.parameters.split(deliminator);
		return paramParts[pIndex];
	},
	
	/*
	 * returns the value of the parameter identified by -opt
	 * for example if the parameters = " -d /etc/haproxy  –f /etc/haproxy/haproxy.cfg " 
     * then getParameterByOption('f') returns /etc/haproxy/haproxy.cfg
	 * It can handle the values with white spaces. For example if 
	 * parameters = "-d /etc/haproxy  –f /etc/haproxy/myServer haproxy.cfg"
	 * then getParameterByOption('f') returns /etc/haproxy/myServer haproxy.cfg
	 *
	 * * Note: This function returns correct value as long as all parameters are specified 
	 *          by -option, if parameters include some options without -option prefix, there is
	 * 		 no guaranty to return correct value 
	 * 
	 */
	getParameterByOption: function(opt) {
		var value = '';
		var optIndex = this.parameters.indexOf('-' + opt);
		
		// There is not the option in the parameters
		if (optIndex == -1 )
			return value;
		
		// substring of the parameteres starting after '-opt'
		var tempStr = this.parameters.substring(optIndex + opt.length + 1 );
		tempStr = tempStr.trim();
		
		// index of the next option after -opt in the parameters
		var optIndex2 = tempStr.indexOf(' -'); 
		
		if (optIndex2 == -1 )
			value = tempStr; 
		else				
			value = tempStr.substring(0, optIndex2);
		
		return value;
			
	},
	// Check if the input str has some white space wraps them in double quotes. 
	putDoubleQuotes: function(str) {
		var value = str.trim();
		if (JSUtil.nil(value))
			return (' ');
		
		if (str.indexOf(' ') != -1)
			value = '"' + value + '"';
		return value; 
	},
	/* 
 	* If the path is not started from the root '/'
 	* the following function completes the input path based on dataPath 
 	*/ 
	getCompletePath: function (path, dataPath) {
		var compPath = path;
		if (typeof dataPath == 'undefined' || JSUtil.nil(dataPath))
			return compPath;
	
		compPath = compPath.trim();
		if (JSUtil.notNil(compPath) && compPath.charAt(0) != '/')
			compPath = dataPath + '/' + compPath;
	
		return compPath;
	},
	
    type: 'ProcessParamParser'
}
