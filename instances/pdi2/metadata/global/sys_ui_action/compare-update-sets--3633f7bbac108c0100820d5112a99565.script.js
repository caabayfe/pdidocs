function runCompare() {
  var list = GlideList2.get('sys_update_set');
  var keyset = list.getChecked();


  // Verify that the user has selected at least two update sets to compare
  if (keyset.split(',').length < 2) {
      alert('Please select a minimum of 2 Update Sets for comparison.');
      return;
  }
  // Add the retrieved updates to the Preview list
  var ga = new GlideAjax('UpdateSetPreview');
  ga.addParam('sysparm_name','generateCollisionRecords');
  ga.addParam('sysparm_keyset',keyset);
  ga.getXML(runCompareResponse);
}

function runCompareResponse(response) {
  var win = getMainWindow();
  reloadWindow(win);
}
