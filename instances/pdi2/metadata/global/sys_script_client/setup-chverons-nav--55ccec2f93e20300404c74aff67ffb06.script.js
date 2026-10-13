var infoText = [];

infoText[1] = getMessage("Specify the alert rule name, order and description. Specify whether to look for other alert rules that match the same alert. Ensure that at least one action is specified in the Actions tab.");
infoText[2] = getMessage("Specify a mandatory alert filter on which this alert rule may be applied. You can also specify related list conditions, such as, number of secondary alerts.\nUse the 'Rule is activated when' option to control either when the rule executes on every update when the alert matches the filter or only after content changes that cause the alert to match the filter.");
infoText[3] = getMessage("Specify alert rule response to alert using pre-defined remediation subflows from ServiceNow Flow Designer. Use it to create incident, send mail, update alert, etc. Specify automatic or interactive type to control execution. ") ;

function onLoad() {
	
	var showHideSection = function(show,list) {
		
		var findClosestElement = function(element, className) {
				var exist = function(el,className) {
					if (el === "undefined" || el == null) {
						return null;
					}
					if (el.hasClassName("row")) {
						return el;
					}
					el = el.parentElement;
					return exist(el,className);
				};
			return exist(element,className);
		};
		
		var cEl = findClosestElement($(list),"row");	
		
		var par = cEl;
		//var par = $(list).closest(".row");
		if (show) 
			par.show();
		else 
			par.hide();
	};
	
	var showHideEmbededTable = function(show,embededTableName) {
		var selector = 'div[tab_list_name_raw=\"em_alert_management_rule.' + embededTableName + '.management_rule\"]';
		
		var list = $$(selector)[0];
		if (typeof list == "undefined") {
			return;
		}
		if(!list.hasClassName('embedded')) {
			return;
		}
		showHideSection(show,list);
	};
	
	var showHideAdvanceSection  = function(show) {
		var selector = "select[name='em_alert_management_rule.multiple_alert_rules']";
		var list = $$(selector)[0];
		if (typeof list == "undefined") {
			return;
		}
		showHideSection(show,list);
	};
	
	var setState = function(index) {
		g_form.setValue('em_alert_management_rule.state',Number(index));
		var notificationDiv = $$(".annotation-wrapper");
		var msg = infoText[Number(index)];
		if (notificationDiv) {
			var oldChild=  notificationDiv[0].children[notificationDiv[0].children.length -1];
			notificationDiv[0].innerText = msg;
			
			//Copy children of the div, to get extra padding
			notificationDiv[0].appendChild(oldChild);
		}
		
		var showActionTables = (index == 3);
		showHideEmbededTable(showActionTables,"em_alert_man_m2m_rule_flow");
		showHideEmbededTable(showActionTables,"em_alert_man_m2m_rule_workflow");
		showHideEmbededTable(showActionTables,"em_launch_application");
		showHideAdvanceSection(index == 1);
	};
	
	//Run onclick to set the state field which trigger th UI Policy
	var initElement = function(event,listOfChev) {
		var el = event.currentTarget;
		var val = el.getAttribute('index');
		setState(val);
		
		//Set up the bar to reflect selected
		initSelectedBar(listOfChev,val);
	};
	
	//Set up the bar to reflect selected
	var initSelectedBar = function(listOfChev,val) {
		var styledElement;
		
		for (var index = 1; index < listOfChev.length; index++) {
			styledElement = listOfChev[index];
			
			if (index == val)  {
				styledElement.addClassName("active");
				styledElement.setAttribute('aria-selected', 'true');
				styledElement.setAttribute('aria-current', 'step');
			} else {
				styledElement.removeClassName("active");
				styledElement.setAttribute('aria-selected', 'false');
				styledElement.setAttribute('aria-current', 'false');
			}
		}
	};
	
	var initFilter = function() {
		//If the alert filter wasn't set yet we put "empty" value in it, so it will show empty condition.
		//If not- it shows Keywords
		var filter = g_form.getValue("alert_filter") +"";
		if (filter === "empty") {
			g_form.setValue("alert_filter","");
		}
	};
	
	
	var getSysId = function(uri) {
		var index = uri.indexOf("sys_id");
		if (index == -1) {
			return 0;
		} else if (uri.charAt(index + 7) == "-") {
			return uri.substring((index+7),(index+9));
		}
		return uri.substring((index+7),index+39);
	};
	
	//On Load
	var divOfChveronContainerElement = $$("[id='4c1aeceb93e20300404c74aff67ffb87']");
	var tableElement = divOfChveronContainerElement[0].querySelector('table');
	//Remove scroll bar
	tableElement.style.width  ='98%';
	 
	var listOfChev = $$('li');

	for (var index = 1; index < listOfChev.length; index++) {
		listOfChev[index].setAttribute('index',index);
		listOfChev[index].onclick= function(event) {
			initElement(event,listOfChev);
		};
	}
	
	var savedIndex = 1;
	prevSysId  = getSysId(document.referrer);
	thisSysId  = getSysId(document.URL);
	if ((prevSysId == thisSysId) || (prevSysId == "-1")){
		savedIndex = g_form.getValue('em_alert_management_rule.state');
	}

	initFilter();
	initSelectedBar(listOfChev,savedIndex);
	setState(savedIndex);
}
