var AesUtils = Class.create();
AesUtils.prototype = {
    initialize: function() {},

    removeTrailingSlash: function(input) {
        var pattern = /\/+$/;

        return pattern.test(input) ? input.replace(pattern, '') : input;
    },
    getObjectFromGlideRecord: function(gr, fields, displayFields) {
        var resultObj = {};

        if ((!Array.isArray(fields) || fields.length === 0) && (!Array.isArray(displayFields) || displayFields.length === 0)) {
            return resultObj;
        }

        (fields || []).forEach(function(field) {
            resultObj[field] = gr.getValue(field);
        });

        (displayFields || []).forEach(function(field) {
            resultObj[field] = gr.getDisplayValue(field);
        });

        return resultObj;
    },
    getUserImageString: function(gr, field) {
        var image = gr.getDisplayValue(field);
        if (image) {
            return '/' + image;
        }
        return null;
    },
    getVendorUrlPrefix: function(scopeName) {
        if (!scopeName) {
            return null;
        }
        // Constants
        var PREFIX_VENDOR = "x";
        var PREFIX_NOW = "now";
        var ALT_NOW_VENDOR_PREFIXES = ["sn", "snc"];

        var scopeParts = scopeName.split("_");
        var isCustomVendorApp = scopeParts[0] === PREFIX_VENDOR;

        if (isCustomVendorApp && scopeParts.length < 3) {
            return null;
        }

        var vendorCode = isCustomVendorApp ? scopeParts[1] : PREFIX_NOW;
        vendorCode = ALT_NOW_VENDOR_PREFIXES.indexOf(vendorCode) > -1 ? PREFIX_NOW : vendorCode;

        var vendorUrlPrefix = vendorCode === PREFIX_NOW ? PREFIX_NOW : PREFIX_VENDOR + "/" + vendorCode;
        return vendorUrlPrefix;
    },

    /**
     * Accepts iteratee which is invoked for each element in array for which uniqueness is determined. The order of result values is 
     * determined by the order they occur in the array.
     * @returns {Array}
     */
    uniqBy: function(arr, iteratee) {
        if (arr.length == 0) {
            return [];
        }

        var dict = {};
        var uniques = [];

        for (var i = 0; i < arr.length; i++) {
            var item = arr[i];
            var key = item[iteratee];

            if (dict[key] !== true) {
                dict[key] = true;
                uniques.push(item);
            }
        }

        return uniques;

    },

    groupBy: function(arr, iteratee) {
        var groupedBy = {};

        arr.forEach(function(i) {
            var v = i[iteratee].toLowerCase();

            groupedBy[v] = groupedBy[v] || [];
            groupedBy[v].push(i);
        });

        return groupedBy;
    },
    type: 'AesUtils'
};
