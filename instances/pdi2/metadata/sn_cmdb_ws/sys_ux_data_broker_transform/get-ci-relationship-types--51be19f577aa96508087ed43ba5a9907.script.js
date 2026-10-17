function transform(input) {

    var result = {
        errors: [],
        items: [],
		suggested: []
    };

    try {
		var mapBase = new MapBase();
		var gr = new GlideRecord('cmdb_rel_type');
		gr.orderBy('sys_name');
		gr.addQuery(mapBase.COL_SYS_ID, mapBase.NOTIN_OP, Object.keys(mapBase.REL_TYPE_EXCLUSION)); //filter all the rel type declared in REL_TYPE_EXCLUSION
		gr.query();
		while(gr.next()) {
			result.items.push({
				sys_id: gr.getValue('sys_id'),
				id: gr.getValue('sys_name'),
				label: gr.getDisplayValue()
			});
		}
    } catch (error) {
        result.errors.push(error.toString());
    }

    return result;
}
