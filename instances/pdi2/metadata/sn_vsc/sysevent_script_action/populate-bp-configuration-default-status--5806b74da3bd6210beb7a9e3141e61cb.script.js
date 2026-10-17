var grBP = new GlideRecord('sn_vsc_best_practice_configurations');
grBP.addQuery('status', 'NULL');
grBP.query();
while (grBP.next()) {
    grBP.setValue('status', 'open');
    grBP.update();
}
