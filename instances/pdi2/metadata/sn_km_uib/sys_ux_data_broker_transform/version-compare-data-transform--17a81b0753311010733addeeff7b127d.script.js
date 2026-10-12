function transform(input) {
	var version1 = input.graphQLData.data.firstVersion.kb_version._results[0];
	var version2 = input.graphQLData.data.secondVersion.kb_version._results[0];
	var original, changed;
    var originalVersionNumber, changedVersionNumber;
    var versionNumber1 = parseFloat(version1.version.value);
    var versionNumber2 = parseFloat(version2.version.value);
    var getArticleData = function getArticleData(version) {
		return version._query.AppKnowledge_Query.getArticleByFieldTypes;
	};
    if(versionNumber1 < versionNumber2){
		originalVersionNumber = versionNumber1;
		changedVersionNumber = versionNumber2;
		original = getArticleData(version1);
		changed = getArticleData(version2);
	} else {
		originalVersionNumber = versionNumber2;
		changedVersionNumber = versionNumber1;
		original = getArticleData(version2);
		changed = getArticleData(version1);
	}
	
	var comparisonData = new global.KBKnowledge().prepareComparisonData(original,changed);
	
	var versionData = [
		{
			"name": "version",
			"contentType": "string",
			"heading": gs.getMessage("Article Version"),
			"originalContent": originalVersionNumber,
			"changedContent": changedVersionNumber
		}
	];
	var result = {
		"articleData": comparisonData,
		"versionData": versionData
	};
	
	return result;
}
