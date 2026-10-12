function transform(input) {
	const { payload, sysId, table } = input;
	let results = [];
	return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_explore_ci", "Manage tags", function() {
		if (payload.length > 0) {
			const proxy = new CMDBWsExploreCIService();

			for (let i = 0; i < payload.length; i++) {
				let tag = payload[i];
				if (tag.added) {
					// We added, let's do the add flow
					results[i] = proxy.createTag({
						configuration_item: sysId,
						table: table,
						key: tag.key.value,
						value: tag.value.value
					});
				}
				else if (tag.deleted) {
					// We deleted, let's do the delete flow
					results[i] = proxy.deleteTag(tag.sys_id.value);
				}
				else if (tag.modified) {
					// We edited, let's do the edit flow
					results[i] = proxy.updateTag(tag.sys_id.value, {
						key: tag.key.value,
						value: tag.value.value
					});
				}
			}
		}
		return results;
	});
}
