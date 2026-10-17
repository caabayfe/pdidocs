function transform(input) {
	var CONST = new CMDBWsDMConstants();
	var table = input.table;
	if ([CONST.SYS_USER_GROUP_MEMBER.TABLE, CONST.SYS_USER_HAS_ROLE.TABLE].indexOf(table) < 0)
		return [];
	var dotWalkPrefix = CONST.USER + '.';

	var gr = new GlideRecord(table);
	// We only want active users, regardless of table
	gr.addQuery(dotWalkPrefix + CONST.ACTIVE, true);
	if (table == CONST.SYS_USER_HAS_ROLE.TABLE) {
		gr.addQuery(CONST.SYS_USER_HAS_ROLE_FIELDS.ROLE, CONST.ASSIGNMENT.DM_USER_ROLE_SYS_ID);
	} else if (table == CONST.SYS_USER_GROUP_MEMBER.TABLE && !gs.nil(input.assignmentGroupSysId)) {
		gr.addQuery(CONST.SYS_USER_GROUP_MEMBER.GROUP, input.assignmentGroupSysId);
	}
	if (!gs.nil(input.searchTerm)) {
		gr.addQuery(dotWalkPrefix + CONST.NAME, 'CONTAINS', GlideStringUtil.escapeQueryTermSeparator(input.searchTerm));
	}
	gr.orderBy(dotWalkPrefix + CONST.NAME);
	gr.query();
	var rowCount = gr.getRowCount();
	var label = '';
	if (rowCount === 0) {
		label = gs.getMessage('No results found');
	} else if (rowCount <= parseInt(input.limit, 10)) {
		label = gs.getMessage('Showing 1-{0} of {0}', [rowCount]);
	} else {
		label = gs.getMessage('Showing 1-{0} of {1}', [input.limit, rowCount]);
		gr.setLimit(parseInt(input.limit, 10));
		gr.query();
	}
	var dropdownvalues = [];
	while (gr.next()) {
		dropdownvalues.push({
			id: gr.getDisplayValue(dotWalkPrefix + 'sys_id'),
			label: gr.getDisplayValue(dotWalkPrefix + 'name'),
			sublabel: gr.getDisplayValue(dotWalkPrefix + 'title'),
			avatarProps: {
				userName: gr.getDisplayValue(dotWalkPrefix + 'name'),
				imageSrc: gr.getDisplayValue(dotWalkPrefix + 'avatar')
			}
		});
	}
	return [{ id: 0, label: label, children: dropdownvalues }];
}
