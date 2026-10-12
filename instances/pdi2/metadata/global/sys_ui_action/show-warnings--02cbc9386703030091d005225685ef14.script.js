function showWarnings() {
	// get the step result's step id
	var stepResultSysId = (typeof rowSysId == 'undefined')? g_form.getUniqueValue() : rowSysId;
	var stepResultGR = new GlideRecord("sys_atf_test_result_item");
	var stepSysId, status;
	if (!stepResultGR.get(stepResultSysId))
		g_form.addErrorMessage(new GwtMessage().getMessage("This step result could not be found"));
	else {
		stepSysId = stepResultGR.getValue("step");
		status = stepResultGR.getValue("status");
	}

	// get the index of the Warnings related list tab
	var warningsTabName = "sys_atf_test_result.REL:e3fa14276732030091d005225685efd9";
	var warningsTabIndex = g_tabs2List.findTabIndexByName(warningsTabName);
	if (status === 'success_with_warnings') {
		if (warningsTabIndex != -1) {
			g_tabs2List.setActive(warningsTabIndex);
			// support list v2 and list v3
			var listObj = (typeof GlideList !== 'undefined') ? GlideList : GlideList2;
			listObj.get(warningsTabName).setFilterAndRefresh('step=' + stepSysId);

			// set focus on the Warnings related list
			var warningsList;
			if (window.g_tabs_preference) {
				warningsList = $j("[aria-controls='sys_atf_test_result.REL:e3fa14276732030091d005225685efd9_list']");
				if (warningsList)
					warningList.focus();
			} else {
				warningsList = $j("[data-original-title='Warnings Context Menu']");
				if (warningsList)
					warningsList.attr('tabindex', 0).focus();
			}
		}
		else
			g_form.addWarningMessage(new GwtMessage().getMessage("Warnings related list is not present on the form"));
	} else
		g_form.addInfoMessage(new GwtMessage().getMessage("This step result does not have any warnings"));
}
