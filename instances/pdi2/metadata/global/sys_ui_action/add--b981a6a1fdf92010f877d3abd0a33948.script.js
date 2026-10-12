var dialog;

function getCompatibleColumnWidth() {
    if (window.frameElement && window.frameElement.id == 'dialog_frame')
        return (window.frameElement.getWidth() * 0.75);

    // Resize if displayed from a dialog
    return 700; // Default value for content width
}

function nowRefresh(id) {
    GlideList2.get(id).refresh('');
}

function openTopicSelector() {
    var url = new URL(window.location.href);
    var tableName = url.searchParams.get("sysparm_record_target");
    var sys_id = url.searchParams.get("sys_id");
    dialog = new GlideDialogWindow('topic_picker');
    dialog.setTitle(getMessage("Select a Topic"));
    dialog.setSize(getCompatibleColumnWidth(), 250);
    dialog.adjustBodySize();
    dialog.setPreference('topicPickerCallback', topicPickerCallback);
    dialog.hideCloseButton();
    dialog.on('beforeclose', function() {
        setTimeout(function() {
            var elementLookup = $j('div.tabs2_list');
            var listName = "Assigned Topics";
            for (i = 0; i != elementLookup.length; i++) {
                if (elementLookup[i].innerHTML.indexOf(listName) != -1) {
                    var listHTML = elementLookup[i].id;
                    var listID = listHTML.substr(0, listHTML.length - 5);
                    nowRefresh(listID);
                }
            }
        });
    });
    dialog.render();
    var isQuirksMode = (document.compatMode !== 'CSS1Compat');
    if (!isQuirksMode) {
        // In modern browsers only: make the dialog box fixed to avoid it scrolling away while using its scrollable content.
        // Do dialog css adjustment only after whole dialog has been rendered
        dialog.on("bodyrendered", function() {
            var wndw = $j(window);
            var dlgSecPart = $j('.drag_section_part');
            dlgSecPart.css('width', 'auto').css('height', 'auto');
            dlgSecPart.css('position', 'fixed');
            dlgSecPart.css('top', Math.max(0, ((wndw.height() - dlgSecPart.outerHeight()) / 2) + wndw.scrollTop() - 70) + 'px');
            dlgSecPart.css('left', Math.max(0, ((wndw.width() - dlgSecPart.outerWidth()) / 2) + wndw.scrollLeft()) + 'px');

            //Set focus to first element or add icon
            var firstListElm = $j("#body_kb_categories_dialog .colview-container .column .list-item");
            if (firstListElm.length)
                firstListElm.first().focus();
            else {
                $j("#taxonomy").focus();
            }
        });
    }
}

function topicPickerCallback() {
    var ga = new GlideAjax('ContentAuthoringAjax');
    ga.addParam('sysparm_name', 'createContentMapping');
    ga.addParam('sysparm_documentId', g_form.getUniqueValue());
    ga.addParam('sysparm_table', g_list.getParentTable());
    ga.addParam('sysparm_topic', $j('#topicId').val());
    ga.getXML(responseParse);
}

function responseParse(serverResponse) {
    if (serverResponse.status > 199 && serverResponse.status < 300) {
        dialog.destroy(); //Close the dialog window
    }
}
