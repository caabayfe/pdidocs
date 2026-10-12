(function executeRule(current, previous /*null when async*/ ) {
    var plan = GlideappDeliveryPlan.get(current.delivery_plan);
    gs.include('CatalogTaskGenerator');
    var gr = new GlideRecord(current.getRecordClassName());
    gr.get(current.getUniqueValue());
    var gen = new CatalogTaskGenerator(plan, gr);
    gen.createTasks();
})(current, previous);
