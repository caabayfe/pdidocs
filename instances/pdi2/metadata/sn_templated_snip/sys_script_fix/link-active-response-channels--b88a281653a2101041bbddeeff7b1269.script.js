linkActiveResponseChannels();
function linkActiveResponseChannels() {
	var templatesGr = new GlideRecord('sn_templated_snip_note_template');
	var channelsGr = new GlideRecord('sn_templated_snip_channel');
	var m2mGr = new GlideRecord('m2m_response_template_to_channel');
	var channelIds = [];

	channelsGr.query();
	while(channelsGr.next()) {
		channelIds.push(channelsGr.getUniqueValue());
	}

	templatesGr.query();

	while(templatesGr.next()) {
		for (var i = 0; i < channelIds.length; i++) {
			var channelId = channelIds[i];
			m2mGr.initialize();
			m2mGr.setValue('sys_scope', templatesGr.getValue('sys_scope'));
			m2mGr.setValue('channel', channelId);
			m2mGr.setValue('response_template', templatesGr.getUniqueValue());
			m2mGr.insert();
		}
	}
}
