(function(current) {
	/**
	 * current is a GlideRecord to create the result from.
	 *
	 * The return value should be an object containing to elements, 'order' and result'
	 * order: Determines the values to be used for ordering results for this table
	 *        Default values:
	 *          * created: current.sys_created_on
	 *          * updated: current.sys_updated_on
	 *          * alpha: current.short_description
	 *
	 *        Additional ordering values can be added e.g. published.  A relevance score
	 *        is automatically added to results.
	 *            
	 * result: The format of the result.
	 *         The standard fields are:
	 *           * id: The unique id of the results, for example a doc_id
	 *           * title: The value to appear as the title of the result
	 *           * text: The text to use to create the search snippet
	 *           * link: The url for the result
	 *           * meta: An object containing any other information you want to add to the result
	 *
	 */
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
