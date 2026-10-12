function onLoad() {
   g_form.setDisplay("delegate_roles_not_selected", false);
   g_form.setDisplay("delegate_roles_roles", false);
   g_form.setDisplay("delegate_roles_user", false);
}

function populateDelegatedRoles(response) {
  var selectedIDs = new Array();
  var index = 0;
  var answer = response.responseXML.documentElement.getAttribute("answer").split(",");
  for (var i = 0; i < answer.length; i++) {
    var roleID = answer[i];
    var options = gel("delegate_roles_roles_select_0").options;
    for (var n = 0; n < options.length; n++) {
      if (options[n].value == roleID) {
        selectedIDs[index++] = n;
        break;
      }
    }
  }
  selectedIDs = selectedIDs.sort();
  if (selectedIDs.length > 0) { // user already has roles in this group, so show them as selected
    var s1 = gel('delegate_roles_roles_select_1');
    moveSelectedOptions(selectedIDs, gel('delegate_roles_roles_select_0'), s1, '--None--', null, '--None--');
    sortSelect(s1);
    s1.selectedIndex = -1;
  }
}
