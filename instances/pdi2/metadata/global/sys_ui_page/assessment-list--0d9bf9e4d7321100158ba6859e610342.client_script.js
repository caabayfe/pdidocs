var rows = gel('rows').value;
rows = jQuery.parseJSON(rows);
buildCards(rows);
var elm = jQuery('a[href], [tabindex]')[0];
if (elm) {
	elm.focus();
}
function buildCards(data) {
	var i = 0;
	if (data[0] != '') {
		while (i < data.length) {
			var info = buildBody(data, i);
			if (info.name != '') {
				var window = new Array();
				window[i] = createGlideWindow(data[i].inst_id, 'id' + data[i].inst_id, true, info.name, info.body, data[i].mt_id, data[i].inst_user, data[i].mt_evaluation_method);
				i++;
			}
		}
	}
}
function showAll(instance, type) {
	var url = 'assessment_list.do?sysparm_show=all';
	window.location = url;
}
function showMine(instance, type) {
	var url = 'assessment_list.do?sysparm_show=user';
	window.location = url;
}
function viewAssessment(id, evalMethod) {
	var url = 'asmt_metric_type.do?sys_id=' + id + '&sysparm_view=' + evalMethod;
	window.location = url;
}
function takeAssessment(instance, type) {
	var url = 'assessment_take2.do?sysparm_assessable_sysid=' + instance + '&sysparm_assessable_type=' + type;
	window.location = url;
}
function createGlideWindow(div, id, readOnly, title, body, mt_id, user, eval_method) {
	var w = new GlideWindow(id, readOnly);
	w.setPosition('relative');
	w.setTitle(title);
	w.setSize("100%", "");
	w.setBody(body);
	w.setFontSize(12);
	w.setFontWeight("normal");
	w.setHeaderColor("");
	w.setClassName("drag_section asmt-card");
	w.insert(div);
	if(w.getWindowDOM()){
		w.getWindowDOM().style.tableLayout = "fixed";
		w.getWindowDOM().style.height = "inherit";
		w.getWindowDOM().setAttribute("tabindex", "0");
		w.getWindowDOM().style.padding = "10px";
		w.getWindowDOM().style.borderRadius = "4px";
		w.getWindowDOM().setAttribute("role", "link");
		if ("${gs.getUserID()}" == user) {
			w.getWindowDOM().setAttribute("onClick", 'takeAssessment(\'' + div + '\',\'' + mt_id + '\');');
		}
		else {
			w.getWindowDOM().setAttribute("onClick", 'viewAssessment(\'' + mt_id + '\',\'' + eval_method + '\');');
		}
	}
	if(w.getHeader()){
		w.getHeader().style.tableLayout = "fixed";
	}
	if(w.getTitle()){
		w.getTitle().style.overflow = "hidden";
		w.getTitle().style.textOverflow = "ellipsis";
	}
	return w;
}
function buildBody(data, id) {
	var desc = data[id].inst_description.escapeHTML();
	var name = '';
	var body = '';
	if (typeof desc  != "undefined") {
	
		var assignedToMsg = getMessage("Assigned to");
		var stateMsg = getMessage("State");
		var dueDateMsg = getMessage("Due date");
	
		desc = desc.replace(/\n/g, '<br/>');
		desc = desc.replace(/\r/g, '');
		var tagText = "";
		var gwtMessage = new GwtMessage();
		if (data[id].mt_evaluation_method != "testplan") {
			var datum = data[id].mt_evaluation_method_display;
			if (data[id].inst_preview == "true")
				tagText = gwtMessage.getMessage("Preview {0}", datum);
			else if (data[id].inst_state_id == "complete")
				tagText = gwtMessage.getMessage("Modify {0}", datum);
			else
				tagText = gwtMessage.getMessage("{0}", datum);
		}
		else if (data[id].inst_state_id == "complete")
			tagText = getMessage("Retest");
		else if (data[id].inst_preview == "false")
			tagText = getMessage("Start Testing");
		name += '<div style="font-size:12px; margin: 3px 13px;">' + tagText + '</div>';
		body += '<table style="width: 100%;">';
		body += '<tbody><tr>';
		body += '<td style="max-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%" class="homepage_category_only_description_cell">';
		body += '<span>';
		body += '<h2 style="display: inherit; margin: 10px 0px 0px 0px; font-size: 15px; font-weight: bold; overflow:hidden; text-overflow:ellipsis;" title="' + data[id].mt_name +'">';
		body += data[id].mt_name;
		body += '</h2>';
		body += '</span><br>';
		body += '<div style="white-space:normal; margin-bottom:12px;font-size: 12px;" class="asmt-field-color">' + desc + '</div>';
		body += '<span style="white-space:normal;font-size: 12px;">' + assignedToMsg + ': </span><span style="white-space:normal;font-size: 12px;" class="asmt-field-color">' + data[id].user_name.escapeHTML() + '</span><br/>';
		body += '<span style="white-space:normal;font-size: 12px;">' + stateMsg + ': </span><span style="white-space:normal;font-size: 12px;" class="asmt-field-color">' + data[id].inst_state + '</span><br/>';
		body += '<span style="white-space:normal;font-size: 12px;">' + dueDateMsg + ': </span><span style="white-space:normal;font-size: 12px;" class="asmt-field-color">' + data[id].inst_due_date + '</span><br/>';
		if(data[id].inst_trigger_id){
		body += '<span style="white-space:normal;font-size: 12px;">' + data[id].inst_trigger_table + ': </span><span style="white-space:normal;font-size: 12px;" class="asmt-field-color">' + data[id].inst_trigger_id + '</span><br/>';
		}
		body += '</td></tr></td></tr></tbody></table>';
	}
	return {body: body, name: name};
}
