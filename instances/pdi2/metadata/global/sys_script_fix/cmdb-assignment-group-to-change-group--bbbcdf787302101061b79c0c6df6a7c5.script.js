var gr = new GlideRecord('sys_dictionary');
gr.addEncodedQuery('column_label=Assignment Group^name=cmdb^element=assignment_group');
gr.query();
if(gr.getRowCount() == 1 && gr.next()) {
  gr.setValue('column_label','Change Group');
  gs.info("For 'Base Configuration Item'(cmdb) table, updating label of 'Assignment Group' to 'Change Group'");
  gr.update();
}
