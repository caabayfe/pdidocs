function onSubmit() {

  var ss = map_select_sb_rightzone.getValues();

  if (ss == "") {
    alert("Please select a transform map first");
    return false;
  }

  var e = gel('import_button');
  e.style.display = "none";
  e = gel('loading');
  e.style.display = "inline";

  // set the selected list as a comma seperated string for server side
  var el = gel('transform_map_list');
  el.value=ss;
}
