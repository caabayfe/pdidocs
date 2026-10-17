getTasksWithSameParentM2M();

function getTasksWithSameParentM2M() {
  var parent = current.parent;
  if (parent == '')
      return;

  lookup.addQuery('parent', parent);
}
