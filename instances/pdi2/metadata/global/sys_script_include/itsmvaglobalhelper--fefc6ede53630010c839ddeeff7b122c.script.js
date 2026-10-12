var ItsmVaGlobalHelper = Class.create();
ItsmVaGlobalHelper.prototype = {
    initialize: function() {
    },
	
	getFormattedInstructions: function(label, lines, startIdx) {
		if (!lines || !lines.length)
			return '';

		startIdx = !startIdx ? 0 : startIdx;
		var listItems = lines.map(function(l, idx) {
			return '<div>' + (idx+1+startIdx) + ') ' + l + '</div>';
		}).join('');

		return '<div>' +
				'<strong>' + label  + '</strong>' +
				'<div>' + listItems + '</div>' +
			'</div>';
	},
	
	formatKBSearchResult: function(baseURL, kb, snippetMaxLength) {
		snippetMaxLength = !snippetMaxLength ? 200 : snippetMaxLength;
		var link = baseURL + '?id=kb_article&sys_id=' + kb.id.split(':')[1];
		var title = kb.title;
		var snippet = kb.snippet.substring(0, snippetMaxLength) + '...';

		return '<div>' +
				'<a href="' + link + '" target="_blank">' +
					'<strong>' + title + '</strong>' +
				'</a>' +
				'<div>' + snippet + '</div>' +
			'</div>';
	},

    type: 'ItsmVaGlobalHelper'
};
