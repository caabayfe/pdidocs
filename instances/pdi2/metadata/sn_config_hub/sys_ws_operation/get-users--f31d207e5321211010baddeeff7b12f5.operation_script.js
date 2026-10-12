(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    let result = getUsers();
    response.setContentType('application/json');
    response.setStatus(200);
    response.setBody(result);

    function getUsers() {
		let users = [];

		const userGr = new GlideRecord('sys_user');
		userGr.orderBy('name');
		userGr.query();
		while (userGr.next())
			users.push({
				id: userGr.getValue('user_name'),
				label: userGr.name.getDisplayValue(),
				sublabel: userGr.getValue('user_name')
			});

		return { users: users };
	}

})(request, response);
