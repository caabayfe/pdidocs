var ga = new GlideAggregate('sys_atf_step');
ga.addActiveQuery();
ga.addQuery('step_config.category', 'bc15fe46e72a3300b5646ea8c2f6a9bf');
ga.query();
var numSteps = 0;
while (ga.next()) {
    if (ga.inputs.list_type == 'related_list' || ga.step_config == '8b84e5e837b1030064a52f3c8e41f170')
        numSteps += 1;
}

answer = numSteps;
