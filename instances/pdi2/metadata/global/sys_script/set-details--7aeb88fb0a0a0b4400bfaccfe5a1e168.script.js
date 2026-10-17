setDetails();

function setDetails() {
  var s = current.relationship + '';
  var sa = s.split(':');
  current.parent =  (sa[0] == 'parent');
  current.child = (sa[0] == 'child');
  current.cmdb_rel_type = sa[1];
}
