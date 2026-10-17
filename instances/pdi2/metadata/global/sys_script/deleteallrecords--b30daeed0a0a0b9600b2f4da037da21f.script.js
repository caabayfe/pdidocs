function deleteAllRecords(tablename) {
  var i = 0;
  var deleterows = new GlideRecord(tablename);
  deleterows.query();
  while (deleterows.next()) {
    deleterows.deleteRecord();
    i++;
  }
  gs.print('All rows deleted from ' + tablename + ' by ' + gs.getUserID());
  return i + '';
}
