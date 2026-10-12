function transform(input) {
    const {
        table,
        sys_id
    } = input;

    const grs = new GlideRecordSecure('sys_attachment');

	// ECE will always save internal attachments with the ZZ_YY prefix to prevent them from showing in the UI
    grs.addQuery('table_name', `ZZ_YY${table}`);
    grs.addQuery('table_sys_id', sys_id);
    grs.addQuery('file_name', 'STARTSWITH', 'internal-ece-');

	// We can get into dirty states where we have multiple files, we will want to ones created most recently
	// We sort ASC here because of the logic within the ECE component.  If multiple assets are provided, it will use the last ones in the list.
	grs.orderBy('sys_created_on');
    grs.query();

	const assets = [];
    while (grs.next()) {
        const type = grs.getValue('content_type');

        switch (type) {        
            case 'application/javascript':
                assets.push({
                    type: 'js',
                    id: grs.getValue('sys_id')
                });
                break;
            default:
                gs.error(`Invalid attachment found for Knowledge Center: sys_attachment - ${grs.getValue('sys_id')}`);
                break;
        }
    }

	return {assets};
}
