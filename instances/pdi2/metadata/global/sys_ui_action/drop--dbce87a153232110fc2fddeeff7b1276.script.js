/**
 * Client-side onclick function
 */
function clientConfirm() {
	if (confirm("Caution: Dropping this index may result in performance degradation. Are you sure you would like to proceed with dropping the index?"))
		gsftSubmit(null, g_form.getFormElement(), 'sysverb_drop');
}

/**
 * Ensure call to server-side function upon client confirmation.
 */

if (typeof window === 'undefined') {
	serverDropIndex();
}

/**
 * Drops the index from the specified table.
 * Notifies if the index was dropped successfully.
 */
function serverDropIndex() {
	var indexUtils = new GlideIndexUtils();
	if (indexUtils.dropIndexFromUI(current.logical_table_name, current.index_name))
		gs.addInfoMessage(gs.getMessage("Index was successfully dropped."));
	else
		gs.addErrorMessage(gs.getMessage("Index could not be dropped."));

}
