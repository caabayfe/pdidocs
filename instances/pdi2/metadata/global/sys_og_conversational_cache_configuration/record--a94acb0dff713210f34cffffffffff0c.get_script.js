(function() {
    const userGr = new GlideRecord(table);
    if (!userGr.isValid()) {
        throw new Error('not a valid table:' + table);
    }
    if (!userGr.isValidField(field)) {
        throw new Error('not a valid field:' + field);
    }
    if (!value) {
        throw new Error('field value to match is empty');
    }
    userGr.addQuery('active', true);
    userGr.addQuery('locked_out', false);
    userGr.addQuery(field, value);
	userGr.queryNoDomain();
	if(userGr.next()) {
		return JSON.stringify({
			sys_id: userGr.getUniqueValue(),
			user_name: userGr.getValue('user_name'),
			identity_type: userGr.getValue('identity_type')
		});
	} else {
		throw new Error('user not found with details: ' + JSON.stringify({table, field, value}));
	}
})();
