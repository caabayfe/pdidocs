var CollabReqUtils = Class.create();
CollabReqUtils.prototype = {
    initialize: function() {},

    getObjectFromGlideRecord: function(gr, fields) {
        if (!gr) {
            return {};
        }

        var isNonEmptyArray = Array.isArray(fields) && fields.length > 0;
        var resultObj = {};

        if (isNonEmptyArray) {
            fields.forEach(function(field) {
                resultObj[field] = gr.getValue(field);
            });
        } else {
            for (var prop in gr) {
                if (gr[prop]) {
                    resultObj[prop] = gr.getValue(prop);
                }
            }
        }

        return resultObj;
    },
	/*
		Returns true if all values in an object are null, undefined or ""
	*/
    objectNotAllNil: function(obj) {
		var result = false;
		for (var key in obj) {
			if (global.JSUtil.notNil(obj[key])) {
				result = true;
				break;
			}
		}
		
		return result;
    },
    type: 'CollabReqUtils'
};
