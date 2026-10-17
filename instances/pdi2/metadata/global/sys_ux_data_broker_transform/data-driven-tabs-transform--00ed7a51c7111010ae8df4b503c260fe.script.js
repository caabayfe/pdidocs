function transform(input) {
    var ROUTE = 'route';
    var LABEL = 'label';
    var FIELDS = 'fields';

    try {
        var items = input.items;
        var isArray = Array.isArray(items);

        if (!isArray) {
            throwError('Bound items should be an array');
        }

        var response = [];

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            validateItem(item);

            var fields = flattenFields(Object.keys(item), item, {});

            response.push({
                route: item[ROUTE],
                label: item[LABEL],
                fields: fields
            });
        }
    } catch (e) {
        return e.message;
    }
	
	// helpers will be hoisted up
	function isObject(item) {
		return (typeof item === "object" && !Array.isArray(item) && item !== null);
	}
	
    function throwError(message, data) {
        var parsed = data ? JSON.stringify(data, null, 4) : '';
        throw new TypeError(message + ' ' + parsed);
    }

    function validateItem(item) {
        if (isObject(item)) {
            var keys = Object.keys(item);
            if (keys.indexOf(ROUTE) === -1) {
                throwError('Expected ' + ROUTE + ' to exist in', item);
            }
            if (keys.indexOf(LABEL) === -1) {
                throwError('Expected  ' + LABEL + ' to exist in', item);
            }
        } else {
            throwError('Expected object, found', item);
        }
    }
	
	function flattenFields(keys, item, fields) {
		for (var j = 0; j < keys.length; j++) {
			var key = keys[j];
			if (key !== ROUTE && key !== LABEL) {
				var value = item[key];
				if (isObject(value)) {
					flattenFields(Object.keys(value), value, fields);
				} else {
					fields[key] = item[key];
				}
			}
		} 
		
		return fields;
	}

    return response;
}
