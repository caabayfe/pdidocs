var SnTinyMCEUtils = function() {
    var contains = function(str, content) {
        return str.indexOf(content) >= 0;
    };
    var split = function(pattern) {
        return function(str) {
            return !str ? [] : str.split(pattern);
        };
    };

    var splitPlugins = split(/[, ]+/);
    var splitToolbars = split(/[,| ]+/);
    var filterOut = function(remove) {
        return function(items) {
            return items.filter(function(item) {
                return remove.indexOf(item) < 0;
            });
        };
    };
    var rename = function(renameMap) {
        return function(items) {
            return items.map(function(item) {
                return renameMap[item] || item;
            });
        };
    };

    var renameToolbar = function(replacementMap) {
        return function(toolbar) {
            // Create a regular expression pattern for all keys in the replacement map
            var pattern = new RegExp('\\b(' + Object.keys(replacementMap).join('|') + ')\\b', 'g');

            // Replace occurrences based on the map
            return toolbar.replace(pattern, function(match) {
                return replacementMap[match] || match; // Use the replacement from the map or the original match if not found
            });
        };
    };  
        
    var addItems = function(addItems) {
    	return function(items) {
    		return items.concat(addItems);
    	}
    };

    var join = function(items) {
        return Array.isArray(items) ? items.join(' ') : items;
    };
    var sort = function(arr) {
        return Array.isArray(arr) ? arr.sort() : arr;
    };
    var flow = function() {
        var funcs = [].slice.call(arguments);
        return function(value) {
            if (funcs.length > 0) {
                value = funcs.reduce(function(val, func) {
                    return func(val);
                }, value);
            }
            return value;
        };
    };
    var uniq = function(items) {
        var uMap = {};
        return items.filter(function(item) {
            if (uMap[item]) return false;
            return (uMap[item] = 1);
        });
    };

    return {
        contains: contains,
        split: split,
        splitPlugins: splitPlugins,
        splitToolbars: splitToolbars,
        filterOut: filterOut,
        rename: rename,
        renameToolbar: renameToolbar,
        addItems: addItems,
        join: join,
        sort: sort,
        flow: flow,
        uniq: uniq
    };
};
