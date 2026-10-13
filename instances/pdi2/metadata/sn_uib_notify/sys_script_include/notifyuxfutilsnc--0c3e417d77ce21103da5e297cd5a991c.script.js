var NotifyUXFUtilSNC = Class.create();
NotifyUXFUtilSNC.prototype = {
    initialize: function() {},

    ALLOWED_UXF_EVENTS: {
        OPEN_URL_WINDOW: 1
    },

    supportsPostUXFEvent: function(uxfEvent) {
        if (uxfEvent in this.ALLOWED_UXF_EVENTS) {
            return true;
        }
        return false;
    },

    getSanitizedEventActions: function(providerActions) {
        for (var providers in providerActions) {
            if (!providerActions[providers]) {
                continue;
            }
            for (var eventAction in providerActions[providers]) {
                var actions = {};
                var action = providerActions[providers][eventAction];
                for (var key in action) {
                    var actionData = action[key];
                    var refinedActions = [];
                    for (var index in actionData) {
                        var event = actionData[index].event;
                        if (this.supportsPostUXFEvent(event)) {
                            refinedActions.push(actionData[index]);
                        }
                    }
                    actions[key] = refinedActions;
                }
                providerActions[providers][eventAction] = actions;
            }
        }
        return providerActions;
    },

    type: 'NotifyUXFUtilSNC'
};
