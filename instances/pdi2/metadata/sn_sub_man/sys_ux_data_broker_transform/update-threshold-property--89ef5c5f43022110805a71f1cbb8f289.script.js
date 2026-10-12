/**
 * Data broker to modify sn_sub_man.u_subscription_threshold sys_property to new threshold value
 * @param {object} input - input.threshold -> new threshold value
 */
function transform(input) {
    const gr = new GlideRecord("sys_properties");
    gr.addQuery("name", "sn_sub_man.u_subscription_threshold");
    gr.query();
    const hasNext = gr.next();
    gr.setValue("value", input.threshold);

    if (hasNext) {
        gr.update();
    } else {
        gr.setValue("type", "integer");
        gr.setValue("name", "sn_sub_man.u_subscription_threshold");
        gr.insert();
    }
}
