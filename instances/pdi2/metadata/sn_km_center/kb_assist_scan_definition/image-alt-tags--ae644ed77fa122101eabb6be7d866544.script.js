//The script below is passed in two variables, target and result
//When the script is finished, it will use the objects found in the result variable to create the results from the scan
//target - GlideRecord containing the record to the run the scan on
//results - an empty array, add an object for each recommendation found, if no recommendations found, add a closed result
//utils - includes functions that can be used to help create results

//This function will find any img tags that are missing alt text located in the html fields of a knowledge record
//and its templates
const searchForImagesWithoutAltText = () => {

    //setup kbViewModel using target record
    const kbViewModel = new global.KBViewModel();
    kbViewModel.knowledgeRecord = target;
    kbViewModel.tableName = target.sys_class_name + '';
    kbViewModel.articleTemplateName = kbViewModel._knowledgeHelper.getArticleTemplateName(target.sys_class_name) || '';

    const articleContent = kbViewModel.getArticleContent();

	let xmlDoc = utils.parseHTMLIntoXML(articleContent, "xmlWrapper");
	if (xmlDoc == null) {
		err = "Error parsing HTML into XML";
		return;
	}

    let currentNode = xmlDoc.getFirstNode("//img");
    let totalImages = 0;
    
    while (currentNode) {
        totalImages++;
        if (!currentNode.getAttribute("alt")) {
            let result = utils.createOpenResult(
                gs.getMessage("Consider adding an alt attribute that briefly describes the image and its purpose."),
                "article",
                currentNode.toString()
            );
            const title = currentNode.getAttribute("title");
            const src = currentNode.getAttribute("src");

            result.cssSelector = "img[src=\"" + src + "\"]";
            if (currentNode.hasAttribute("alt")) {
                result.cssSelector += "[alt=\"\"]";
            } else {
                result.cssSelector += ":not([alt])";
            }
            result.textContent = "";

            result.name = title ? title : src;

            const attributes = currentNode.getAttributes();
            attributes["alt"] = "{{altText}}";

            let replacement = "<img";
            replacement += Object.keys(attributes).map(attr => {
                return " " + attr + "=\"" + attributes[attr] + "\"";
            }).join(" ");
            replacement += "/>";
            result.recommendation = replacement;
            results.push(result);
        }

        currentNode = xmlDoc.getNextNode(currentNode);
    }
    
    // Store the total image count on every result so the score denominator is
    // available regardless of which findings are later ignored or removed
    // (the ignore-time recompute reads it from any surviving row).
    for (var ti = 0; ti < results.length; ti++) {
        results[ti].totalNumber = totalImages;
    }
};

//Run the scan
searchForImagesWithoutAltText();
