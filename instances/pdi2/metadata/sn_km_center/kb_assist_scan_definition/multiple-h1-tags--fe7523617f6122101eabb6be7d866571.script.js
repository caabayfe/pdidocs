//The script below is passed in two variables, target and result
//When the script is finished, it will use the objects found in the result variable to create the results from the scan
//target - GlideRecord containing the record to the run the scan on
//results - an empty array, add an object for each recommendation found, if no recommendations found, add a closed result
//utils - includes functions that can be used to help create results

//This function will find any h1 tags that are located in the html fields of a knowledge record
//and its templates
const searchForH1Tags = () => {

    //get the article content for the record
    const articleContent = new global.KBViewModel().getArticleContentBySysId(target.getUniqueValue());

	let xmlDoc = utils.parseHTMLIntoXML(articleContent, "xmlWrapper");
	if (xmlDoc == null) {
		err = "Issue parsing HTML into XML";
		return;
	}

	let currentNode = xmlDoc.getFirstNode("//h1");
	while (currentNode) {
		let label = currentNode.getTextContent();
		let result = utils.createOpenResult(
			gs.getMessage("Heading 1 tags found for text \"{0}\"", label),
			"article",
			currentNode.toString()
		);
		result.cssSelector = "h1";
		result.textContent = label;

		//Change h1 tags to h2
		let replacement = currentNode.toString();
		replacement = replacement.replace("<h1", "<h2");
		replacement = replacement.replace("</h1>", "</h2>");
		
		result.name = label;
		result.recommendation = replacement;
		result.confidence_score= 100;
        results.push(result);

		currentNode = xmlDoc.getNextNode(currentNode);
	}

};

//Run the scan
searchForH1Tags();
