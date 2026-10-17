var ESLatestArrayUtil = Class.create();
ESLatestArrayUtil.prototype = {
    initialize: function() {
    },

	diff: function() {
        if (!arguments.length)
            return [];

        if (arguments.length == 1)
            return arguments[0];

		// throws an error if the first arg is null, This is only to preserve legacy behavior.
		var unused = arguments[0].length;

        const result = new Set(arguments[0]);
        for (let i = 1; i < arguments.length; i++) {
            let arr = arguments[i];
            for (let j = 0; j < arr.length; j++) {
				if (!Number.isNaN(arr[j])) {
                    result.delete(arr[j]);
				}
			}
		}

		return Array.from(result);
	},

    type: 'ESLatestArrayUtil'
};
