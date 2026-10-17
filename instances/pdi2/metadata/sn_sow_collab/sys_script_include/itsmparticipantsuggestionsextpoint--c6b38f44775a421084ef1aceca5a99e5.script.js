var ITSMParticipantSuggestionsExtPoint = Class.create();
ITSMParticipantSuggestionsExtPoint.prototype = {
    initialize: function() {},

    PARTICIPANT_SUGGESTIONS_PLUGIN: "com.glide.sn_participant_suggestions",
    ONCALL_PLUGIN: "com.snc.on_call_rotation",
    ASSIGNMENT_GROUP: "assignment_group",

    isValid: function(table, document, path) {
        var tables = ["incident", "problem", "change_request", "sc_request"];
        if (tables.includes(table)) {
            //we will get ML solution from praticipant suggestions plugin
            return !GlidePluginManager.isActive(this.PARTICIPANT_SUGGESTIONS_PLUGIN);
        }
        return false;
    },

    getParticipantSuggestions: function(table, document, path) {
        var userFields = [];
        //which user fields to recommend based on table name
        switch (table) {
            case "incident":
                userFields = ["caller_id", "assigned_to"];
                break;
            case "problem":
                userFields = ["opened_by", "assigned_to"];
                break;
            case "change_request":
                userFields = ["opened_by", "requested_by", "assigned_to"];
                break;
            case "sc_request":
                userFields = ["opened_by", "requested_for", "assigned_to"];
                break;
        }

        var recordGr = new GlideRecord(table);
        var suggestions = [];
        var suggestionSysids = [];
        if (recordGr.get(document)) {
            for (var i = 0; i < userFields.length; i++) {
                var sysId = recordGr.getValue(userFields[i]);
                if (sysId && !suggestionSysids.includes(sysId)) {
                    var recommendation = {};
                    var labels = {
                        "caller_id": gs.getMessage("Caller"),
                        "opened_by": gs.getMessage("Opened by"),
                        "assigned_to": gs.getMessage("Assigned to"),
                        "requested_by": gs.getMessage("Requested by"),
                        "requested_for": gs.getMessage("Requested for")
                    }
                    var userGr = new GlideRecord("sys_user");
                    if (userGr.get(sysId)) {
                        recommendation.sysId = sysId;
                        recommendation.label = gs.getMessage("{0} | {1}", [userGr.getValue("email"), labels[userFields[i]]]);
                        suggestions.push(recommendation);
                        suggestionSysids.push(recommendation.sysId);
                    }
                }
            }

            //primary on-user of assignment group
            var assignmentGroup = recordGr.getValue(this.ASSIGNMENT_GROUP);
            if (assignmentGroup && GlidePluginManager.isActive(this.ONCALL_PLUGIN)) {
                var usersOnCall = new global.OnCallRotation().whoIsOnCall(assignmentGroup);
                usersOnCall.sort((a, b) => (a.order > b.order) ? 1 : -1);
                if (usersOnCall.length > 0) {
                    var onCallUserGr = new GlideRecord("sys_user");
                    if (!suggestionSysids.includes(usersOnCall[0].userId) && onCallUserGr.get(usersOnCall[0].userId))
                        suggestions.push({
                            "sysId": usersOnCall[0].userId,
                            "label": gs.getMessage("{0} | On call", [onCallUserGr.getValue("email")])
                        });
                }
            }
        }

        return suggestions;
    },

    type: 'ITSMParticipantSuggestionsExtPoint'
};
