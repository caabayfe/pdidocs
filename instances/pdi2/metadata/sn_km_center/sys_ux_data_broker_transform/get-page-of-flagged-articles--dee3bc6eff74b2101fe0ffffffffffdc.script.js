function transform(input) {
    const {rowStart, rowLimit, scanEncodedQuery, kbEncodedQuery} = input;

	var articleScanCounts = new GlideAggregate('kb_assist_scan_result');
	articleScanCounts.addEncodedQuery('state=open');
	if (scanEncodedQuery)
        	articleScanCounts.addEncodedQuery(scanEncodedQuery);

	if (kbEncodedQuery) {
		// Mirror HealthScoreUtils.getKnowledgeBaseIssues exactly: enumerate
		// the readable article sys_ids via GlideRecordSecure and apply them
		// as target_recordIN on the scan_result aggregate. A dot-walk JOIN
		// would skip kb_knowledge ACLs and inflate rowCount by every flagged
		// article the user cannot read, causing the flagged-page total to
		// disagree with the article card.
		var kbGr = new GlideRecordSecure('kb_knowledge');
		kbGr.addEncodedQuery(kbEncodedQuery, true);
		kbGr.query();
		var kbSysIds = [];
		while (kbGr.next()) {
			kbSysIds.push(kbGr.getUniqueValue());
		}

		if (kbSysIds.length > 0) {
			articleScanCounts.addEncodedQuery('target_recordIN' + kbSysIds.join(','));
		}
	}

	articleScanCounts.addAggregate('COUNT', 'target_record');
	articleScanCounts.orderByAggregate('COUNT', 'target_record');
	articleScanCounts.chooseWindow(rowStart, rowStart + rowLimit);
	articleScanCounts.query();
	const sysIds = [];
	let count = 0;
	let rowEnd = parseInt(rowStart, 10);
	let moreRemaining = false;

	while (count < rowLimit && articleScanCounts.next()) {

		if (articleScanCounts.canRead()) {
			sysIds.push(articleScanCounts.target_record + '');
			count++;
		}
		rowEnd++;
	}

	moreRemaining = articleScanCounts.hasNext();

	const rowCount = articleScanCounts.getRowCount()

	return {
		"sysIds": sysIds.join(','),
		rowEnd,
		moreRemaining,
		rowCount
	};
}
