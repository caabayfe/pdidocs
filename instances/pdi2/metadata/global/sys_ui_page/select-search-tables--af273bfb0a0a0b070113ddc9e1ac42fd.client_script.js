setTablePrefCheckboxes();

function setTablePrefCheckboxes() {
  var inputs = document.getElementsByTagName("input");
  var i = 0;
  var allchecked = true;
  while(i < inputs.length) {
	if (inputs[i].type == "checkbox" && inputs[i].name.substring(0, 16) == "sysparm_tstable_") {
	   if (getPreference("ts.table." + inputs[i].name.substring(16),"true") == "false") {
	      inputs[i].checked = false;
	      allchecked = false;
           }
	}
	i++;
  }
  document.getElementById("search_all_tables").checked = allchecked;
}

function tsTableCheckbox(box) {
	var name = box.name.substring(16);
	var searchall = document.getElementById("search_all_tables");

	// are we checking or unchecking
	var checking = box.checked;

	// set preference
	if (checking) {
		setPreference('ts.table.' + name,'true');
		var inputs = document.getElementsByTagName("input");
		var allchecked = true;
		var i = 0;
		while(i < inputs.length && allchecked) {
			if (inputs[i].type == "checkbox" && inputs[i].name.substring(0, 16) == "sysparm_tstable_")
				if (!inputs[i].checked)
					allchecked = false;
			i++;
		}
		if (allchecked)
			searchall.checked = true;
	} else {
		setPreference('ts.table.' + name,'false');
		if (searchall.checked)
			searchall.checked = false;
	}
}

function toggleBox(id) {
	var box = document.getElementById(id);
	box.checked = !box.checked;
	if (box.name == "search_all_tables")
		checkAll();
	else
		tsTableCheckbox(box);
}

function checkAll() {
    //set all table checkboxes to what "select all" just got set to
    var selectall = document.getElementById("search_all_tables");
    var inputs = document.getElementsByTagName("input");
    var i = 0;
    while(i < inputs.length) {
		if (inputs[i].type == "checkbox" && inputs[i].name.substring(0, 16) == "sysparm_tstable_") {
			if (inputs[i].checked != selectall.checked) {
			    inputs[i].checked = selectall.checked;
			    tsTableCheckbox(inputs[i]);
			}
		}
		i++;
	}
}
