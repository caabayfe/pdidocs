//If the sys_sg_screen still has the 'parent' field use it otherwise use relationship tables

function getScreenIdsWithItemConfig(item_config_id) {
	var masterItemM2MGR = new GlideRecord('sys_sg_item_stream_m2m_master_item');
	masterItemM2MGR.addQuery('master_item', item_config_id);
	masterItemM2MGR.query();
	var itemStreamsIds = [];
	while(masterItemM2MGR.next())
		itemStreamsIds.push(masterItemM2MGR.item_stream);

	var segmentM2MGR = new GlideRecord('sys_sg_item_stream_m2m_segment');
	segmentM2MGR.addQuery('item_stream', 'IN', itemStreamsIds);
	segmentM2MGR.query();
	var screenIds = [];
	while(segmentM2MGR.next())
		screenIds.push(segmentM2MGR.segment.screen);

	return screenIds;
}

if(current.getElement('parent') !== null)
	current.addQuery('parent', parent.sys_id);
else 
	current.addQuery('sys_id', 'IN', getScreenIdsWithItemConfig(parent.sys_id));
