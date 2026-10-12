if (cancelled == "false") {
	new GlideQuery('alm_consumable')
		.where('sys_id', consumable)
		.selectOne(['stockroom', 'location', 'assigned_to', 'parent'])
		.ifPresent(function (consumableRec) {
			var isUpdateSuccessful = new Consumables().split(
				consumable, /* consumable sys_id */
				qty,
				status,
				substatus,
				consumableRec.parent,
				consumableRec.stockroom,
				consumableRec.location,
				consumableRec.assigned_to,
				asset_function
			);
			if (isUpdateSuccessful) {
				if (qty === '1') {
					gs.addInfoMessage(gs.getMessage('{0} asset has been split', qty));
				} else {
					gs.addInfoMessage(gs.getMessage('{0} assets have been split', qty));
				}
			}
		});
}
response.sendRedirect("alm_consumable.do?sys_id=" + consumable);
