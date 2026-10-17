var GuidedDecisionsGuidanceUtilSNC = Class.create();
GuidedDecisionsGuidanceUtilSNC.prototype = {
    initialize: function() {
        this.GUIDANCE_INPUT_TABLE = "ga_guidance_input";
        this.GUIDANCE_OUTPUT_TABLE = "ga_guidance_output";
    },

    isValidString: function(str) {
        return str && !gs.nil(str);
    },
    getExtensions: function(epName) {
        try {
            var ep = new GlideScriptedExtensionPoint().getExtensions(epName);
            if (ep.length > 0)
                return ep;
        } catch (ex) {
            gs.error("Error fetching extensions - " + ex);
        }
        return [];
    },
    loadExtensions: function(epName) {
        var extensions = this.getExtensions(epName);
        var extnMap = {};
        for (var i = 0; i < extensions.length; i++) {
            try {
                var extInstance = extensions[i];
                if (extInstance && typeof extInstance.getId === "function") {
                    var extId = extInstance.getId();
                    if (this.isValidString(extId))
                        extnMap[extId] = extInstance;
                }
            } catch (ex) {
                gs.error("Error loading extension - " + ex);
            }

        }
        return extnMap;
    },
    /*
     * Returns the handler for Guidance to interact with it's recommender.
     */
    getRecommenderHandler: function(recommender) {
        var recommenderHandlers = this.loadExtensions("GuidanceRecommenderSystemFactory");
        if (recommenderHandlers.hasOwnProperty(recommender))
            return recommenderHandlers[recommender];
    },
    canCreateGuidanceInput: function(guidance) {
        if (!guidance.canWrite())
            return false;

        var gr = new GlideRecordSecure(this.GUIDANCE_INPUT_TABLE);
        return gr.canCreate();
    },
    canCreateGuidanceOutput: function(guidance) {
        if (!guidance.canWrite())
            return false;

        var gr = new GlideRecordSecure(this.GUIDANCE_OUTPUT_TABLE);
        return gr.canCreate();
    },

    createGuidanceInputObject: function(glideElementGlideVar, actionInputLabels) {
        var inputObj = new Object();
        inputObj['inputLabelMap'] = {};
        for (var attribute in glideElementGlideVar) {
            if (attribute == "sys_meta" || attribute == "sys_id")
                continue;
            var element = glideElementGlideVar[attribute];
            var value = '';
            if (element) {
                value = glideElementGlideVar.constructor.name != "ScopedGlideElement" ? glideElementGlideVar[attribute] : glideElementGlideVar[attribute].getRefRecord();
            }
            /* Incase element is of type string and have empty value, we'll assign empty string directly to the inputobj attribute. */
            if (typeof element == "string" && gs.nil(element)) {
                inputObj[attribute] = '';
            } else if (gs.nil(value))
                inputObj[attribute] = glideElementGlideVar[attribute].getDisplayValue();
            else
                inputObj[attribute] = value;
            inputObj['inputLabelMap'][attribute] = glideElementGlideVar.constructor.name != "ScopedGlideElement" ? actionInputLabels[attribute] : glideElementGlideVar[attribute].getLabel();
        }
        return inputObj;
    },

    /**
     * Checks if user has read access to all inputs of the glidevar field in given record.
     */
    userHasReadAccess: function(record, field) {
        for (var input in record[field]) {
            if (input != "sys_meta" && input != "sys_id") {
                if (!record[field][input])
                    continue;
                var inputRecord = record[field][input].getRefRecord();
                if (!gs.nil(inputRecord)) {
                    if (!inputRecord.canRead() || !inputRecord.isValidRecord()) {
                        var currentUser = gs.getUser();
                        gs.info("User with sysid = " + currentUser.getID() + " does not have read access to input " + input + " with sys_id = " + inputRecord.getUniqueValue() + " of table = " + inputRecord.getTableName());
                        return false;
                    }
                }
            }
        }
        return true;
    },

    type: 'GuidedDecisionsGuidanceUtilSNC'
};
