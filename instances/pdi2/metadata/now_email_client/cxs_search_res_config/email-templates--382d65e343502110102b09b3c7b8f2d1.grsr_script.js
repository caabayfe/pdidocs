(function(current) {
	return {
		order: {
			created: current.sys_created_on,
			updated: current.sys_updated_on
		},
		
		result: {
			id: current.getTableName() + ":" + current.getUniqueValue(),
			title: current.name,
			text: current.name,
			meta: {
				number: current.sys_id
			}
		}
	};
})(current);
