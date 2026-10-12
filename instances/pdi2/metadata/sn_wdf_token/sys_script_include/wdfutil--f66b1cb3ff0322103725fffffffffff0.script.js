var WdfUtil = Class.create();
WdfUtil.prototype = {
    initialize: function() {
        this.logger = new WdfLogger();
    },

    getJsonPathValue: function(json, path, defaultValue) {
        try {
            if (json == null) {
                throw "Invalid JSON value: " + json;
            }

            var gjp = new GlideJsonPath(JSON.stringify(json));
            return gjp.read(path)[0];
        } catch (e) {
            this.logger.debug("Unable to find path " + path + ". Error: " + e);
            return defaultValue;
        }
    },

    zipArraysToMap: function(names, values) {
        var result = {};

        if (names == null || values == null) {
            return result;
        }

        return names.reduce((result, name, idx) => {
            var value = values[idx];
            if (name == null || value == null) {
                this.logger.debug("Invalid name: " + name + ", or value field: " + value);
                return result;
            }
            result[new String(name).trim()] = new String(value).trim();
            return result;
        }, {});
    },

    /**
     * Converts a number to a human readable value with K/M suffix
     * 
     * <1,000			-> "488"
     * 1,000-999,999	-> "523.2K"
     * >= 1,000,000		-> "1.5M", "2M", "10M"
     *
     * @returns {string}
     */
    formatNumberWithSuffix: function(num) {
        if (typeof num === 'string') {
            num = num.replace(/,/g, '');
            num = parseFloat(num);
        }

        if (typeof num !== 'number' || Number.isNaN(num)) {
            return '';
        }

        num = Math.ceil(num);

        // Hundreds or below
        if (num < 1_000) {
            return num.toString();
        }

        // Thousands
        if (num < 1_000_000) {
            var scaledThousandsNum = (Math.floor((num / 1_000) * 10) / 10).toFixed(1);
            return scaledThousandsNum + "K";
        }

        // Millions
        if (num < 1_000_000_000) {
            var scaledMillionsNum = (Math.floor((num / 1_000_000) * 10) / 10).toFixed(1);
            return scaledMillionsNum + "M";
        }

        // Billions
        if (num < 1_000_000_000_000) {
            var scaledBillionsNum = (Math.floor((num / 1_000_000_000) * 10) / 10).toFixed(1);
            return scaledBillionsNum + "B";
        }

        // Trillions and above
        var scaledTrillionsNum = (Math.floor((num / 1_000_000_000_000) * 10) / 10).toFixed(1);
        return scaledTrillionsNum + "T";
    },

    type: 'WdfUtil'
};
