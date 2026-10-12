var DBUtil = Class.create();
DBUtil.prototype = {
    initialize: function() {},

    /**
     * Converts the output of a "Glide List" (comma separated values) into an array
     *
     * @param {string} val The value extracted from the Glide List
     * @returns {array} The resulting array derived from the glide list value
     */
    convertGlideListToArray(val) {
        if (!val || val.trim().length === 0)
            return [];
        return val.split(',');
    },

    type: 'DBUtil'
};
