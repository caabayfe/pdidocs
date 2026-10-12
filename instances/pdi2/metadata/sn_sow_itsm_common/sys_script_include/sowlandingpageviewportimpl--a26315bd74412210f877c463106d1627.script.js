var SOWlandingPageViewportImpl = Class.create();
SOWlandingPageViewportImpl.prototype = {

    initialize: function() {},

    handles: function(qualificationContext) {
	const SOW_UX_APPLICATION = "aa881cad73c4301045216238edf6a716";
    	return qualificationContext.getPageRegistryId() === SOW_UX_APPLICATION;
    },

    getCommands: function(commandContext) {
        var dataBrokerResult = commandContext.getDataBrokerResult();
        var visibilityFlags = dataBrokerResult.output;

        var macroponentSysIds = {
            "announcements": "db4aa58953100110b662ddeeff7b12ba",
            "upcoming": "1841550453100110b662ddeeff7b1217",
            "quick_links": "01e5d430b7040110b288bc16de11a915"
        };

        var enabledMacroponents = [];

        if (visibilityFlags) {
            for (var feature in macroponentSysIds) {
                if (visibilityFlags[feature] === true) {
                    enabledMacroponents.push(macroponentSysIds[feature]);
                }
            }
        }

        return [{
            commandType: 'load_macroponents',
            payload: enabledMacroponents
        }];
    },

    getTriggers: function() {
        const GET_SECTION_VISIBILTY_DATABROKER = '3fc23e949360021004e40b276489182b';
        return [{
            triggerType: 'data_broker',
            triggerValue: GET_SECTION_VISIBILTY_DATABROKER
        }];
    },

    type: 'SOWlandingPageImpl'
};
