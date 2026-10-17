(function executeQuery(v_table, v_query) {
    var kbList = new GlideRecordSecure("kb_knowledge");
    var query = v_query.getEncodedQuery();
    if (query)
        kbList.addEncodedQuery(query);

    kbList.setLimit(100);
    kbList.query();
	var isHeaderCustomized = true;
	var nativeArticleScreen = new GlideRecord("sys_sg_form_screen");
	if(nativeArticleScreen.get("c80c22e987521010420e5cdac5cb0b27") && nativeArticleScreen.use_view_config)
		isHeaderCustomized =false;
	var emptyStar = '☆', filledStar = '★';
	if(!isHeaderCustomized){
		emptyStar='';
		filledStar='';
	}
	
	var helpfulStyle = "text-align: center; font-size: 16px;";

    while (kbList.next()) {
        var viewModel = new global.KBViewModel();
        if (!viewModel.getInfoById(kbList.getUniqueValue()))
            continue;

        var kbRecord = viewModel.knowledgeRecord;
        var contentAndMedia = viewModel.getArticleContentAndMedia();

        var lastUsefulRating = viewModel.getLastFeedback('useful', false);
        var viewCount = kbRecord.sys_view_count;

		v_table.addRow({
            sys_id: kbList.getUniqueValue(),
            number: kbRecord.getDisplayValue('number'),
            rating: getRating(kbRecord.rating),
            last_rating: viewModel.getLastFeedback('rating', false),
            last_helpful_rating: lastUsefulRating == 'yes' ? 1 : lastUsefulRating == 'no' ? 2 : 0,
            short_description: kbRecord.getDisplayValue('short_description'),
            author: kbRecord.author,
			language: kbRecord.getDisplayValue('language'),
            content: contentAndMedia.content,
            helpful_text: viewModel.helpfulText? '<div style="' + helpfulStyle + '">' + viewModel.helpfulText + '</div>': '',
            view_count: viewCount == 1 ? gs.getMessage('{0} View', viewCount) : gs.getMessage('{0} Views', viewCount),
            last_updated_on: gs.getMessage('Updated {0}', viewModel.getTimeAgoText('sys_updated_on')),
            embedded_media: contentAndMedia.media
        });
    }

    function getRating(rating) {
        var roundedRating = Math.round(rating);
        var icons = [];
        while (roundedRating-- > 0)
            icons.push(filledStar);
        while (icons.length < 5)
            icons.push(emptyStar);
        return icons.join(' ');
    }
})(v_table, v_query);
