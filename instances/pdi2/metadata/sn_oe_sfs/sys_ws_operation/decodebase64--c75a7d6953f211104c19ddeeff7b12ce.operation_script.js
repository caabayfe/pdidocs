(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var encodedString = request.pathParams.encodedString;
	encodedString = encodedString.replace("__channel__","%2F");
	encodedString = decodeURIComponent(encodedString);
	return JSON.parse(gs.base64Decode(encodedString));
})(request, response);
