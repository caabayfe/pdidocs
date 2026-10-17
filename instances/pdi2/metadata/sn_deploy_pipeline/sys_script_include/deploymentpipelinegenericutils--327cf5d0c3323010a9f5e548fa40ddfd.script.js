var DeploymentPipelineGenericUtils = Class.create();
DeploymentPipelineGenericUtils.prototype = {
    initialize: function() {},

    /**
     * Removes trailing slash from URLs
     * @param {string} url
     * @returns {string}
     */
    removeTrailingSlash: function(url) {
        var regexPattern = /\/+$/;

        return regexPattern.test(url) ? url.replace(regexPattern, '') : url;
    },

    /**
     * Creates JSON object from GlideRecord Object
     * @param {GlideRecord} gr
     * @param {Array} [fields] if fields is not passed in, function will return all fields
     * @returns {Object}
     */
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

    /**
     * Returns value of object specified by user.
     * Example usage:
     * var results = { atf: { data: { test_suite_name: 'ATF suite name' } }, instance_scan: { data: { } } }
     * deploymentPipelineGenericUtils.get(results, 'atf.data.test_suite_name'); => 'ATF suite name'
     * @param {Object} obj
     * @param {Array} [key] key is an array of property values from obj
     * @returns {*}
     */
    get: function(obj, key) {
        if (!key) return null;

        return key.split('.').reduce(function(prev, current) {
            if (typeof prev == 'undefined' || prev === null) {
                return prev;
            }
            if (Array.isArray(prev) && prev.length > 0) {
                return prev[0][current];
            }
            return prev[current];
        }, obj);
    },

    type: 'DeploymentPipelineGenericUtils'
};
