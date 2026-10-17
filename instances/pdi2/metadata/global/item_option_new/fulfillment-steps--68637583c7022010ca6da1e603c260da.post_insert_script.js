var valueStr = producer.fulfillment_steps;
var value;
var stagesArray;
var stageIds = [];

try {
    value = JSON.parse(valueStr);
    stagesArray = value.data;
} catch (e) {
    value = {};
    stagesArray = [];
    gs.debug(e);
}

// Update order for each stage. For each stage get the step Ids and update the step records with proper stage
for (var i = 0; i < stagesArray.length; i++) {
    var stage = stagesArray[i];
    var stepArray = stage.steps;
    if (!stepArray || stepArray.length == 0)
        continue;

    var stageId = !GlideStringUtil.isEligibleSysID(stage.sysId) ? gs.generateGUID() : stage.sysId;

    var stageGr = new GlideRecord('sc_service_fulfillment_stage');
    stageGr.addQuery('sys_id', stageId);
    stageGr.query();
    if (!stageGr.next()) {
        stageGr.initialize();
        stageGr.setNewGuidValue(stageId);
    }
    stageGr.setValue('name', stage.name || '');
    stageGr.setValue('order', stage.order || 0);
    stageGr.setValue('cat_item', current.getUniqueValue());
    stageGr.insertOrUpdate('sys_id');

    var stepIds = [];
    for (var j = 0; j < stepArray.length; j++)
        if (GlideStringUtil.isEligibleSysID(stepArray[j].sysId))
            stepIds.push(stepArray[j].sysId);

    if (stepIds.length > 0) {
        var stepGr = new GlideRecord('sc_service_fulfillment_step');
        stepGr.addQuery('sys_id', 'IN', stepIds.join());
        stepGr.query();
        stepGr.setValue('service_fulfillment_stage', stageId);
        stepGr.updateMultiple();

        stageIds.push(stageId);
    }
}

// Delete nodes removed on UI
var gr = new GlideRecord('sc_service_fulfillment_stage');
gr.addQuery('sys_id', 'NOT IN', stageIds.join());
gr.addQuery('cat_item', current.getUniqueValue());
gr.deleteMultiple();
