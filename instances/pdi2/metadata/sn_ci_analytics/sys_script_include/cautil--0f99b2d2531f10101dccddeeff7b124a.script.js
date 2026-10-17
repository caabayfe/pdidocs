var CAUtil = Class.create();

// call this to make sure we don't send '' or null to appsee
CAUtil.toString = function(value) {
    if (gs.nil(value))
        return undefined;
    return value.toString();
};

CAUtil.prototype = {

    OOTB_OVERRIDE_PROPS: ["4776a3d5533310101dccddeeff7b1299", "7e576bd5533310101dccddeeff7b12a4",
        "80d62d9673e820107d804c9885f6a737", "b4d6617f731020107d804c9885f6a763"
    ],

    VA_END_STATE: {
        'user_ended': 'User Closed VA – Clicked End/X',
        'no_user_response': 'System Closed VA – User No Response',
        'topic_complete': 'System Closed VA – Topic Complete',
        'left_while_search': 'System Closed VA – Left With AI Search',
        'auto_closed': 'System closed VA – Auto Closed',
        'no_activity': 'System Closed VA – User Never Engaged',
    },
    LA_END_STATE: {
        'user_ended': 'User Closed LA – Clicked End/X',
        'no_user_response': 'System Closed LA – User No Response',
        'topic_complete': 'System Closed LA – Chat Complete',
        'agent_ended': 'Agent Closed LA – Clicked End/X',
        'left_before_engagement': 'User Closed LA - Before Agent Engagement',
        'no_activity': 'System Closed LA – Before Agent Engagement'
    },

    initialize: function() {},

    isOOTBCustomProp: function(sys_id) {
        return new global.ArrayUtil().contains(this.OOTB_OVERRIDE_PROPS, sys_id.toString());
    },

    isNotAction: function(messageGr) {
        var messageType = messageGr.message_type;
        if (messageType == 'action')
            return false;
        return true;
    },

    getOverrideProperties: function(type) {
        var choices = new GlideChoiceList();
        if (type == 'dynamicproperty') {
            choices.add("End State", "End State");
            choices.add("Feedback Result", "Feedback Result");
            choices.add("Self Solve", "Self Solve");
            choices.add("Duration", "Duration");
        }
        if (type == 'eligibilitycriteria') {
            choices.add("Active Conversation", "Active Conversation");
        }
        return choices;
    },

    getOverrideTypes: function() {
        var types = new GlideChoiceList();
        types.add("dynamicproperty", "DynamicProperties");
        types.add("eligibilitycriteria", "EligibilityCriteria");
        return types;
    },

    isCustomizationEnabled: function(record) {
        var hideCustomization = gs.getProperty('sn_ci_analytics.ca.hide_customization', true);
        var isCustomizationEnabled = !this.getBooleanValue(hideCustomization);
        return isCustomizationEnabled;
    },

    // call this to convert string numeric value to boolean
    getBooleanValue: function(value) {
        if (value == '1' || value == 'true' || value == true)
            return true;
        return false;
    },

    getEndState: function(state, reason, isVAChat, isAgentChat) {
        var isLAConversation = this.getBooleanValue(isAgentChat);
        var isVAConversation = this.getBooleanValue(isVAChat);
        var isLAOrVAtoLAConversations = (isLAConversation || (isVAConversation && isLAConversation));
        var isVAOnlyConversations = isVAConversation && !isLAConversation;
        var endState;
        if (state == 'closed_complete') {
            if (isVAOnlyConversations)
                endState = this.VA_END_STATE[reason];
            else if (isLAOrVAtoLAConversations)
                endState = this.LA_END_STATE[reason];
        } else if (state == 'closed_abandoned') {
            if (isVAOnlyConversations)
                endState = this.VA_END_STATE[reason];
            else
                endState = this.LA_END_STATE[reason];
        } else if (state == 'wrap_up') {
            endState = this.LA_END_STATE[reason];
        }
        return endState;
    },

    type: 'CAUtil'
};
