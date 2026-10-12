var location = current.request.requested_for.location.getDisplayValue();

// if we're in Atlanta
if (location == 'Atlanta') {
    // use the remote pc delivery plan instead of the normal one
    var remote_plan = new GlideRecord('sc_cat_item_delivery_plan');
    remote_plan.addQuery('name', 'Remote PC Delivery Plan');
    remote_plan.query();
    remote_plan.next();
    current.delivery_plan = remote_plan.sys_id;
}
