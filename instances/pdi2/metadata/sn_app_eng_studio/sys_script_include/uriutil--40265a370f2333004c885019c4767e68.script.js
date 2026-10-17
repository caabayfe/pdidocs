var UriUtil = (function () {

	CLIENT_SYSPARM_PREFIX = "client:";
	
	return {
	
		/*
		 * return a URI in the format of /<tableName>.do(?queryParameters)
		 */
		createDefaultTableUri : function (tableName, queryParameters, prefixWithSlash) {
		
			if (gs.nil(tableName))
				return null;
			
			if (gs.nil(queryParameters)) {
				queryParameters = {};
			}
			
			if (prefixWithSlash === undefined)
				prefixWithSlash = true;
			
			var baseUri = tableName + ".do";
			
			tableUri = prefixWithSlash ? "/" + baseUri : baseUri;
			
			if (Object.keys(queryParameters).length == 0)
				return tableUri;
			
			return tableUri + "?" + buildQueryParameterString(queryParameters);
			
		},
		
		/*
		 * Takes the specified URI, ensures that it's prefixed with a "/" and handles appending the specified query parameters
		 * to the created URI, i.e. handles cases where the given URI has query parameters and does not have query parameters.
		 */
		createCanonicalizedUri : function (uri, queryParameters) {
			
			if (gs.nil(uri))
				return null;
			
			if (gs.nil(queryParameters)) {
				queryParameters = {};
			}
			
			var canonicalizedUri = uri;
			
			if (!canonicalizedUri.startsWith("/"))
				canonicalizedUri = "/" + canonicalizedUri;
			
			if (Object.keys(queryParameters).length > 0) {
			
				// Check to see if the canonicalized url already has query parameters. If it doesn't then
				// we append a ? because we need to add some query parameters. If it does have query parameters
				// we append a & because we need to add additional query parameters.

				if (!canonicalizedUri.contains("?"))
					canonicalizedUri = canonicalizedUri + "?";
				else
					canonicalizedUri = canonicalizedUri + "&";
			
				canonicalizedUri = canonicalizedUri + buildQueryParameterString(queryParameters);
				
			}			
			
			return canonicalizedUri;
		
		}
			
	};
	
	function buildQueryParameterString(queryParameters) {

		return Object.keys(queryParameters)
			.map(function (queryParamKey){

				var queryParamValue = queryParameters[queryParamKey];

				// Skip encoding any param value that has client: which is short for {client:<paramName>}, i.e. {client:Name}
				// ultimately those values need to be interpolated on the client side.

				var encodedParamValue = encodeQueryParamValue(queryParamValue) ? gs.urlEncode(queryParamValue) : queryParamValue;

				return gs.urlEncode(queryParamKey) + '=' + encodedParamValue;

			})
			.join('&');

	}
	
	/*
	 * There are a couple of query parameter values that should be skipped when URI encoding the query parameters. We
	 * need to skip any value that begins with the CLIENT_SYSPARM_PREFIX because the URI needs to convey that the URI 
	 * requires additional interpolation by the frontend.
	 */
	function encodeQueryParamValue(queryParamValue) {
		return !queryParamValue.contains(CLIENT_SYSPARM_PREFIX);		
	}
	
})();
