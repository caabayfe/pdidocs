function validateNewGroup() {
    var indicator = document.getElementById("indicator").value;
    var date = document.getElementById("date").value;
	var source = document.getElementById("source").value;
    if (indicator == "") {
        alert("Please select one contributing indicator");
        return false;
    }
	document.getElementById("cancelBtn").click();
	launchWorkbench(indicator, date, source);
}
