var ClassifyDialog = Class.create({
    classify: function() {
        var dictIdList = "$[sysIds]";
        var dataClass = gel('select_0data_classification');
        var data = Object.toJSON({
            "dictionary_entries": dictIdList,
            "data_classes": this.concatOptions(dataClass)
        });

        new Ajax.Request('/api/now/data_classification/classify', {
            asynchronous: false,
            requestHeaders: {
                "X-UserToken": window.g_ck
            },
            contentType: 'application/json;charset=UTF-8',
            parameters: data,
            onSuccess: function(response) {
                retStatus = true;
                GlideDialogWindow.get().destroy();
                location.reload();
            },
            onFailure: function() {
                retStatus = false;
                GlideDialogWindow.get().destroy();
                location.reload();
            }
        });

        return true;
    },

    concatOptions: function(sel) { //concat values of options in select, delimit by ,
        var ret = '';
        for (var i = 0; i != sel.options.length; ++i) {
            var option = sel.options.item(i);
            if (i != 0) {
                ret += ',';
            }
            ret += option.value;
        }
        return ret;
    }
});

var gClassifyDialog = new ClassifyDialog();
$('add_dc_dialog_container').observe('click',
    function(event) {
        var elem = event.element();
        switch (elem.id) {
            case 'ok_button':
                gClassifyDialog.classify();
                break;
            case 'cancel_button':
                GlideDialogWindow.get().destroy();
        }
    });

$('add_dc_dialog_container').observe('keyup',
    function(event) {
        var elem = event.element();
        switch (event.keyCode) {
            case 13: // enter
                $('ok_button').click();
                break;
        }
    }
);

var selectList = gel('sys_display.data_classification');
if (selectList === null) {
    $('ok_button').disabled = 'disabled';
    $('ok_button').hide();
} else {
    $('ok_button').focus();
}
