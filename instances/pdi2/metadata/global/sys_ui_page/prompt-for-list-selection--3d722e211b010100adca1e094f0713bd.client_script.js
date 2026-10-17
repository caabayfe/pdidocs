gel('dialog_choice_list').focus();
$$('select[id="dialog_choice_list"]>option').each(function(e) {
   $(e).observe('dblclick', function() {
		$('ok_button').click();
   });
});
if ($$('select[id="dialog_choice_list"]>option').length > 6)
    gel('dialog_choice_list').setAttribute('size', '15');


function validateAndSubmit() {
    var list = gel('dialog_choice_list');
    if (list.selectedIndex == -1) {
        gel('prompt_for_input_error').innerHTML = 'Nothing selected';
        return false;
    }

    var choiceValue = list.childElements()[list.selectedIndex].value;
    var choiceText  = list.childElements()[list.selectedIndex].text;
    return invokeCallBack( GlideDialogWindow.get(), choiceValue, choiceText );
}

function invokeCallBack(gdw, choiceValue, choiceText) {
    var cbf = gdw.getPreference('onPromptComplete');
    if (typeof(cbf) != 'function') 
        return false;

    try {
        var ret = cbf.call(gdw, choiceValue, choiceText);
        gdw.destroy();
        return ret;
    } catch (e) {
        gdw.destroy();
   }
}
