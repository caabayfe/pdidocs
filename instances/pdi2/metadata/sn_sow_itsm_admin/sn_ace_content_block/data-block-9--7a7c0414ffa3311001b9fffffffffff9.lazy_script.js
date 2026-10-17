(function(context, pageParams, blockcontext) {
    var channelType = "none";
    var selectedChannels = [], selectedEmailTemplate, showEmailTemplateField = false;
    function getChannelById(id) {
        for (var i = 0; i < blockcontext.channels.length; i++) {
            if (blockcontext.channels[i].id === id) {
            return blockcontext.channels[i];
            }
        }
    }
    var channelDefGR = new GlideRecord('comm_channel_definition');
    channelDefGR.addQuery("comm_task_definition", blockcontext.taskSysId);
    channelDefGR.query();
    while (channelDefGR.next()) {
        var channel = getChannelById(channelDefGR.getValue("channel"));
        selectedChannels.push(channel);
		if(channel.id == "1513471e870013000e3dd61e36cb0bf2") {
            var channelDefEmailGR = new GlideRecord('comm_channel_def_email');
            channelDefEmailGR.addQuery("comm_task_definition", blockcontext.taskSysId);
            channelDefEmailGR.query();
            if(channelDefEmailGR.next()) {
                selectedEmailTemplate = channelDefEmailGR.getValue("email_client_template");
                showEmailTemplateField = true;
            }
		}
        if(channelType == "none") {
            channelType = channel.classification;
        }
    }
    var channelInfoMessage, showChannelField, filteredChannels;
    if (channelType == "update") {
        channelInfoMessage = [{"icon":"lightbulb-outline","content":"Multiple channels can be selected for updates"}];
        showChannelField = true;
        filteredChannels = blockcontext.channels.filter(function(channel) {
            return channel.classification == "update";
        });
    } else if (channelType == "bridge") {
        channelInfoMessage = [{"icon":"lightbulb-outline","content":"Only one channel can be selected for a bridge"}];
        showChannelField = true;
        filteredChannels = blockcontext.channels.filter(function(channel) {
            return channel.classification == "bridge";
        });
    } else {
        showChannelField = false;
        filteredChannels = [];
    }
    return {
        showChannelField: showChannelField,
        filteredChannels: filteredChannels,
        channelInfoMessage: channelInfoMessage,
        channelType: channelType,
        selectedChannels: selectedChannels,
        showEmailTemplateField: showEmailTemplateField,
		selectedEmailTemplate: selectedEmailTemplate
    };
})(context, pageParams, blockcontext);
