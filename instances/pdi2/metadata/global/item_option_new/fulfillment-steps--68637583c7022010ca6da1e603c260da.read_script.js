//List of Guids generated to create new stages.
var stagePoolArray = [];
for (var j = 0; j < 10; j++)
    stagePoolArray.push(gs.generateGUID());

var stagesGr = new GlideRecord('sc_service_fulfillment_stage');
stagesGr.addQuery('cat_item', current.sys_id);
stagesGr.orderBy('order');
stagesGr.query();

var stagesObj = {};
var stageIds = [];
var fieldIsInvalid = false;
while (stagesGr.next()) {
    var stage = {
        sysId: stagesGr.getUniqueValue(),
        name: stagesGr.getValue('name'),
        order: stagesGr.getValue('order')
    };
    stagesObj[stage.sysId] = stage;
    stageIds.push(stage.sysId);
}

if (stageIds.length > 0) {
    var stepsGr = new GlideRecord('sc_service_fulfillment_step');
    stepsGr.addQuery('service_fulfillment_stage', 'IN', stageIds.join());
    stepsGr.query();

    while (stepsGr.next()) {
        var step = {
            sysId: stepsGr.getUniqueValue(),
            label: stepsGr.getDisplayValue('title') || '',
            action: stepsGr.getValue('service_fulfillment_step_configuration'),
            stage: stepsGr.getValue('service_fulfillment_stage')
        };
		
		if (!step.action)
			fieldIsInvalid = true;

        if (!stagesObj[step.stage].steps)
            stagesObj[step.stage].steps = [];

        stagesObj[step.stage].steps.push(step);
    }
}

var orderedStageObjs = [];
for (var i = 0; i < stageIds.length; i++) {
    if (!stagesObj.hasOwnProperty(stageIds[i]))
        continue;

    var stageObj = stagesObj[stageIds[i]];
    if (!Array.isArray(stageObj.steps) || stageObj.steps.length == 0)
        continue;

    orderedStageObjs.push(stageObj);
}

var output = {
    data: orderedStageObjs,
    stagePool: stagePoolArray,
	isFieldInvalid: fieldIsInvalid
};

answer = JSON.stringify(output);
