function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    var type = g_form.getValue("type");
    g_form.setValue("field", "");
    if (type == "PINGPONG") {
        g_form.showFieldMsg("type", getMessage("Ping pong is a repetitive pattern where a record bounces between two process steps or activities without interruption, indicating a loop."));
    } else if (type == "REWORK") {
        g_form.showFieldMsg("type", getMessage("Rework refers to a repeating step or activity in the process. It happens when a process step needs to be redone or revisited."));
    } else if (type == "EXTRA_STEP") {
        g_form.showFieldMsg("type", getMessage("Compares each route to identify the existence of different routes that deviate in only one step, enabling us to pinpoint specific process steps where unnecessary transitions occur."));
    } else if (type == "PATTERN") {
        g_form.showFieldMsg("type", getMessage("Repeating steps refers to repeating sequential array of steps in the process."));
	} else if (type == "EXTREME_DURATION") {
        g_form.showFieldMsg("type", getMessage("Finds records with a very long transition time compared to other transition records."));
	} else if (type == "EXTREME_NODE_DURATION") {
        g_form.showFieldMsg("type", getMessage("Identifies situations where records are held at a step for a significantly longer duration than usual."));
	} else if (type == "EXTREME_REPETITION") {
        g_form.showFieldMsg("type", getMessage("Finds records with a very high number of arc repetitions compared to other records on the same arc."));
	} else if (type == "PERFORMANCE_OUTLIER") {
        g_form.showFieldMsg("type", getMessage("Identifies situations where there is a cluster of records with similar durations, and this cluster has a higher average duration compared to other group of records. This detector also offers a breakdown of the significance of the identified cluster, providing further insights into the root cause."));
    } else if (type == "EXTREME_NODE_TOUCH_POINT") {
		g_form.showFieldMsg("type", getMessage("Identifies situations where a step requires an unusually large number of record updates compared to the normal range to progress."));
	} else if (type == "NODE_DURATION_OUTLIER") {
		g_form.showFieldMsg("type", getMessage("Identifies situations where a group of records spent longer in a step than the average duration of another group."));
	} else if (type == "NODE_TOUCH_POINT_OUTLIER") {
		g_form.showFieldMsg("type", getMessage("Identifies situations where a group of records in a step has higher touchpoints than the average touchpoints of another group."));
	} else {
        g_form.hideFieldMsg("type");
    }
	
}
