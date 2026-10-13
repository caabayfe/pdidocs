(function(current) {
	return {
		order: {
			created: current.sys_created_on,
			updated: current.sys_updated_on,
			published: current.sys_updated_on,
			alpha: current.short_description
		},
		
		result: {
			id: current.getTableName() + ":" + current.getUniqueValue(),
			title: current.short_description,
			text: current.short_description,
			link: current.getLink(),
			meta: {
				number: current.number
			}
		}
	};
})(current);
