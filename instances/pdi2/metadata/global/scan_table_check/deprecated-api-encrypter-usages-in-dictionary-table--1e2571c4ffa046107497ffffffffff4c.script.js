(function(finding, current) {

    //check encrypter usage at least once
    var search_regex = /\s*\.Encrypter\s*/;
    if (!search_regex.test(current.dynamic_creation_script) &&
		!search_regex.test(current.default_value) &&
		!search_regex.test(current.reference_qual))
        return;

    //remove code comments
    var code_comments_regex = /\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm;
    var commentsRemovedDCS = current.dynamic_creation_script.replace(code_comments_regex, '');
	var commentsRemovedDV = current.default_value.replace(code_comments_regex, '');
	var commentsRemovedRQ = current.reference_qual.replace(code_comments_regex, '');

    //raise finding if no comments found or usage found in commentsRemovedValue
    if (commentsRemovedDCS.length == current.dynamic_creation_script.length || search_regex.test(commentsRemovedDCS)) {
		finding.setCurrentSource(current.dynamic_creation_script);
		finding.increment();
	}
	if (commentsRemovedDV.length == current.default_value.length || search_regex.test(commentsRemovedDV)) {
		finding.setCurrentSource(current.default_value);
		finding.increment();
	}
	if (commentsRemovedRQ.length == current.reference_qual.length || search_regex.test(commentsRemovedRQ)) {
		finding.setCurrentSource(current.reference_qual);
		finding.increment();
	}

})(finding, current);
