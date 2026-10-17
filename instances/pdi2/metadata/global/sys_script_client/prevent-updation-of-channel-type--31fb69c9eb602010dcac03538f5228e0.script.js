function onLoad() {
	var teamsChannelSysId = '8ca0544053d110102f40ddeeff7b12be';
	var messengerChannelSysId = '5d90658d0f9310105375001ea8767e8e';
	var workplaceChannelSysId = 'd257e4e9c3d310106c9a5230d840ddd2';
    if (g_form.getUniqueValue() == teamsChannelSysId || g_form.getUniqueValue() == messengerChannelSysId || g_form.getUniqueValue() == workplaceChannelSysId)
        g_form.setDisabled('type', true);

}
