function sn_codesearch_getResults() {
	$j("#sn_codesearch_results").html('');
	
	var userToken = "$[gs.getSessionToken()]";
	
	var endpoint = '/api/sn_codesearch/code_search/search',
	limit = $[gs.getProperty('sn_codesearch.search.results.max', 500)],
	req = {
		data : {
			limit : limit,
			current_app : "sn_codesearch",
			table : $j("#sn_codesearch_table").val(),
			term : $j("#sn_codesearch_term").val(),
			search_all_scopes : $j("#sn_codesearch_search_all_scopes").is(":checked")
		},
		
		dataType : 'json',
		headers : {"X-UserToken" : userToken}
	};
	
	if(!req.data.term) {
		alert("No search term provided.");
		return false;
	}
		
	var jqxhr = $j.ajax(endpoint, req)
		.done(function(data, textStatus, jqXHR) {
			var result = data.result;
			//are we dealing with just one table's results
			if (req.data.table)
				writeOutputForTable(result);
			else
				for (var i=0; i<result.length; i++)
					writeOutputForTable(result[i]);
		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			console.log("Error - unable to complete search. Message is " + errorThrown);
		});

	return false;
}

function sn_codesearch_clearSelections() {
	$j("#sn_codesearch_table").val('');
	$j("#sn_codesearch_term").val('');
	if ($j("#sn_codesearch_search_all_scopes").is(":checked"))
		$j('label[for="sn_codesearch_search_all_scopes"]').click();
	
	return false;
}

function writeOutputForTable(data) {
	if(!data)
		return;
	
	if(!data.hits)
		return;
	
	var header = $j("<div><h1>" + data.tableLabel + "</h1></div>");
	var result_body = "<div><p> Found <strong>" + data.hits.length + "</strong> records matching query.</p></div>";
	result_body += "<div>";
	
	$j.each(data.hits, function(idx, hit) {
		var result_desc = "<p>Record " + hit.name + " has <strong>" + hit.matches.length + "</strong> matching fields.</p>";
		var text = "<ul>";
		
		$j.each(hit.matches, function(indx, match) {
			text += "<li><p>" + match.fieldLabel + "</p>";
			text += "<pre>";
			$j.each(match.lineMatches, function(ix, fieldMatch) {
				text += "Line: " + fieldMatch.line + " " + fieldMatch.escaped + "\n";
			});
			text += "</pre></li>";
		});
		text += "</ul>";
		
		result_body += result_desc + text;
	});
	
	result_body += "</div>";
	$j(result_body).appendTo(header);
	$j(header).appendTo($j("#sn_codesearch_results"));

}
