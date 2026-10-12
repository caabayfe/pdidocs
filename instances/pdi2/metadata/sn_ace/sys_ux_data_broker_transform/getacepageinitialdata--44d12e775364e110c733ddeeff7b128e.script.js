function transform(input) {
    if (!input || !input.page_route) return {};
    var result = {};
    var gr = new GlideRecord("sn_ace_page");
    if (gr.get(input.page_route)) {
        result = gr.getValue("client_context") || {};
        if (typeof result == "string") {
            result = JSON.parse(result);
			// Added Below code for Diff logic issue
            if (!result.__ace_internal__) {
                result.__ace_internal__ = {
                    'loadTime': Date.now()
                };
            }
        }
		result = convertToNormalFormat(result);
    }
    return result;

    function convertToNormalFormat(customObject) {
        var jsonObject = {};
        for (var key in customObject) {
            if (customObject[key].type === "MAP_CONTAINER") {
                jsonObject[key] = convertToNormalFormat(customObject[key].container);
            } else {
                jsonObject[key] = customObject[key];
            }
        }
        return jsonObject;
    }
}
