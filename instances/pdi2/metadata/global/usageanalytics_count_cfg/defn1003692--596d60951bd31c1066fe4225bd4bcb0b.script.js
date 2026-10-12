var ga = new GlideAggregate('sys_atf_step');
ga.addActiveQuery();
ga.addQuery('step_config.category', '3c5c4dc20b202200a8d7a12cf6673a95');
ga.query();
var numSteps = 0;
while (ga.next()) {
    if (!ga.inputs.form_ui || ga.inputs.form_ui == 'standard_ui')
        numSteps += 1;
}

answer = numSteps;
