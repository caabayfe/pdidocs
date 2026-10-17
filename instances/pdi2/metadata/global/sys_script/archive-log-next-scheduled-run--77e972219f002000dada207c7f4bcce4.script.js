var xx = new GlideRecord('sys_trigger');
xx.addQuery('name', 'Archive');
xx.query();
if (xx.next()) {
  var now = new GlideDateTime();
  if (xx.next_action.getGlideObject().getNumericValue() < now.getNumericValue())
     gs.addInfoMessage(gs.getMessage("Archive currently running. Will have to wait until the next execution"));
  else {
     var diff = gs.dateDiff(gs.nowDateTime(), xx.next_action.getDisplayValue(), false);
     var d = new GlideDuration(diff);
     gs.addInfoMessage(gs.getMessage("The next archive will occur in {0}", d.getDisplayValue()));
  }
} else
  gs.addErrorMessage(gs.getMessage("No scheduled archive job could be found"));
