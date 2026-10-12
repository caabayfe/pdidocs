function transform(input) {
    /**!
    * @name get
    * @description Gets the value at path of object. If the resolved value is undefined,
    *  the defaultValue is returned in its place.
    *
    * @param {Object} object The object to query.
    * @param {Array|string} path The path of the property to get.
    * @param {*} [value] The default value returned for `undefined` resolved values.
    * @returns {*} Returns the resolved value.
    *
    */
    var get = function (object, path, value) {
        var pathArray;

        // If path is not defined or it has false value
        if (!path) return undefined;

        // Check if path is string or array. Regex : ensure that we do not have '.' and brackets
        pathArray = Array.isArray(path) ?
            path :
            path.split(/[,[\].]/g).filter(Boolean);

        // Find value if exist return otherwise return undefined value;
        var pathResult = pathArray.reduce(function (prevObj, key) {
                return prevObj && prevObj[key];
        }, object);

        return pathResult === undefined ?  value : pathResult;
    };

	var result = [];
    var styles = get(input, "graphqlData.data.GlideRecord_Query.sys_ux_app._results.0._query.GlideRecord_Query.m2m_theme_style._results", undefined);
	
	if(!styles) return result;
	
	for(var j = 0; j < styles.length; j ++) {
		var style = get(styles[j], "_query.GlideRecord_Query.sys_ux_style._results.0", null);
		
		if(!style) continue;
		
		if(style.type.value == "variant") {
			result.push({ name: style.name.value, type: style.type.value, sys_id: style.sys_id.value});
		}
	}
	return result;
}
