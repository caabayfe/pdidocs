function transform (input) {

	const { currentPageQuery, scanEncodedQuery } = input;
	const articles = new Map();

    var scanResult = new GlideAggregate('kb_assist_scan_result');
    scanResult.addEncodedQuery('state=open');
	if (scanEncodedQuery)
        	scanResult.addEncodedQuery(scanEncodedQuery);
		
	if (currentPageQuery && currentPageQuery !== 'LOADING') {
		scanResult.addEncodedQuery(`target_recordIN${currentPageQuery}`);
	}
	else {
		return [];
	}
    scanResult.groupBy('target_record');
	scanResult.groupBy('scan_definition');
	scanResult.addAggregate('COUNT');
    scanResult.query();

    while(scanResult.next()) {
		if(scanResult.scan_definition.hide_in_panel == '1'){
			continue;
		}
        const articleId = scanResult.target_record.getValue('sys_id');

        // Add article and base info to set if it doesn't exist
        if (!articles.has(articleId)) {
            
            articles.set(articleId, {
                sys_id: articleId,
                results: {},
                issueCount: 0
            });
        }

        const scanDefinitionId = scanResult.scan_definition.getValue('sys_id');

        const article = articles.get(articleId);
        if (!article.results[scanDefinitionId]) {
			
            const scanDefinitionName = scanResult.scan_definition.getDisplayValue();
            article.results[scanDefinitionId] = {
                sys_id: scanDefinitionId,
                name: scanDefinitionName,
                count: 0
            };
        }
        const scanDefinition = article.results[scanDefinitionId];
        scanDefinition.count += parseInt(scanResult.getAggregate('COUNT'));
        article.issueCount += parseInt(scanResult.getAggregate('COUNT'));

    }
    const articleArray = Array.from(articles.values());
    articleArray.sort((a, b) => b.issueCount - a.issueCount);

    return articleArray;
}
