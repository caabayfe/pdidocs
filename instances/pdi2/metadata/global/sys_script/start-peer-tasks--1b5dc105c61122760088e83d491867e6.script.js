startPeerTasks();

function startPeerTasks() {
    gs.include("DeliveryPlan");
    var parent_id = current["parent"] + '';
    var prec = new GlideRecord('sc_req_item');
    prec.get(parent_id);
    var plan = new DeliveryPlan(prec);
    if (plan.canStartTasks(current))
        plan.startTasks(current);
    synchRequestItem(parent_id, plan);
}

function synchRequestItem(parent_id, plan) {
    var sc_req_item = new GlideRecord('sc_req_item');
    sc_req_item.get(parent_id);
    if (!sc_req_item.isValidRecord())
        return;

    var gr = new GlideRecord('sc_task');
    gr.addQuery('parent', sc_req_item.sys_id);
    gr.addQuery('state', '1').addOrCondition('state', '-5').addOrCondition('state', '2');
    gr.orderBy('order');
    gr.query();

    if (gr.next()) {
        if (gr.state == '-5')
            return;

        // gs.print('plan = ' + plan + ' .plan = ' + plan.plan);
        // gs.print('id = ' + gr.delivery_task);
        var tt = plan.plan.getToken(gr.delivery_task);
        // gs.print('tt = ' + tt);
        // gs.print('tt.name = ' + tt.getName());
        if (tt)
            sc_req_item.stage.setValue(tt.getName());
        else
            sc_req_item.stage = gr.short_description;

        // gs.print('stage = ' + sc_req_item.stage);

        if (sc_req_item.stage.changes())
            sc_req_item.update();
    } else {
        // reset the query.
        gr.initialize();
        gr.addQuery('parent', sc_req_item.sys_id);
        gr.query();
        var stage = 'complete';
        var closed_skipped = 0;
        var closed_incomplete = 0;
        var taskCount = gr.getRowCount();
        while (gr.next()) {
            if (gr.state == 4) {
                closed_incomplete++;
                stage = 'closed_incomplete';
                break;
            } else if (gr.state == 7) {
                closed_skipped++;
            }
        }
        if (closed_skipped == taskCount)
            stage = 'closed_skipped';
        sc_req_item.stage = stage;
        sc_req_item.update();
    }
}
