function onAfter(current, previous) {
    var knowHelp = new SNC.KnowledgeHelper();
    var jsonStr = knowHelp.getNestedCategories(current.sys_id, "label");

    // Decode the json string to object
    var jsonResult = new JSON().decode(jsonStr);

    var catArray = jsonResult.parentCategories.reverse();

    var catString;
    if (GlideI18NStyle.getDirection() == "ltr")
        catString = catArray.join(" / ");
    else
        catString = catArray.join(" \ ");

    current.full_category.setDisplayValue(catString + "");
	current.setWorkflow(false);
    if (current.update()) {
        knowHelp.setNestedCategories(current.sys_id, catString);
    }
}
