(function executeRule(current, previous /*null when async*/ ) {
	if (current.getUniqueValue() === "30325d5e5bc5111025319a011581c760") { // Block deletion of the default namespace
        gs.addErrorMessage(sn_i18n.Message.getMessage(
            "HERMES",
            "Cannot delete the Hermes Default Namespace."
        ));
        current.setAbortAction(true);
        return;
    }

    // For non-default namespaces: block delete if there are active topics
    var gr = new GlideRecord("sys_kafka_topic");
    gr.addQuery("namespace", current.getUniqueValue());
    gr.addActiveQuery();
    gr.query();
    if (gr.hasNext()) {
        gs.addErrorMessage(sn_i18n.Message.getMessage(
            "HERMES",
            "Deletion of namespace '{namespace}' was blocked as there are one or more active topics belonging to this namespace",
            {namespace: current.getDisplayValue()}
        ));
        current.setAbortAction(true);
    }
})(current, previous);
