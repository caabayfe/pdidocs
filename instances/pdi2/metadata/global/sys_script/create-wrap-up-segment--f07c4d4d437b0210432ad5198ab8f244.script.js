(function executeRule(current, previous /*null when async*/ ) {
    var isThirdPartyConversation = new ChatInteractionUtil().isThirdPartyChatPropertyEnabled('third_party_chat', 'sys_cs_provider_application', current.provider_application);
	// create segments for non third party interactions only
    if (!isThirdPartyConversation) {
        var config = new WrapUpInteractionUtil().getWrapUpConfiguration(current);

        if (config != null) {
            var currentDateTime = new GlideDateTime().getValue();
            sn_interaction.WrapUpSegment.createSegment(current.getValue('assigned_to'), current.getUniqueValue(), currentDateTime, config.sys_id, false, false, '', null, '', '');
        }
    }
})(current, previous);
