var isDoctype = document.documentElement.getAttribute('data-doctype') == 'true';
    function getSM() {
   var ga = new GlideAjax("UIPage");
   ga.addParam('sysparm_name','createSecurityMechanic');
   ga.addParam('sysparm_table',gel('table_name').value);
   ga.addParam('sysparm_field',gel('field_name').value);
   ga.addParam('sysparm_operation',gel('operation').value);
   return ga;
}

function setStatus(status) {
   gel('status').innerHTML = status;
}

function clearStatus(){
	var node = gel('status');
	while (node.hasChildNodes()) {
		node.removeChild(node.firstChild);
	}
}

function getList() {
  var ga = getSM();
  ga.addParam('sysparm_save',false);
  ga.getXML(listResponse);
}

function selectOperation() {
  getList();
}

function listResponse( request) {
  var xml = request.responseXML.documentElement;

  var z = xml.getElementsByTagName("columns")[0];
  populateSelect(gel('slush_left'), z);

  z = xml.getElementsByTagName("selected")[0];
  populateSelect(gel('slush_right'), z);

  z = xml.getElementsByTagName("choice_list_set")[0];
  var a = z.getAttribute("row_rule");
  var status;
  var b = z.getAttribute("field_rule");
  var warning = '';
  if (a == 'true') {
    warning = 'Existing row rules on ' + gel('table_name').value + ' may override this definition';
  }

  if (b == 'true') {
     if (warning != '')
        warning = warning + ' ';
     warning = warning + 'Existing field rules on ' + gel('table_name').value + '.' + gel('field_name').value + ' may override this definition';
  }
	if (isDoctype){
		status = '<span class="notification notification-warning" style="display:inline-block;">' + warning + '</span>';
	} else {
		status = '<span style="background-color:yellow">' + warning + '</span>';
	}

	if(warning == ''){
		clearStatus();
	} else {
		setStatus(status);
	}
}

function postSave() {
  var status;
	if (isDoctype) {
		status = '<span class="notification notification-success" style="display:inline-block;">Save complete</span>';
	} else {
		status = '<span style="background-color:paleGreen">Save complete</span>';
	}
  setStatus(status);
}

function actionOK() {
  var array = slush.getValues(slush.getRightSelect());
  var f = array.join(',');
  var ga =  getSM(); + 'v.saveList("' + f + '");';
  ga.addParam('sysparm_save',true);
  ga.addParam('sysparm_f',f);
  var status;

	  if (isDoctype){
		  status = '<span class="notification notification-info" style="display:inline-block;">Save in progress...</span>';
	  } else {
		  status = '<span style="background-color:yellow">Save in progress...</span>';
	  }

  setStatus(status);
  ga.getXML(actionOKResponse);
}

function actionOKResponse(response) {
  if (!response || !response.responseXML)
    return

  postSave();
}

function populateSelect(select, xml) {
  select.options.length = 0;
  var choices = xml.getElementsByTagName("choice");
  for (var i = 0; i < choices.length; i++ ) {
    var choice = choices[i];
    var o = new Option(choice.getAttribute('label'), choice.getAttribute('value'));
    select.options[select.options.length] = o;
  }
}

getList();

disablePageIfOutOfScope();

function disablePageIfOutOfScope() {
	var shouldDisable = (gel('allow_assign_field').value == "false");
	disablePage(shouldDisable);
}

function disablePage (disable) {
	disableButtons(disable);
	disableFields(disable);
	disableBoxs(disable);
	disableArrowTable(disable);
}

function disableButtons (d) {
	var b = document.getElementById("ok_button");
	if(b)
		b.disabled = d;
}

function disableFields(d) {
	var b = document.getElementById('operation');
	if(b)
		b.disabled = d;
}

function disableBoxs (d) {
	var b = document.getElementById("slush_left");
	if (b) {
		b.selectedIndex = -1;
		b.disabled = d;
	}
	b = document.getElementById("slush_right");
	if (b) {
		b.selectedIndex = -1;
		b.disabled = d;
	}
}

function disableArrowTable(d) {
	var element = document.getElementById("upDownButtons");
	setVisibility(d, element);
	element = document.getElementById("addRemoveButtons");
	setVisibility(d, element);
}

function setVisibility (d, element) {
	if (element) {
		if (d)
			element.style.visibility = "hidden";
		else
			element.style.visibility = "visible";
	}
}
