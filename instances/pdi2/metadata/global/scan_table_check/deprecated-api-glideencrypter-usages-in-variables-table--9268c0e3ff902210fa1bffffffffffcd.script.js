(function(finding, current) {

    //check glide encrypter usage at least once
    var search_regex = /new\s*GlideEncrypter\s*\(/;
    if (!search_regex.test(current.value))
        return;

    //remove code comments
    var code_comments_regex = /\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm;
    var commentsRemovedValue = current.value.replace(code_comments_regex, '');

    //raise finding if no comments found or usage found in commentsRemovedValue
    if (commentsRemovedValue.length == current.value.length || search_regex.test(commentsRemovedValue)) {
		finding.setCurrentSource(current.value);
		finding.increment();
	}

})(finding, current);
