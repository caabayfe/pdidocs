function script({
	api: { emit },
	event: {
		payload: {
			status,
			table,
			sys_id: sysId,
			title,
			targetRecord,
			targetTable
		}
	},
	helpers
}) {
	let payload = { isDirty: false };
	switch (status) {
		case 'inserted':
			payload = {
				isDirty: false,
				status: status,
				screenParams: {
					table,
					sysId
				},
				title: title
			};
			break;
		case 'modified':
			payload.isDirty = true;
			break;
		case 'createDraft':
			emit('NAV_ITEM_SELECTED', {
				route: 'record',
				targetRoute: 'current',
				fields: {
					table: 'sys_email_draft',
					sysId: '-1'
				},
				params: {
					parentTable: targetTable,
					parentSysId: targetRecord,
					headerValue: 'New Email',
					dirtyFields: [],
					extraParams: `parentTable/${targetTable}/parentSysId/${targetRecord}/headerValue/New%20Email/dirtyFields/`
				},
				redirect: true,
				multiInstField: 'sysId'
			});
			break;
		case 'discardDraft':
			payload = { status: 'closed' };
			break;
		case 'openDraft':
			emit('NAV_ITEM_SELECTED', {
				route: 'record',
				targetRoute: 'current',
				fields: {
					table: 'sys_email_draft',
					sysId: sysId
				},
				params: {
					parentTable: targetTable,
					parentSysId: targetRecord,
					headerValue: 'Open Email',
					dirtyFields: [],
					extraParams: `parentTable/${targetTable}/parentSysId/${targetRecord}/headerValue/New%20Email/dirtyFields/`
				}
			});
			break;
		case 'closeDraft':
				payload = { status: 'closed' };
			break;
	}
	helpers.screen.updateStatus(payload);
}
