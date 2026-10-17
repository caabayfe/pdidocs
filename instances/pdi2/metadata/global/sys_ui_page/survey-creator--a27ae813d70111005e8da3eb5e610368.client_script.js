// Global variables
var categoryNumber = 1;
var questionNumber = 1;
var g = new GlideForm();
var ac; // AutoComplete referenced from the markup.

// Load Page Handlers
addLoadEvent(function() {
	var loadpage = gel("loadpage");
	if(loadpage.value!='true') return;;
	addNewQuestion();

	ac = new AutoComplete();
	ac.setInput('search');
	ac.setSelect('slush_left');
	ac.setTable('sys_user_group');
	ac.setColumn('name');
	slush.ignoreDuplicates = true;

	loadGroups(false);
	showRecipientBlock('survey_delivery_public');
	suppressEnterKey($j("input, select"));
});

/*
 This will prevent the enter key from submitting the form (due to the presence of a button of type "submit").
 jElements : jquery array of elements
 */
function suppressEnterKey(jElements) {
	jElements.keypress(function(evt) {
		return !enterKeyPrevented(evt);
	});
}

function enterKeyPrevented(evt) {
	if (evt.which == 13) {
		evt.preventDefault();
		evt.stopPropagation();
		return true;
	} else
		return false;
}

function loadGroups(loadAll) {
	if (loadAll)
		ac.setQuery('');
	else
		ac.setQuery('typeLIKE2e763549d7111100828320300e61038d');

	ac.onKeyUp();
}

// Update mandatory bar color
function updateMandatory(field) {
	if (field == 'surveyName')
		manageMandatoryBar(field);
	else if (field.substring(0, 8) == 'DataType') {
		var answerNumber = field.substring(field.length-2);
		if (answerNumber == '_1' || answerNumber == '_2')
			manageMandatoryBar(field);
		else
			removeMandatoryBar(field);
	}
}

function manageMandatoryBar(field) {
	var label = 'label.' + field;
	var mandatoryField = $(gel(label).firstChild);
	var textField = gel(field).value.strip();
	if (mandatoryField.nodeName == 'LABEL')
		mandatoryField = mandatoryField.firstChild;

	if (textField == '') {
		mandatoryField.removeClassName('changed');
		mandatoryField.addClassName('mandatory');
	} else {
		mandatoryField.removeClassName('mandatory');
		mandatoryField.addClassName('changed');
	}
}

// Remove the Mandatory Bar from a field
function removeMandatoryBar(field) {
	var label = 'label.' + field;
	var mandatoryField = $(gel(label).firstChild);
	if (mandatoryField.nodeName == 'LABEL')
		mandatoryField = mandatoryField.firstChild;
	mandatoryField.removeClassName('mandatory');
	mandatoryField.removeClassName('changed');
	mandatoryField.attributes['mandatory'].value = "false";
}

// Validations:
function hasQuestions() {
	// Verify that at least one question box has a question
	var questionBoxes = $$('.question_text');
	for (var q = 0; q < questionBoxes.length; q++) {
		var questionText = questionBoxes[q].value.strip();
		if (questionText != '')
			return true;
	}
	return false;
}

function verifyAnswerFormat() {
	var questionBoxes = $$('.question_text');
	var errors = [];
	for (var i = 0; i < questionBoxes.length; i++) {
		var error = {};
		var questionBox = questionBoxes[i];
		var question = questionBox.value.strip();
		if (question == '')
			continue;

		var indexStr = questionBox.id.split('Question')[1];
		var dataTypeSelect = gel('DataType' + indexStr);
		var selectedDatatype = dataTypeSelect.options[dataTypeSelect.selectedIndex].value;

		if (selectedDatatype == '') {
			error.question = questionBox.id;
			error.message = '${gs.getMessage("Questions with no answer data type are not allowed")}';
			errors.push(error);
		} else {
			var options;
			switch(selectedDatatype) {
				case 'scale':
					options = getChoiceOptions(indexStr, selectedDatatype);
					if (options.length < 2) {
						error.question = questionBox.id;
						error.message = '${gs.getMessage("Questions with data type Likert Scale require two or more answer options")}';
						errors.push(error);
					}
					break;
				case 'choice':
					options = getChoiceOptions(indexStr, selectedDatatype);
					if (options.length < 2) {
						error.question = questionBox.id;
						error.message = '${gs.getMessage("Questions with data type Choice require two or more answer options")}';
						errors.push(error);
					}
					break;
				case 'long':
				case 'percentage':
				case 'numericscale':
					var dataType='';
					if (selectedDatatype == 'long')
						dataType = 'Number';
					else if (selectedDatatype == 'percentage')
						dataType = 'Percentage';
					else if (selectedDatatype == 'numericscale')
						dataType = 'NumericScale';
					
					var minId = 'DataType_' + dataType + '_Answer' + indexStr + '_1';
					var maxId = 'DataType_' + dataType + '_Answer' + indexStr + '_2';
					var min = gel(minId).value;
					var max = gel(maxId).value;
					if (min == '') {
						var e1 = {};
						e1.question = minId;
						e1.message = '${gs.getMessage("Minimum value is required")}';
						errors.push(e1);
					}
					if (max == '') {
						var e2 = {};
						e2.question = maxId;
						e2.message = '${gs.getMessage("Maximum value is required")}';
						errors.push(e2);
					}
					if (isNaN(min)) {
						var e3 = {};
						e3.question = minId;
						e3.message = '${gs.getMessage("Minimum value must be a number")}';
						errors.push(e3);
					}
					if (isNaN(max)) {
						var e4 = {};
						e4.question = maxId;
						e4.message = '${gs.getMessage("Maximum value must be a number")}';
						errors.push(e4);
					}
					if (min < 0) {
						var e5 = {};
						e5.question = minId;
						e5.message = '${gs.getMessage("Minimum value must be greater than 0")}';
						errors.push(e5);
					}
					if (max < 0) {
						var e6 = {};
						e6.question = maxId;
						e6.message = '${gs.getMessage("Maximum value must be greater than 0")}';
						errors.push(e6);
					}
					if (isNaN(parseInt(min)) || parseInt(min) < parseFloat(min)) {
						var e7 = {};
						e7.question = minId;
						e7.message = '${gs.getMessage("Minimum value must be an integer")}';
						errors.push(e7);
					}
					if (isNaN(parseInt(max)) || parseInt(max) < parseFloat(max)) {
						var e8 = {};
						e8.question = maxId;
						e8.message = '${gs.getMessage("Maximum value must be an integer")}';
						errors.push(e8);
					}
					if (parseFloat(min) >= parseFloat(max)) {
						var e9 = {};
						e9.question = questionBox.id;
						e9.message = '${gs.getMessage("Minimum must be less than the maximum")}';
						errors.push(e9);
					}
					break;

				case 'string':
				case 'attachment':
				case 'template':
				case 'date':
				case 'boolean':
				case 'checkbox':
				case 'datetime':
					// Do nothing
					break;
				default:
					error.question = questionBox.id;
					error.message = gs.getMessage('Answer data type not recognized: {0}', selectedDatatype);
					errors.push(error);
			}
		}
	}

	return errors;
}

// Dynamic Question and answer management:
function addNewQuestion(evt, sourceQuestionBox) {
	if (evt) {
		// normalize the event by converting to a jquery event.
		var jevent = $j.event.fix(evt);

		if (enterKeyPrevented(jevent))
			return;
	}

	if (sourceQuestionBox) {
		var suffixParts = sourceQuestionBox.id.split('Question')[1].split('_');
		var qGroup = suffixParts[1];
		var qInd = suffixParts[2];
		var newId = "Question_" + qGroup + "_" + (parseInt(qInd) + 1);
		if (gel(newId))
		// Do not add if the question is already there...
			return;
	}

	var newQuestion = gel("QuestionGroup_Template");
	newQuestion = newQuestion.cloneNode(true);
	newQuestion.id = "QuestionGroup_" + categoryNumber + "_" + questionNumber;
	newQuestion.style.display = 'block';

	newQuestion = updateNodeIdsToNewQuestionNumber(newQuestion, categoryNumber, questionNumber);
	gel("QuestionArea").appendChild(newQuestion);
	suppressEnterKey($j(newQuestion).find('input, select'));

	// Check to see if the answers that came along need to adjust their mandatory fields due to preloaded values
	updateMandatory("DataType_NumericScale_Answer_" + categoryNumber + "_" + questionNumber + "_1");
	updateMandatory("DataType_NumericScale_Answer_" + categoryNumber + "_" + questionNumber + "_2");
	updateMandatory("DataType_Number_Answer_" + categoryNumber + "_" + questionNumber + "_1");
	updateMandatory("DataType_Number_Answer_" + categoryNumber + "_" + questionNumber + "_2");
	updateMandatory("DataType_Percentage_Answer_" + categoryNumber + "_" + questionNumber + "_1");
	updateMandatory("DataType_Percentage_Answer_" + categoryNumber + "_" + questionNumber + "_2");

	questionNumber++;
}

function updateNodeIdsToNewQuestionNumber(obj, categoryNumber, questionNumber) {

	obj = obj.outerHTML;

	//id, key, name
	obj = obj.replace(/_0_0/g, "_" + categoryNumber + "_" + questionNumber);

	//onchange
	obj = obj.replace(/\(0,\s*0\);/g, "(" + categoryNumber + ", " + questionNumber + ");");

	//onkeyup
	obj = obj.replace(/,\s*1,\s*1,\s*3\)/g, ", " + categoryNumber + ", " + questionNumber + ", 3)");
	obj = obj.replace(/,\s*1,\s*1,\s*2\)/g, ", " + categoryNumber + ", " + questionNumber + ", 2)");

	//title:
	obj = obj.replace(/Question 0:/g, "Question " + questionNumber + ":");
	obj = obj.replace(/Question 0/g, "Question " + questionNumber);

	return $j(obj)[0];
}

// called through onkeyup
function addNewAnswer(evt, dataTypeName, categoryNumber, questionNumber, answerNumber) {
	// normalize the event by converting to a jquery event.
	var jevent = $j.event.fix(evt);

	// skip this when no text is entered in input field.
	if (jevent.target.value.length == 0)
		return;

	// build next answer if text is typed (rather than tab, arrow keys, etc.)
	var answerId = "DataType_" + dataTypeName + "_Answer_" + categoryNumber + "_" + questionNumber + "_" + answerNumber;
	var fieldToBuild = gel(answerId);
	if (fieldToBuild == null) {
		var questionId = "DataType_" + dataTypeName + "_" + categoryNumber + "_" + questionNumber;
		var clone = gel(questionId).firstChild.cloneNode(true);
		var newAnswer = updateNodeIdsToNewAnswerNumber(clone, categoryNumber, questionNumber, answerNumber);
		gel(questionId).appendChild(newAnswer);
		// onkeyup does not allow to suppress the enter key soon enough,
		// so we need to set up an additional onkeypress event handler for that.
		suppressEnterKey($j(newAnswer));

		var input = gel(answerId);
		input.value = "";

		removeMandatoryBar(answerId);
	}
}

function updateNodeIdsToNewAnswerNumber(obj, categoryNumber, questionNumber, answerNumber) {
	obj = obj.outerHTML;
	obj = obj.replace(/_\d+_\d+_\d+/g, '_' + categoryNumber + '_' + questionNumber + '_' + answerNumber);
	obj = obj.replace(/,\s*\d+\);/g, ', ' + (answerNumber + 1) + ');');
	obj = obj.replace(/>\d+:</g, '>' + answerNumber + ':<');
	obj = obj.replace(/>\d+</g, '>' + answerNumber + '<');
	return $j(obj)[0];
}

function showDataTypeFields(categoryNumber, questionNumber) {
	var dataTypeIndex = gel("DataType_" + categoryNumber + "_" + questionNumber).selectedIndex;
	var dataTypeValue = gel("DataType_" + categoryNumber + "_" + questionNumber).options[dataTypeIndex].value;
	var elem;
	var map = {
		"long"       : "DataType_Number",
		"percentage" : "DataType_Percentage",
		"choice"     : "DataType_Choice",
		"scale"      : "DataType_Scale",
		"numericscale" : "DataType_NumericScale",
		"string"     : "DataType_String",
		"template"   : "DataType_Template",
		"boolean"    : "DataType_YesNo",
		"checkbox"   : "DataType_Checkbox",
		"date"       : "DataType_Date",
		"datetime"   : "DataType_DateTime"
	};

	hideDataTypeFields(categoryNumber, questionNumber);

	elem = map[dataTypeValue];
	if (!elem)
		elem = "DataType_Default";
	gel(elem + "_" + categoryNumber + "_" + questionNumber).style.display = 'block';

	showOrHideButtons();
}

function showOrHideButtons() {
	// Need to have at least one question before showing Publish/Preview
	for (var catNum = 1; catNum <= categoryCount(); catNum++)
		for (var qNum = 1; qNum <= questionCount(catNum); qNum++)
			if (gel('Question_' + catNum + '_' + qNum).value.trim() != "" && gel('DataType_' + catNum + '_' + qNum).value != "") {
				gel('survey_creator_publish').style.display = '';
				gel('survey_creator_preview').style.display = '';
				break;
			}
}

function categoryCount() {
	/* for future use...meanwhile just return 1
	return $j("[id^=Category_]").length;
	*/
	return 1;
}

function questionCount(category) {
	var questionNamePrefix = 'Question_' + category + '_';
	var qCount = 0;

	do {
		qCount++;
		if (gel(questionNamePrefix + qCount) == null) {
			qCount--;
			break;
		}
	} while (true);

	return qCount;
}

function hideDataTypeFields(categoryNumber, questionNumber) {
	var cq = categoryNumber + "_" + questionNumber;
	gel("DataType_Number_" + cq).style.display = 'none';
	gel("DataType_NumericScale_" + cq).style.display = 'none';
	gel("DataType_Percentage_" + cq).style.display = 'none';
	gel("DataType_Choice_" + cq).style.display = 'none';
	gel("DataType_Scale_" + cq).style.display = 'none';
	gel("DataType_String_" + cq).style.display = 'none';
	gel("DataType_Template_" + cq).style.display = 'none';
	gel("DataType_YesNo_" + cq).style.display = 'none';
	gel("DataType_Checkbox_" + cq).style.display = 'none';
	gel("DataType_Date_" + cq).style.display = 'none';
	gel("DataType_DateTime_" + cq).style.display = 'none';
	gel("DataType_Default_" + cq).style.display = 'none';
}

function showRecipientBlock(block) {
	gel("survey_delivery_public").style.display = 'none';
	gel("survey_delivery_invite").style.display = 'none';
	gel("survey_delivery_group").style.display = 'none';
	gel("survey_delivery_triggered").style.display = 'none';
	gel(block).style.display = 'block';
}

// Handle page buttons: Draft, Preview, Publish and Cancel
function submitSurvey(buttonClicked) {
	deleteLastPreview(gel('previewTypeId').value);

	// If Cancel, throw survey away
	if (buttonClicked == 'cancel')
		return true;

	// This is required becase 'typeof buttonId' does not work in chrome
	// Save the button clicked in a hidden field
	$("buttonClicked").value = buttonClicked;

	// Not Cancel, so all other operations get a valiation of form fields
	if (!formFieldsValid())
		return false;

	// Preview shows popup, then goes away
	if (buttonClicked == 'preview') {
		showPreview();

		return false;
	}

	if (!hasQuestions()) {
		if (buttonClicked == 'draft')
			submitPartTwo();

		if (buttonClicked == 'publish')
			gel('Question_1_1').focus();

		return false;
	}

	// Must be Save as draft, or publish
	submitPartTwo();
	return true;

	function submitPartTwo() {
		var surveyInfoObj = serializeForm();
		if (!surveyInfoObj)
			return;

		var surveyInfo = gel('surveyInfo');
		surveyInfo.value = JSON.stringify(surveyInfoObj);
		getInviteUsers();    // set slushbucket users for invite to hidden value 'userId';
		getGroupUsers();

		document.forms[0].submit();
	}
}

function retry() {
	setFocus("Question_1_1");
	return false;
}


function deleteLastPreview(previewTypeId) {
	try {
		if (previewTypeId != '') {
			var ga = new GlideAjax('AssessmentUtilsAJAX');
			ga.addParam('sysparm_name', 'removePreview');
			ga.addParam('sysparm_type', previewTypeId);
			ga.getXMLWait();
		}
	} catch(e) {
		alert('Exception: ' + e);
	}

	return false;
}

function serializeForm() {
	var questionBoxes = $$('.question_text');
	var infos = [];
	for (var i = 0; i < questionBoxes.length; i++) {
		var info = {};
		var questionBox = questionBoxes[i];
		var question = questionBox.value.strip();
		if (question == '')
			continue;

		info.question = question;
		var indexStr = questionBox.id.split('Question')[1];
		var dataTypeSelect = gel('DataType' + indexStr);
		var selectedDatatype = dataTypeSelect.options[dataTypeSelect.selectedIndex].value;
		if (selectedDatatype == '')
			continue;
		info.type = selectedDatatype;

		switch(selectedDatatype) {
			case 'scale':
			case 'choice':
				var options = getChoiceOptions(indexStr, selectedDatatype);
				if (options.length == 0)
					continue;
				info.options = options;
				break;
			case 'long':
			case 'percentage':
			case 'numericscale':
				var minMax = getMinMax(indexStr, selectedDatatype);
				if (minMax == null)
					continue;
				info.options = minMax;
				break;
			case 'string':
				info.options = getTextSize(indexStr);
				break;
			case 'template':
				info.options = getTemplateType(indexStr);
				break;
			case 'attachment':
			case 'date':
			case 'boolean':
			case 'checkbox':
			case 'datetime':
				// Do nothing
				break;
			default:
				continue;
		}
		infos.push(info);
	}

	var surveyName = gel('surveyName').value.strip();
	var surveyDescription = gel('surveyDescription').value.strip();
	var result = {
		name: surveyName,
		description: surveyDescription,
		metrics: infos
	};
	return result;
}

function showPreview() {
	try {
		var qs = serializeForm();
		var surveyInfo = JSON.stringify(qs);

		var ga = new GlideAjax('AssessmentUtilsAJAX');
		var onResponse = function(serverResponse) {
			try {
				var surveys = serverResponse.responseXML.getElementsByTagName('preview');
				if (surveys && surveys.length > 0) {
					var previewTypeId = surveys[0].getAttribute('previewTypeId');
					var previewInstanceId = surveys[0].getAttribute('instanceId');

					gel('previewTypeId').value = previewTypeId;
					gel('previewInstanceId').value = previewInstanceId;

					var message = "${'Show Survey Preview'}";
					var dialog = new GlidePane(message, 'assessment_take2.do?sysparm_assessable_type=' + previewTypeId
						+ '&sysparm_assessable_id=' + previewInstanceId + '&sysparm_isSurveyCreator=yes' + '&');
					dialog.render();

				} else
					alert('Preview not available');

			} catch(e) {
				alert('exception: ' + e);
			}
		};
		ga.addParam('sysparm_name', 'createPreview');
		ga.addParam('sysparm_info', surveyInfo);
		ga.addParam('sysparm_method', 'survey');
		ga.addParam('sysparm_surveyid', gel('surveyId').value);
		ga.getXML(onResponse);
	} catch(e) {
		alert('Exception: ' + e);
	}
}

function formFieldsValid() {
	// Clear previously set notifications
	g.clearMessages();

	// Verify the survey_name is not blank
	if (gel("surveyName").value.strip() == "") {
		g.addErrorMessage("${'Survey name is required'}");
		setFocus("surveyName");
		return false;
	}

	// Verify that the answer format is correct
	var errors = verifyAnswerFormat();
	if (errors.length > 0) {
		for (var i = 0; i < errors.length; i++) {
			var error = errors[i];
			var errorMessage = error.message;
			g.addErrorMessage(errorMessage);
			if (i == 0)
				setFocus(error.question);
		}
		return false;
	}
	return true;
}

// Utility functions
function setFocus(fieldToFocus) {
	document.getElementById(fieldToFocus).focus();
}

function getInviteUsers() {
	var rightSlush = gel('select_1');
	var userId = [];
	for (var i = 0; i < rightSlush.options.length; ++i)
		userId[i] = rightSlush.options[i].value;

	var users = gel('userId');
	users.value = userId.join(',');
}

function getGroupUsers() {
	var slushRight = gel('slush_right');
	var groupId = [];
	for (var i = 0; i < slushRight.options.length; ++i)
		groupId[i] = slushRight.options[i].value;

	var groups = gel('groupUserId');
	groups.value = groupId.join(',');
}

function getChoiceOptions(indexSuffix, type) {
	var result = [];
	var tableId;

	if (type == 'scale')
		tableId = '#DataType_Scale' + indexSuffix;
	else if (type == 'choice')
		tableId = '#DataType_Choice' + indexSuffix;
	else
		return result;

	var choiceOptions = $$(tableId + ' input');

	for (var i = 0; i < choiceOptions.length; i++) {
		var choiceOption = choiceOptions[i];
		if (choiceOption.value.strip() != '')
			result.push({
				answer : choiceOption.value.strip(),
				sys_id : ''
			});
	}
	return result;
}

function getMinMax(indexSuffix, type) {
	var idPrefix;

	if (type == 'long')
		idPrefix = 'DataType_Number';
	else if (type == 'percentage')
		idPrefix = 'DataType_Percentage';
	else if (type == 'numericscale')
		idPrefix = 'DataType_NumericScale';
	else
		return null;

	var min = parseInt(gel(idPrefix + '_Answer' + indexSuffix + '_1').value.strip());
	var max = parseInt(gel(idPrefix + '_Answer' + indexSuffix + '_2').value.strip());

	if (!isNaN(min) && !isNaN(max))
		return {
			min : min,
			max : max
		};

	return null;
}

function getTextSize(indexSuffix) {
	var textSizeSelect = gel('DataType_String_TextSize' + indexSuffix);
	return {
		'textSize': textSizeSelect.options[textSizeSelect.selectedIndex].value
	};
}

function getTemplateType(indexSuffix) {
	var templateSelect = gel('DataType_Template_Answer' + indexSuffix);
	return {
		'templateType': templateSelect.options[templateSelect.selectedIndex].value
	};
}
