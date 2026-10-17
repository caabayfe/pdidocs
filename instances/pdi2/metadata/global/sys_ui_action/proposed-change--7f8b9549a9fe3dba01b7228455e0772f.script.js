function openFormDialog(){
	var openProposedChange = function(answer) {
		var proposedChgOverlay = new GlideModal('ci_popup', false, 'modal-lg');
		proposedChgOverlay.setAutoFullHeight(true);
		proposedChgOverlay.setTitle(getMessage("Proposed change"));
		proposedChgOverlay.on('closeconfirm', function () {
			var listId = g_form.getTableName() + ".task_ci.task";
			var list = typeof GlideList2 !== "undefined" ? GlideList2.getByName(listId) : null;

			if (list == null)
				list = typeof GlideList !== "undefined" ? GlideList.get(listId) : null;

			if (list != null)
				list.refresh();
		});

		proposedChgOverlay.renderIframe(answer);
	};

	var gaJax = new GlideAjax("ChangeCIAjaxProcessor");
	gaJax.addParam("sysparm_name","getProposedChangeCIPopupURL");
	gaJax.addParam("sysparm_task_ci", rowSysId);
	gaJax.getXMLAnswer(openProposedChange);

	GlideUXMetrics && GlideUXMetrics.track('Propose single change');
}
