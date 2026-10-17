initializeVersions();
populateSummaryFromArticle('kb_feedback','article_summary','article');

// Uncomment following line to populate kb_use synchronously
// populateSummaryFromArticle('kb_use','article_summary','article');

// Let's start the async job to populate kb_use table with the summary field
startAsyncPopulateSummaryForUse();

function initializeVersions(){
	var helper = new SNC.KnowledgeHelper();
	var count = helper.initializeVersions();
	gs.log("Initialized versions for " + count + " articles");
}

function startAsyncPopulateSummaryForUse(){
	var rec = new GlideRecord('sysauto_script');
	rec.get('name', 'Populate Summary field on Knowledge Use');
	SncTriggerSynchronizer.executeNow(rec);
}

function populateSummaryFromArticle(table, summaryField, articleField) {

    var gr = new GlideAggregate(table);
    gr.addNullQuery(summaryField);
    gr.addNotNullQuery(articleField);
    gr.groupBy(articleField);
    gr.query();
    while (gr.next()) {
        var summary = gr.getElement(articleField).getRefRecord();
        if (summary.summary) {
            updateAllWithSummary(gr.getValue(articleField), summary.summary);
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
