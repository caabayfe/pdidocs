(function generateDescription(step) {
	var ASSERT_THAT_TEXT_IS_ON_PAGE = "Assert that the text '{0}' is on the page.";
	var ASSERT_THAT_TEXT_NOT_ON_PAGE = "Assert that the text '{0}' is not on the page.";

	var text = step.inputs.text;
	var assertOnPage = step.inputs.assert_type + '' === "text_on_page";
	var descriptionGenerator = new ATFStepDescriptionGenerator();
	var timeoutDescription = descriptionGenerator.getTimeoutDescription(step.timeout);

	if (assertOnPage)
		return gs.getMessage(ASSERT_THAT_TEXT_IS_ON_PAGE, [text]) + timeoutDescription;
	else
		return gs.getMessage(ASSERT_THAT_TEXT_NOT_ON_PAGE, [text]) + timeoutDescription;
})(step);
