function transform(input) {
	var envLogger = scriptlet;

	// depth first search for _results array field
	function _recursFindKey(obj, key) {
		if (typeof(obj) !== "object" || obj === null || obj === undefined || typeof(key) !== "string") {
			envLogger.print("Get Results transform error: invalid input for property ''" + key + "'' (type: " + typeof(key) + ")");
			return null;
		}
		for (var k in obj) {
			if (k == key)
				return obj[k];

			var child = obj[k];
			if (typeof(child) !== 'object' || child === null || child === undefined)
				continue;

			var result = _recursFindKey(child, key);
			if (result != null)
				return result;
		}
		return null;
	}

	function _nil(str) {
		return typeof(str) === 'undefined' || str == null || str == '';
	}

	function _subNil(str, ifNil) {
		return _nil(str) ? ifNil : str;
	}

	var iterationType = "props";
	var result = input && input.query ? _recursFindKey(input.query, "_results") || input.query : null;
	if (result) {
		if (result.length == 1)
			result = result[0];
		else if (result.length > 1)
			iterationType = "array";
	}

	if (!result)
		return ["Label ID Transform error: invalid input param: Expected to find property '_results'" ];

	var answer = [];
	var answerItem;
	if ("array" == iterationType) {
		for (var i = 0; i < result.length; i++) {
			var item = result[i];
			if (item == null) continue;

			answerItem = {
				"label": item._row_data ? item._row_data.displayValue : "Unknown",
				"id": item._row_data ? item._row_data.uniqueValue : ""
			};
			if (input.labelField && item[input.labelField])
				answerItem["label"] = _subNil(item[input.labelField].displayValue, item._row_data ? item._row_data.displayValue : "Unknown");
			if (input.idField && item[input.idField])
				answerItem["id"] = _subNil(item[input.idField].value, item._row_data ? item._row_data.uniqueValue : "");
			if (input.valueField && item[input.valueField])
				answerItem["value"] = _subNil(item[input.valueField].displayValue, item._row_data ? item._row_data.displayValue : "Unknown");

			answer.push(answerItem);
		}
	} else {
		for (var key in result) {
			if ("_row_data" == key)
				continue;

			var element = result[key];
			if (element == null) continue;

			answerItem = {
				"label": (input.labelField && element[input.labelField]) ? element[input.labelField] : key,
				"id": _subNil(element.value, "")
			};
			if (!_nil(input.idField))
				answerItem["id"] = _subNil(element[input.idField] || element.value, "");
			if (!_nil(input.valueField))
				answerItem["value"] = _subNil(element[input.valueField] || element.displayValue, "");
			answer.push(answerItem);
		}
	}

	return answer;
}
