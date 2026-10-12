async function handler({api, event, helpers, imports}) {

	const { sortByColumn } = imports["sn_cmdb_ws.cmdbPresentationListUtil"](...arguments);

	let cmdbPreviewData = {...api.state.cmdbPreviewData};
	let rows = cmdbPreviewData.rows.rows.slice();
	let columns = cmdbPreviewData.columns.columns.slice();
	let columnName = event.payload.column.key;
	let currSortDirection = event.payload.column.sortDirection;

	await sortByColumn(columnName, currSortDirection, columns, rows);

	api.setState("cmdbPreviewData", {
		...cmdbPreviewData,
		columns: {
			...cmdbPreviewData.columns,
			columns: [...columns],
			sortKey: Math.random() /* force refresh of sort icon */
		},
		rows: {
			rows: [...rows]
		},
		currPageRows: {
			rows: rows.slice(0, cmdbPreviewData.pageSize)
		},
		currPageNumber: 0
	});
}
