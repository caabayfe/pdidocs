// auto complete runs the search for name input 
// populates the names select from the sys_user table
ac = new AutoComplete();
ac.setInput('search'); 
ac.setSelect('names');
ac.setTable('sys_user');
ac.setColumn('name');

// when the user selects a name, get the groups from the server
// using AJAX
function nameRequest(event) {
  var userSysID = getValue(event);
  // call the server to get the user's group 
  var ga = new GlideAjax('UserAuthentication');
  ga.addParam('sysparm_name','getGroups');
  ga.addParam('sysparm_sys_id',userSysID);
  ga.getXML(groupResponse);


}

// AJAX response: the groups this user belongs to
function groupResponse( request) {
  groupReset();

  var select = gel('groups');
  var xml = request.responseXML.documentElement;
  var items = xml.getElementsByTagName("item");
  for (var i = 0; i < items.length; i++ ) {
    var item = items[i];
    var o = new Option(item.getAttribute('name'), item.getAttribute('sys_id'));
    select.options[select.options.length] = o;
  }
}

function groupReset() {
  var select = gel('groups');
  select.options.length = 0; 
}

// group selected, dismiss
function groupSelected(select) {
  actionOK();
}

// enter on the group means selection
function groupEnter(event) {
  event = getEvent(event); 
  if (event.keyCode == 13 || event.keyCode == 3) {
    groupSelected();
  }
}

function actionOK() {
  var select = gel('groups');
  var index = select.selectedIndex;
  if (index == -1) {
    alert('Select a group');
    return;
  }

  var groupSysID = select.options[select.selectedIndex].value; 
  g_form.setValue('assignment_group', groupSysID);
  GlideDialogWindow.get().destroy();
}
