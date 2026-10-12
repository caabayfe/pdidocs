function retire() {
	var isReplacementRequired = document.querySelector('input[name="is-replacement-required"]:checked').value === 'true';
	
	var ajaxHelper = new GlideAjax('KBAjax');	
	ajaxHelper.addParam('sysparm_type', 'storeReplacementArticleId');
	ajaxHelper.addParam('sysparm_replacement_article_id', isReplacementRequired ? gel('replacement-article').value : null);
	ajaxHelper.addParam('sysparm_base_article_id', '${JS:sysparm_base_article_id}');
	ajaxHelper.getXMLAnswer(destoryDialog.bind('${JS:sysparm_parent_form}'));
	return true;
}

function cancel() {
    GlideDialogWindow.get().destroy();
    return false;
}

function toggleRetireButton() {	
	if ($j('input[type=radio]:checked').val() === 'false' || gel('replacement-article').value.trim() != '') {
		$j('#retire-button').prop('disabled', false);
	} else {
		$j('#retire-button').prop('disabled', true);	
	}
}
