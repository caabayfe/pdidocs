function ok() {
    GlideModal.get().destroy();
    viewProgress();
}

function viewProgress() {
    showLoadingIcon();
    var g_list = GlideList2.get(NOW.incident_add_records.TABLE_NAME);
    var finalQuery = g_list.getFixedQuery();
    if (g_list.getQuery()) {
        finalQuery += '^' + g_list.getQuery();
    }
    var gajax = new window.parent.GlideAjax("BulkAddIncidents");
    gajax.addParam("sysparm_name", "linkTasks");
    gajax.addParam("sysparm_sys_id", NOW.incident_add_records.TASK_ID);
    gajax.addParam("sysparm_table", NOW.incident_add_records.TABLE_NAME);
    gajax.addParam("sysparm_parent_column", NOW.incident_add_records.PARENT_COLUMN);
    gajax.addParam("sysparm_query", finalQuery);
    gajax.getXMLAnswer(closeWindow);
}

function cancel() {
    GlideModal.get().destroy();
}

function enableButtonsFocusOnTab() {
    var modal = document.getElementById('add_all_incident_confirmation');
	// We only need focus on buttons
    var focusableElements = modal.querySelectorAll('button');
    var firstElement = focusableElements[0];
    var lastElement = focusableElements[focusableElements.length - 1];

    modal.addEventListener('keydown', function(event) {
        if (event.key === 'Tab') {
            if (event.shiftKey) { // Shift + Tab
                if (document.activeElement === firstElement) {
                    event.preventDefault();
                    lastElement.focus();
                }
            } else { // Tab
                if (document.activeElement === lastElement) {
                    event.preventDefault();
                    firstElement.focus();
                }
            }
        }
    });
}

function onLoad() {
    enableButtonsFocusOnTab();
}

onLoad();
