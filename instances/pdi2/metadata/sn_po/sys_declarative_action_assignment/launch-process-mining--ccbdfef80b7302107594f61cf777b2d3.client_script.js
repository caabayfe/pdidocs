function onClick() {
	const ga = new GlideAjax('global.ProminUtilsAJAX');
	ga.addParam('sysparm_name', 'createModelDefFromList');
	ga.addParam('sysparm_table', g_list.getTableName());
	ga.addParam('sysparm_query', g_list.getQuery({ orderby: true, fixed: true }));

	ga.getXMLAnswer((recSysId) => {
		if (recSysId) {
			top.window.location.assign(`/now/experience/promin/promin_project/${recSysId}/set-objectives`);
		} else {
			CustomEvent.fire('glide:ui_notification.error', {
				getText: () => getMessage('Cannot create model definition from this list.'),
				getDuration: () => 10000,
				getType: () => 'error',
			});
		}
	});
}
