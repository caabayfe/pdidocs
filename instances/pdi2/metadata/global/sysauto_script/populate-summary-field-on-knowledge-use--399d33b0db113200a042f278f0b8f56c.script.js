populateSummaryFromArticle('kb_use','article_summary','article');

function populateSummaryFromArticle(table, summaryField, articleField) {

	var gr = new GlideRecord('kb_knowledge');
    gr.addNotNullQuery('summary');
    gr.setCategory('homepage');
    gr.query();
	while (gr.next()) {
        var summary = gr.getValue('summary');
        if (!gs.nil(summary)) {
            updateAllWithSummary(gr.getUniqueValue(), summary);
        }
    }
	
    function updateAllWithSummary(sysId, summaryId) {
        var gr = new GlideMultipleUpdate(table);
        gr.addQuery(articleField, sysId);
        gr.query();
        gr.setValue(summaryField, summaryId);
        gr.execute();
    }
}
