var cxs_Utils = Class.create();
cxs_Utils.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    /**
     * hasAddlResourcesAJAX() client wrapper for hasAddlResources()
     * @return {boolean | null}
     */
    hasAddlResourcesAJAX: function() {
        var contextConfigID = this.getParameter('sysparam_context_config_id');
        return this.hasAddlResources(contextConfigID);
    },

    /**
     * hasAddlResources() returns true/false if context config has associated addl. resource configs
     * @param {String} contextConfigID - sys_id of Search Context Config
     * @return {boolean | null}
     */
    hasAddlResources: function(contextConfigID) {
        var addlRes = new GlideAggregate('cxs_res_context_config');
        addlRes.addAggregate('COUNT');
        addlRes.addQuery('cxs_context_config', contextConfigID);
        addlRes.addQuery('cxs_search_res_config.resource_type', '!=', null);
        addlRes.query();
        if (addlRes.next()) {
            var count = addlRes.getAggregate('COUNT');
            return (count > 0);
        }

        return null;
    },

    stripHTML: function(stripText) {
        if (stripText == null || typeof stripText == "undefined")
            return "";

        return stripText.replace(/<\/?[^>]+(>|$)/g, "");
    },

    // Replaces surrogate pairs 
    toWellFormedString: function(inputString) {
        var invalidString = "" + inputString;
        var validString = "";

        var i = 0;

        while (i < invalidString.length) {
            var charCode = invalidString.charCodeAt(i);

			// Ignore anything we don't care about
            if (charCode < 0xD800 || charCode > 0xDFFF) {
                validString += invalidString[i];
                i++;
				continue;
            }

            if (charCode <= 0xDBFF && i + 1 < invalidString.length) {
                var nextCharCode = invalidString.charCodeAt(i + 1);
                if (nextCharCode >= 0xDC00 && nextCharCode <= 0xDFFF) {
                    validString += invalidString[i] + invalidString[i + 1];
                    i += 2;
                    continue;
                }
            }

            // Replace unpaired surrogate
            validString += "\uFFFD";
            i++;
        }

		return validString;
    },

    type: 'cxs_Utils'
});
