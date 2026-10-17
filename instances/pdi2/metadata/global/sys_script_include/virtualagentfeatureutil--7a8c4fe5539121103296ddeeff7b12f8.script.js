var VirtualAgentFeatureUtil = Class.create();
VirtualAgentFeatureUtil.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    doesMwebChannelSupportMultipleConversations: function() {
        var channelGR = new GlideRecord('sys_cs_channel');
        channelGR.addQuery('name', 'mweb');
        channelGR.query();

        var results = {};
        if (channelGR.next()) {
        
            results = {
                "sysId": channelGR.getValue('sys_id'),
                "mwebSupportMultipleConversations": channelGR.getValue('supports_multiple_conversations') == 1 ? true : false
            };
        } else {
            // Return the mweb sys id
            results = {
                "sysId": 'ea0cb816732110104a905ee515f6a7b5',
                "mwebSupportMultipleConversations": channelGR.getValue('supports_multiple_conversations') == 1 ? true : false
            };
        }

		return JSON.stringify(results)
    },

    type: 'VirtualAgentFeatureUtil'
});
