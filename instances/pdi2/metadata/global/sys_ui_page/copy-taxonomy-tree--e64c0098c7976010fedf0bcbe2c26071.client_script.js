function invokePromptCallBack(type) {
    var gdw = GlideDialogWindow.get();
    var existingTaxonomyNames = '${existingTaxonomyNames}';
    existingTaxonomyNames = JSON.parse(existingTaxonomyNames);
    var taxonomyName = gel(taxonomy_name).value;
    var result;
    if (type == 'ok') {
        if (taxonomyName == '') {
            $j("#empty_err_message").css("display", "block");
            $j("#duplicate_err_message").css("display", "none");
        } else if (existingTaxonomyNames.includes(taxonomyName.toLowerCase())) {
            $j("#duplicate_err_message").css("display", "block");
            $j("#empty_err_message").css("display", "none");
        } else
            result = gdw.getPreference('onPromptComplete');
    }
    if (type == 'cancel')
        result = gdw.getPreference('onPromptCancel');


    if (typeof(result) == 'function') {
        try {
            result.call(gdw, gdw.getPreference('oldValue'));
        } catch (e) {}
        gdw.destroy();
    }
    return false;
}
