var LM = 'gs.include("ListMechanic"); var v = new ListMechanic();';

function actionOK(reset) {
  var keys = ["Saving", "Reloading"];
  var msgs = new GwtMessage().getMessages(keys);
  var array = slush.getValues(slush.getRightSelect());  var f = array.join(',');
  var o = slush.getRightValues();
  var changes = true;
  if (f == o)
     changes = false;
  setStatus(msgs["Saving"] + "...");

  var enableCompactList = gel('ni.compact').checked;
  var enableHighlighting = gel('ni.highlighting').checked;
  var enableTextWrap = gel('ni.wrap').checked;
  var enableModernCellColoring = gel('ni.field_style_circles').checked;

  var ga = new GlideAjax('UIPage');
  ga.addParam('sysparm_name','createListMechanic');
  ga.addParam('sysparm_reset',reset ? true : false);
  ga.addParam('sysparm_list_view',g_list_view);
  ga.addParam('sysparm_list_parent',g_list_parent);
  ga.addParam('sysparm_list_parent_id',g_list_parent_id);
  ga.addParam('sysparm_list_relationship',g_list_relationship);
  ga.addParam('sysparm_table',g_table);
  ga.addParam('sysparm_f',f);
  ga.addParam('sysparm_changes',changes);
  ga.addParam('sysparm_compact',enableCompactList);
  ga.addParam('sysparm_wrap',enableTextWrap);
  ga.addParam('sysparm_highlighting',enableHighlighting);
  ga.addParam('sysparm_field_style_circles', enableModernCellColoring);

  var enableListEdit = gel('ni.list_edit_enable');
  if (enableListEdit)
     ga.addParam('sysparm_edit_enable', enableListEdit.checked);

  var enableDblClickToEdit = gel('ni.list_edit_double');
  if (enableDblClickToEdit)
     ga.addParam('sysparm_edit_double',enableDblClickToEdit.checked);

  trackMetrics({
	"interface-type": 'CoreUI',
	"table": g_table,
	"parentId": g_list_parent_id,
	"listParent": g_list_parent,
	"relationship": g_list_relationship,
	"columns": f,
	"hasChanges": changes,
	"enableListEdit": enableListEdit && enableListEdit.checked,
	"enableCompactList": enableCompactList,
	"enableDoubleClickToEdit": enableDblClickToEdit && enableDblClickToEdit.checked,
	"enableHighlighting": enableHighlighting,
	"enableTextWrap": enableTextWrap,
	"enableModernCellColoring": enableModernCellColoring
  });

  ga.getXMLWait();
  ga.getAnswer();
  setStatus("<span style='color:green'> " + msgs['Reloading'] + "</span>");
  setTimeout('reloadWindow(self, true);', 1);
  GlideDialogWindow.get().destroy();
  return false;
}

function setStatus(statusHTML) {
  gel('list_mechanic').getElementsByClassName('status_msg_update')[0].innnerHTML = statusHTML;
}

function getList() {

  if (typeof g_table == "undefined")
    g_table = 'sys_user';

  if (typeof g_list_view == "undefined")
    g_list_view = "";

  if (typeof g_list_parent == "undefined")
    g_list_parent = "";

  if (typeof g_list_relationship == "undefined")
    g_list_relationship = "";
  var ga = new GlideAjax('UIPage');
  ga.addParam('sysparm_name','getList');
  ga.addParam('sysparm_list_view',g_list_view);
  ga.addParam('sysparm_list_parent',g_list_parent);
  ga.addParam('sysparm_list_parent_id',g_list_parent_id);
  ga.addParam('sysparm_list_relationship',g_list_relationship);
  ga.addParam('sysparm_table',g_table);
  ga.getXML(listResponse);
}

function listResponse(request) {
  function _toBoolean(value) {
    return value === 'true';
  }

  var xml = request.responseXML.documentElement;

  var z = xml.getElementsByTagName("columns")[0];
  populateSelect(gel('slush_left'), z);

  z = xml.getElementsByTagName("selected")[0];
  populateSelect(gel('slush_right'), z);
  var array = slush.getValues(slush.getRightSelect());
  var r = array.join(",");
  slush.saveRightValues(r);

  // a user list?
  z = xml.getElementsByTagName("choice_list_set")[0];
  var a = _toBoolean(z.getAttribute("user_list"));
  gel('ni.highlighting').checked = _toBoolean(z.getAttribute('table.highlighting'));
  gel('ni.compact').checked = _toBoolean(z.getAttribute('table.compact'));
  gel('ni.wrap').checked = _toBoolean(z.getAttribute('table.wrap'));
  gel('ni.field_style_circles').checked = _toBoolean(z.getAttribute('field_style_circles'));

  var o = gel('ni.list_edit_enable');
  if (o)
    o.checked = _toBoolean(z.getAttribute('list_edit_enable'));
  var o = gel('ni.list_edit_double');
  if (o)
    o.checked = _toBoolean(z.getAttribute('list_edit_double'));

  gel('reset_column_defaults').disabled = !a;
}

function populateSelect(select, xml) {
  select.options.length = 0;
  var choices = xml.getElementsByTagName("choice");
  for (var i = 0; i < choices.length; i++ ) {
    var choice = choices[i];
    var o = new Option(choice.getAttribute('label'), choice.getAttribute('value'));
	o.setAttribute('aria-selected', false);
	o.setAttribute('role', 'option');
	o.setAttribute('title', choice.getAttribute('label'));
    select.options[select.options.length] = o;
  }
}

function trackMetrics(payload) {
	if (!GlideUXMetrics)
		return;
	GlideUXMetrics.track('Personalize List Columns', payload);
}

getList();
