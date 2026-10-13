function delNo() {
	gel('selection_result').value = 'no';
	return true;
}

function delYes() {
	gel('selection_result').value = 'yes';
	gel('nait_name').value = gel('nait_name_in').value;
	gel('nait_label').value = gel('nait_label_in').value;
	return true;
}
