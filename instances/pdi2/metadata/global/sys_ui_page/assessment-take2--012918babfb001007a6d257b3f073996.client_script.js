//Function to check if the user is reloading or pressing back/forward
//Variable to check if the action on the page is specific to submit/save/cancel on form
//For DEF0235276 to show alert on back & reload

var clickedButton = gel('selection_result');

function navType() {
    var navAction;
    if (window.performance && window.performance.getEntriesByType("navigation").length) {
        navAction = window.performance.getEntriesByType("navigation")[0].type;
        if (navAction == 'navigate' || navAction == 'reload' || navAction == 'back_forward')
            return true;
    }
}

//For DEF0235276 to show alert on back, forward & reload
window.addEventListener('beforeunload', function(e) {
    if (["save", "cancel", "submit"].includes(clickedButton.value) || !g_form.modified)
        return;
   if (navType()) {
		e.preventDefault();
		// Chrome requires returnValue to be set
		e.returnValue = '';
	}
});

// Function for the back button to go to previous page 
function clickBack(view,query) { 
	if (query != null && query.length > 0) {
		var ga = new GlideAjax("AssessmentUtilsAJAX");                                    
		ga.addParam("sysparm_name","backToAssessmentList");
		ga.addParam("sysparm_query", query);
		ga.addParam("sysparm_view",view);
		ga.getXMLWait(function(answer) { 
		}); 
	} else {
		window.history.go(-1); 
		return false;
	}
}

// Function for navigation in survey completed instances list
 function iterateList1(view, query, row, value, update, totalRows) {
	var ga = new GlideAjax("AssessmentUtilsAJAX");                                    
	ga.addParam("sysparm_name","iterateAssessmentInstance");
	ga.addParam("sysparm_query", query); 
	ga.addParam("sysparm_row", row); 
	ga.addParam("sysparm_value", value); 
	ga.addParam("sysparm_totalr", totalRows);
	ga.addParam("sysparm_view",view);
	ga.getXMLWait(function(answer) { 
	});
}


// Adds survey questions to assessment form object

addLoadEvent(function() {
	var checkSign = gel('signature_result');
	suppressEnterKey($j("input, select"));
	if (checkSign) {
		if (gel('jvar_signature_type').value == 'full_name')
			gel('signature_result').value = g_user.getFullName();
	}
	var ids = {};
	var inputs = $$(".questionSetWidget");
	for (var i = 0; i < inputs.length; i++)
		ids[inputs[i].getAttribute('name')] = true;

	for ( var id in ids) {
		var sysId = id.split(':')[1];
		if (sysId != 'null' && id.indexOf('sys_original') < 0) {
			var status;
			var mandatory;
			var allowNA;
			var nameElement = new NameMapEntry(sysId, id);

			g_form.addNameMapEntry(nameElement);
			status = gel('status.' + id);
			if (status == null) {
				if (window.console)
					console.log("Problem locating element 'status." + id + "'");
			} else {
				mandatory = status.getAttribute('oclass');
				mandatory = mandatory != '' ? true : false;
				allowNA = status.getAttribute('allow_na');
				allowNA = allowNA == 'true' ? true : false;
				var glideUIElement = new GlideUIElement('variable', id, 'string', mandatory, 'null');
				glideUIElement.allowNA = allowNA;
				g_form.addGlideUIElement(glideUIElement);
			}
		}
	}

	$j('form').has( "div.assessment" ).submit(function(e) {
		// Upon form submission, disable submit/save/cancel buttons
		$j('.nav.navbar-right').find('button').attr('disabled', true);
		$j('.assessmentButtonRow').find('button').attr('disabled', true);
	});
});

// Use AssessmentForm instead of the regular glide form for this page
addTopRenderEvent(function() {
	if (!window.g_form) {
		window.g_form = new AssessmentForm('ni', true, true);
		window.g_form.loadQuestionMap();
	}
});

// handle navigation when space key is pressed
function toggleAssessmentQuestionRowsWithSpaceKey(event, id, display, isExpand) {

    var e = event;
    var code = e.which || e.keyCode;

    // Check to see if space or enter were pressed
    if (code === 32 || code === 13) {
        // Prevent the default action to stop scrolling when space is pressed
        e.preventDefault();

        toggleAssessmentQuestionRows(id, display);
        toggleSubLabels(id, isExpand);
    }
}

// Toggles labels that are controlled by other labels
function toggleSubLabels(controllerClassName, isExpand) {
	var matches = $(document.body).select('.' + controllerClassName + '--controlled');
	for (var i = 0; i < matches.length; i++) {
		var match = matches[i];
		if(match.getElementsByClassName('toggleOpen')[0])
			match.getElementsByClassName('toggleOpen')[0].style.display = isExpand ? 'none' : '';
		if(match.getElementsByClassName('toggleClosed')[0])
			match.getElementsByClassName('toggleClosed')[0].style.display = isExpand ? '' : 'none';
		match.style.display = isExpand ? '' : 'none';
	}
}

function toggleAssessmentQuestionRows(thisclass, display, fl) {
	forcelabels = false;
	if (fl == true)
		forcelabels = true;
	var rows = $(document.body).select('.' + thisclass);
	for (i = 0; i < rows.length; i++) {
		var element = rows[i];
		var id = element.id;
		var sys_id;
		if(!id){
			var ids = $(element).select("."+"question_label");
			var length = ids.length;
			if(length>0 && ids[length-1] && ids[length-1].id)
				id = ids[length-1].id.substring(6,51);
			sys_id = id.substring(13,45);
		}else{
			sys_id = (id.substring(13,45));
			id = id.substring(0,45);
		}
		if (!id.startsWith('CATEGORY_LABEL:') || forcelabels) {
			if (display === 'none') {
				element.style.display = display;
			}
			else if (!(sys_id in childQuestions)) {
				element.style.display = display;
				var input = $$('#ASMTQUESTION\\:' + sys_id);
				// radio button cases (more than one for scale, none for template):
				if (input.length > 1 || input.length == 0) {
					input = $$('input:checked[type=radio][name="ASMTQUESTION:' + sys_id + '"]');
					if (input.length == 0) {
						input = $$("input[type=checkbox][value='true'][name^='ASMTDEFINITION'][name$='" + sys_id + "']");
						if (input.length > 0) {
							for (var j = 0; j < input.length; j++) {
								var definitionValue = input[j].getAttribute('definitionvalue')
								showDependentQuestions(input[j], definitionValue);
							}
							continue;
						}
					}
				if (input.length == 0)
					input = null;
				else
					input = input[0];
			} else
				input = input[0];
			var childValue = '';
			if (input)
				childValue = getInputValue(input);
			if (parentValueChildMap[sys_id]===null)
					continue;
			showDependentQuestions(sys_id,childValue);
			}
		}
	}
	var sClosed = $(thisclass+'CLOSED');
	var sOpen = $(thisclass+'OPEN');
	var closeImg = $(thisclass+'CLOSED_IMG');
	var openImg = $(thisclass+'OPEN_IMG');
	
	if ('none' == display){
		sClosed.style.display='none';
		sOpen.style.display='';
		openImg.focus();
	}
	else{
		sClosed.style.display='';
		sOpen.style.display='none';
		closeImg.focus();
	}

	var overlay_iframe = top.frames[0] ? top.frames[0].$j('.gb_iframe') : "";
	if(overlay_iframe){
		window.setTimeout(function(){
			overlay_iframe.attr("height",parseInt(overlay_iframe.attr("height"))+1);
		},0);
	}

}

function mergeCheckResults(o1, o2) {
	var mergedResults = {};
	for ( var k in o1) {
		mergedResults[k] = o1[k];
	}
	for ( var m in o2) {
		if (m in mergedResults)
			mergedResults[m] += o2[m];
		else
			mergedResults[m] = o2[m];
	}
	return mergedResults;
}

function isEmptyObject(o) {
	for ( var n in o) {
		if (n && true)
			return false;
	}
	return true;
}

function showInvalidFieldsMessage(obj) {
	var totalInvalidCount = 0;

    // loop through each category of survey
    // obj will only have one key (sys_id of metric type) if there are no categories
	for (var categoryID in obj)
		totalInvalidCount += obj[categoryID];

	if (totalInvalidCount > 0) {
		g_form.clearMessages();
		var msg = '';
		var gwtMsg = new GwtMessage();

		if (totalInvalidCount > 1)
			msg = gwtMsg.getMessage('There are {0} questions that do not have a valid response. Please correct these and re-submit', totalInvalidCount);
		else
			msg = gwtMsg.getMessage('There is {0} question that does not have a valid response. Please correct this and re-submit', totalInvalidCount);

		g_form.addErrorMessage(msg);
		return false;
	}
	return true;
}

var isSignValid = 'false';

function submitAssessment() {
	g_form.clearMessages();
	var c = gel('selection_result');
	c.value = 'submit';

	var stringValidateSucceed = g_form.verifyStringQnResponseWhenSubmit();
	if (!stringValidateSucceed)  // abort action if validation fails
		return false;

	var mandatoryResults = g_form.mandatoryCheck();
	var valueResults = g_form.valueCheck();
	var mergedResults = mergeCheckResults(mandatoryResults, valueResults);
	if (!isEmptyObject(mandatoryResults)) {
		var isRequired = document.body.select('.is-required');					
		var isPrefilled = document.body.select('.is-prefilled');
		//scroll to first mandatory field
		if (isRequired.length != 0) {
			window.scrollBy(0, isRequired.first().getBoundingClientRect().y);
		} else if (isPrefilled.length != 0) {
			window.scrollBy(0, isPrefilled.first().getBoundingClientRect().y);
		}
	}

	if (!isEmptyObject(mergedResults))
		return showInvalidFieldsMessage(mergedResults);

	setHiddenQuestions();
	//Calling function to set the modified property of modified fields to false for DEF0230108, this will be called after the modifications are submitted
	resetFieldChangedProperty();
	return validateSignature();
}

function validateSignature() {
	var checkSign = gel('signature_result');
	if (!checkSign)
		return true;
	if (!checkSign.getValue() || !checkSign.getValue().trim()) {
		g_form.clearMessages();
		checkSign.focus();
		g_form.addErrorMessage(getMessage('You must complete the required signature.'));
		return false;
	}
	if (checkSign.getValue().trim()!='checked' && isSignValid === 'false' && gel('jvar_signature_authentication').value === 'true' && gel('jvar_signature_type').value == 'full_name') {
		gel('overlay').show();
		gel('userName').value = g_user.userName;
		gel('user_password').focus();
		return false;
	}
	return true;
}

function setHiddenQuestions() {
	var hiddenQuestions = {};
	var attachmentQuestions = "";
	if (typeof parentValueChildMap == 'undefined' || typeof displayedQuestions == 'undefined')
		return;

	for ( var questionId in parentValueChildMap) {
		if (!(questionId in displayedQuestions)){
			hiddenQuestions[questionId] = true;
			var rankingElement = gel('ASMTQUESTION:'+questionId);
			if(rankingElement && $j(gel('ASMTQUESTION:'+questionId)).attr('datatype') == "ranking"){
				var rankingElements = document.getElementsByClassName(rankingElement.className);
				for(i = 0; i < rankingElements.length; i++) {
					if(rankingElements[i] !== rankingElement){
						hiddenQuestions[rankingElements[i].id.substring(13,45)] = true;
					}
				}
			}
		}
		var element = gel('header_attachment_'+questionId);
		if(element){
			if(attachmentQuestions == "")
				attachmentQuestions +=questionId;
			else
				attachmentQuestions +=","+questionId;
		}
	}
	gel('hiddenQuestions').value = JSON.stringify(hiddenQuestions);
	gel('attachmentQuestions').value = attachmentQuestions;
}

//Function to set the modified property of modified fields to false for DEF0230108
function resetFieldChangedProperty() {
    if (!g_form)
        return;
    for (var i in g_form.modifiedFields) {
        g_form.fieldChanged(i, false);
    }
}

function saveAssessment() {
	var c = gel('selection_result');
	c.value = 'save';

	var stringValidateSucceed = g_form.verifyStringQnResponseWhenSubmit();
	if (!stringValidateSucceed)  // abort action if validation fails
		return false;

	var valueResults = g_form.valueCheck();
	if (!isEmptyObject(valueResults))
		return showInvalidFieldsMessage(valueResults);

	setHiddenQuestions();
	//Calling function to set the modified property of modified fields to false for DEF0230108, this will be called after the modifications are saved
	resetFieldChangedProperty();
	return true;
}

function cancelAssessment() {
	var c = gel('selection_result');
	c.value = 'cancel';
	//Calling function to set the modified property of modified fields to false for DEF0230108
	resetFieldChangedProperty();
	return true;
}

function closeAssessment() {
	var typeId = gel('type_sysID').value;
	var instanceId = gel('instance_sysID').value;

	try {
		var ga = new GlideAjax('AssessmentUtilsAJAX');
		ga.addParam('sysparm_name', 'removePreview');
		ga.addParam('sysparm_type', typeId);
		ga.addParam('sysparm_instance', instanceId);
		ga.getXMLWait();

		// Bring down the iframe preview window
		parent.gel('FormDialog').gWindow.destroy();
	} catch (e) {
		alert('Exception: ' + e);
	}

	return false;
}

function getDependentQuestions(instanceQuestionId) {
	var childMap = {};
	for ( var value in parentValueChildMap[instanceQuestionId]) {
		if (!value)
			continue;
		var valueChildren = parentValueChildMap[instanceQuestionId][value];
		for (var i = 0; i < valueChildren.length; i++)
			childMap[valueChildren[i]] = true;
	}
	var children = [];
	for ( var childId in childMap) {
		if (!childId)
			continue;
		children.push(childId);
	}
	return children;
}

var templateRowParents;

function getInputValue(input) {
	var value = '';
	if (input) {
		if (input.tagName.toLowerCase() == 'select') {
			var selectedIndex = input.selectedIndex;
			if (selectedIndex >= 0)
				value = input.options[selectedIndex].value;
		} else if (input.type.toLowerCase() == 'checkbox') {
			if(input.id.startsWith('ASMTDEFINITION:'))
				input = gel(input.id);
			else
				input = gel(input.id.substr(3));
			if (input.value == 'true')
				value = '1';
			else
				value = '0';
		} else if (input.type == 'hidden') {
			if (input.value == 'true')
				value = '1';
			else
				value = '0';
		} else
			value = input.value;
	}
	return value;
}

function showDependentQuestions(elem,result) {

	if (typeof parentValueChildMap == 'undefined' || typeof displayedQuestions == 'undefined')
		return;

	var value;
	var instanceQuestionId;
	var fMultipleCheckbox = false;
	if(elem && elem!='undefined' && elem.id && elem.id!='undefined' && elem.id.startsWith('ASMTDEFINITION:'))
		fMultipleCheckbox = true;

	// called in category toggleAssessmentQuestionRows function only, otherwise elem should be an html element and result is null
	if(typeof elem =='string'){
		instanceQuestionId = elem;
		if(result=='true')
			value = 1;
		else if(result=='false')
			value = 0;
		else
			value=result;
	}else{
		instanceQuestionId= elem.name;
		if (!instanceQuestionId)
			instanceQuestionId = elem.id;
		if (instanceQuestionId.indexOf('ni.') == 0)
			instanceQuestionId = instanceQuestionId.substr(3);
		value = getInputValue(elem);
		instanceQuestionId = instanceQuestionId.substr(13);
		if (instanceQuestionId.indexOf('-') > 0)
			instanceQuestionId = instanceQuestionId.substring(0, instanceQuestionId.indexOf('-'));
		if(fMultipleCheckbox)
			instanceQuestionId = elem.id.split("_")[1];
	}
	if (!(instanceQuestionId in parentValueChildMap))
		return;

	templateRowParents = [];
	hideDescendants(instanceQuestionId);
	if(fMultipleCheckbox){
		var map = g_form.questionMap;
		for(var key in map[instanceQuestionId]){
			if(map[instanceQuestionId][key]){
				var defValue = $j(gel('ASMTDEFINITION:'+key+'_'+instanceQuestionId)).attr('definitionvalue');
				showDescendantsByValue(instanceQuestionId, defValue);
			}
		}
	}
	else
		showDescendantsByValue(instanceQuestionId, value);
	for (var i = 0; i < templateRowParents.length; i++)
		updateTemplateGroup(templateRowParents[i]);
}

function showDescendantsByValue(instanceQuestionId, value) {

	// Show the children that should be displayed for the selected value
	var childIdsToShow = parentValueChildMap[instanceQuestionId][value];
	if (!childIdsToShow)
		return;

	for (var i = 0; i < childIdsToShow.length; i++) {
		var r = gel('ASMTQUESTION:' + childIdsToShow[i] + '-row');
		if (r) {
			r.style.display = '';
			var r_1 = gel('label_ASMTQUESTION:' + childIdsToShow[i]);
			r_1.style.display = '';
		}

		if (r.className.indexOf('template_question_row') >= 0 && templateRowParents.indexOf(r.parentNode) < 0)
			templateRowParents.push(r.parentNode);

		var childId = childIdsToShow[i];
		
		var input = $$('#ASMTQUESTION\\:' + childId);
		// radio button cases (more than one for scale, none for template):
		if (input.length > 1 || input.length == 0) {
			input = $$('input:checked[type=radio][name="ASMTQUESTION:' + childId + '"]');
			if (input.length == 0)
				input = null;
			else
				input = input[0];
		} else
			input = input[0];

		var childValue = '';
		if (input)
			childValue = getInputValue(input);

		var map = g_form.questionMap;
		if(childId in map){
			for(var key in map[childId]){
				if(map[childId][key]){
						var defValue = $j(gel('ASMTDEFINITION:'+key+'_'+childId)).attr('definitionvalue');
						showDescendantsByValue(childId, defValue);
					}
			}
		}
		else
			showDescendantsByValue(childId, childValue);
		displayedQuestions[childId] = true;
	}
}

function hideDescendants(instanceQuestionId) {

	// hide all children
	var childIds = getDependentQuestions(instanceQuestionId);
	for (var i = 0; i < childIds.length; i++) {
		var r = gel('ASMTQUESTION:' + childIds[i] + '-row');
		if (r)
			r.style.display = 'none';
		if (r.className.indexOf('template_question_row') >= 0 && templateRowParents.indexOf(r.parentNode) < 0)
			templateRowParents.push(r.parentNode);
		
		hideDescendants(childIds[i]);
		delete displayedQuestions[childIds[i]];
	}
}

function updateTemplateGroup(group) {
	var questionsInGroup;
	var elementsByClassname;
	if (isMSIE6 || isMSIE7 || isMSIE8) {
		elementsByClassname = $$('.template_question_row');
		uniqueIdOfGroup = group.uniqueID;
		questionsInGroup = new Array();
		for (var i = 0; i < elementsByClassname.length; i++) {
			if (uniqueIdOfGroup == elementsByClassname[i].parentElement.uniqueID) {
				questionsInGroup.push(elementsByClassname[i]);
			}
		}
	} else {
		questionsInGroup = group.getElementsByClassName('template_question_row');
	}
	var numHiddenQuestions = 0;
	for (var i = 0; i < questionsInGroup.length; i++) {
		if (questionsInGroup[i].style.display == 'none')
			numHiddenQuestions++;
	}

	var parent = group;
	while (parent.className.indexOf('template_group_row') < 0 && parent.tagName.toLowerCase() != 'body')
		parent = parent.parentNode;

	if (parent.tagName.toLowerCase() != 'tr')
		return;

	if (numHiddenQuestions == questionsInGroup.length)
		parent.style.display = 'none';
	else {
		parent.style.display = '';
		styleTemplateTable(parent);
	}
}

function styleTemplateTable(table) {
	var rows;
	var elementsByClassname;
	var uniqueIdOfParent;

	if (isMSIE6 || isMSIE7 || isMSIE8) {
		elementsByClassname = $$('.template_question_row');
		uniqueIdOfParent = table.uniqueID;
		rows = new Array();
		for (var i = 0; i < elementsByClassname.length; i++) {
			if (uniqueIdOfParent == elementsByClassname[i].parentElement.uniqueID) {
				rows.push(elementsByClassname[i]);
			}
		}
	} else {
		rows = table.getElementsByClassName('template_question_row');
	}
	var cls = 'list_odd';
	for (var i = 0; i < rows.length; i++) {
		rows[i].removeClassName('list_even');
		rows[i].removeClassName('list_odd');

		if (rows[i].style.display != 'none') {
			rows[i].addClassName(cls);
			cls = cls == 'list_odd' ? 'list_even' : 'list_odd';
		}
	}
}

function checkLogin() {	
   var userName = gel('userName').value;
   var userPassword = gel('user_password').value;
   var ga = new GlideAjax("AssessmentVerifySignature");
   ga.addParam("sysparm_name", 'verifySignature');
   ga.addParam("sysparm_user", userName);
   ga.addParam("sysparm_password", userPassword);
   ga.getXMLAnswer(checkLoginResponse);
}

function checkLoginResponse(answer){
   if (answer == 'true'){
	   isSignValid = 'true';
	   gel('invalid_login_img').hide();
	   gel('submit').click();
	   return;
   }  
   loginFailed();
   return false;
}

function loginFailed() {
    gel('invalid_login_img').show();
}

function cancelOverlay() {
	gel('invalid_login_img').hide();
	gel('overlay').hide();
}

function openTaskOverlay(event){
	var url = gel('task_record_url').value;
	
	//clearing the stack, so the user if clicks update or save, it won't show the survey page as that is in the navigation stack history
	if (url != null)
		url = url + '&sysparm_clear_stack=true';
		
	var d = new GlideOverlay({
		title: 'Related Task',
		iframe: url,
		width:'60%',
		height: '80%'
    });
    
    d.setPreference('sysparm_nostack', 'true');
	
	var hideDialogBckBtn = function() {
		var iframe = this.getIFrameElement();
		var D = iframe.contentDocument || iframe.contentWindow.document;
		var backButton = D.getElementsByClassName("btn btn-default icon-chevron-left navbar-btn")[0];
		if(backButton)
			backButton.style.display="none";
	};
	
	d.setOnAfterLoad(hideDialogBckBtn)
	
    d.render();
	event.preventDefault();
}
function closeTaskRecoreMsg(){
	gel('output_messages_container').style.display  = 'none';
}

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
