function onAddTypeSelect(id) {
	closeOpenType(id);
	var e = gel(id);
	e.style.display = 'block';
	if (id === "div_coverage")
		gel("select_coverage").focus(); // focusing takes care of some of the IE7 jumpiness in the dialog
	else if (id === "div_roster")
		gel("select_roster").focus();
	else if (id === "div_time_off")
		gel("select_time_off").focus();
}

function closeOpenType(id) {
	if (id !== 'div_coverage')
		closeIfOpen('div_coverage');

	if (id !== 'div_roster')
		closeIfOpen('div_roster');

	if (id !== 'div_time_off')
		closeIfOpen('div_time_off');
}

function closeIfOpen(id) {
   var e = gel(id);
   if (e && e.style.display != 'none') {
	  e.style.display = 'none';
   }
}

function actionOK() {
	var eMember;
	var sMember;
	if (gel('type_coverage').checked) {
		eMember = gel('member');
		sMember = gel('select_coverage');
		var eRoster = gel('coverage_on');
		var sRoster = gel('select_coverage_on');
		eMember.value = getSelectedOption(sMember).value;
		eRoster.value = getSelectedOption(sRoster).value;
	} else if (gel('type_roster').checked) {
		eMember = gel('roster');
		sMember = gel('select_roster');
		eMember.value = getSelectedOption(sMember).value;
	} else if (gel('type_time_off').checked) {
		eMember = gel('member');
		sMember = gel('select_time_off');
		eMember.value = getSelectedOption(sMember).value;
	}
	return true;
}
