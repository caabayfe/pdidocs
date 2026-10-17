// a global variable that avoid click button twice quickly
var clicked = false;
var gm = new GwtMessage();
// Global variables to flag the user when a required field is not set. Update them when templateChanged() is called
var tableRequired = true;
var itemRequired = true;
var rpRequired = true;

/**
 * appends the selected test template's steps to test
 */
function addTemplate(testId) {
	// template fields to validate
	var tableId = gel('test_table_picker').value;
	var itemId = gel('test_item_picker').value;
	var rpId = gel('test_rp_picker').value;
	var templateId = gel('test_template_picker').value;
	var testName = gel('test_name').value;

	if (!testName) {
		alertMessage("Please enter a test name");
		return;
	}

	if (!tableId && tableRequired) {
		alertMessage("Please select a table");
		return;
	}

	if (!itemId && itemRequired) {
		alertMessage("Please select a catalog item");
		return;
	}

	if (!rpId && rpRequired) {
		alertMessage("Please select a record producer");
		return;
	}

	if (!templateId) {
		alertMessage("Please select a template");
		return;
	}

	// track the event ASAP because the GlideAjax callback reloads the page
	try {
		GlideWebAnalytics.trackEvent('com.glide.automated_testing_framework', 'Template', 'Test Template Added', undefined, 1);
	} catch (e) {
		console.log('Failed to send ATF analytics event: Test Template Added');
		console.log(e);
	}

	var ga = new GlideAjax('AddTestTemplateAjax');
	ga.addParam('sysparm_name', 'addTemplate');
	ga.addParam('sysparm_test_id', testId);
	ga.addParam('sysparm_table_id', tableId);
	ga.addParam('sysparm_item_id', itemId);
	ga.addParam('sysparm_rp_id', rpId);
	ga.addParam('sysparm_template_id', templateId);
	ga.addParam('sysparm_test_name', testName);
	ga.getXML(afterAdd);
}

/**
 * Show or hide the table field when a different template is chosen
 */
function templateChanged() {
	var templateId = gel('test_template_picker').value;

	checkAndChangeVisibility(templateId, "doesTemplateRequireTable", "tableDiv", "tableRequired");
	checkAndChangeVisibility(templateId, "doesTemplateRequireCatalogItem", "itemDiv", "itemRequired");
	checkAndChangeVisibility(templateId, "doesTemplateRequireRecordProducer", "rpDiv", "rpRequired");
}

/**
 * check if element is required for template, then show or hide it based on the result
 */
function checkAndChangeVisibility(templateId, check, elementId, requiredFieldVarName) {
	// check if template needs the element and then show/hide that field
	var ga = new GlideAjax("AddTestTemplateAjax");
	ga.addParam("sysparm_name", check);
	ga.addParam("sysparm_template_id", templateId);
	ga.getXMLAnswer(function(response) {
		// set field's flag to enforce populating it
		window[requiredFieldVarName] = (response == "true");
		showOrHideElement(window[requiredFieldVarName], elementId);
	});
}

function showOrHideElement(show, elementId) {
	var element = gel(elementId);

	if (show) {
		// make the element visible and mandatory
		element.setAttribute('style', '');
		element.addClassName("is-required");
	} else {
		// hide the element, remove is-required class so that it is not mandatory anymore
		// the existing value in the field is not cleared, it is just hidden
		element.setAttribute('style', 'display:none;');
		element.removeClassName("is-required");
	}
}

function afterAdd(response) {
	var testSysId = response.responseXML.documentElement.getAttribute("answer");
	if (!testSysId) {
		alertMessage("Failed to add template by script include 'AddTestTemplateAjax', try again");
		var addButton = gel('add_button');
		addButton.disabled = false;
		return;
	}
	window.location = "sys_atf_test.do?sys_id=" + testSysId;
}

function alertMessage(message) {
	alert(gm.getMessage(message));
	var addButton = gel('add_button');
	addButton.disabled = false;
}

function closeDialog() {
	GlideModal.get().destroy();
}

/**
 * The template field is a select2, which has its own aria-labelledby, so we need to append
 * our label to the existing aria-labelledby so the field label is correctly screenread
 */
function setTemplateLabel() {
	var templateEl = document.getElementsByClassName('select2-focusser')[0];
	if (typeof templateEl === 'undefined')
		return;

	var currLabel = templateEl.getAttribute('aria-labelledby');
	if (currLabel == null)
		currLabel = 'test_template_picker_label';
	else
		currLabel += ' ' + 'test_template_picker_label';

	templateEl.setAttribute('aria-labelledby', currLabel);
}

setTemplateLabel();
