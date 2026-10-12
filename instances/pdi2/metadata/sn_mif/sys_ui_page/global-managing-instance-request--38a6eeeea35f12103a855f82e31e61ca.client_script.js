//Called when the 'Send Requests' button gets clicked
async function continueSend() {
    var select = document.getElementById('instance_select');
    var selected = [];
    var options = select.options;
    for (var i = 0; i < options.length; i++) {
        var opt = options[i];
        if (opt.selected) {
            selected.push(opt.value || opt.text);
        }
    }
    if (selected.length == 0) {
        alert(getMessage('Please select instances to which to send requests.'));
        return false;
    }
    const ajax = new GlideAjax('MIFManagerUtil');
    ajax.addParam('sysparm_name', 'sendGlobalManagerRequestByName');
    ajax.addParam('sysparm_instance_names', selected);
    ajax.getXMLAnswer();
    destroyModal();
    return true();
}

//Called when the 'Cancel' button gets clicked
function destroyModal() {
    // Close the dialog window
    GlideDialogWindow.get().destroy();
    return false;
}

// Called when the form loads
addLoadEvent(loadFunction());

function loadFunction() {
    const ajax = new GlideAjax('MIFManagerUtil');
    ajax.addParam('sysparm_name', 'getInstanceNamesEligibleToBeManaged');
    ajax.getXMLAnswer(updateSelectList);
    return false;
}

// Update the table container to show the record list.
function updateSelectList(answer) {
    var instanceNames = answer.split(',');
    var size = instanceNames.length;
    var multiSelectHtml = "No eligible instances found.";
    if (size > 0) {
        var selectSize = size;
        if (selectSize > 20)
            selectSize = 20;
        multiSelectHtml = '<select id="instance_select" multiple name=instance_names size=' + selectSize + '>\n';
        for (var i = 0; i < size; i++) {
            multiSelectHtml = multiSelectHtml.concat('<option value="' + instanceNames[i] + '">' + instanceNames[i] + '</option>\n');
        }
        multiSelectHtml = multiSelectHtml.concat('</select>')
    }
    var tableContainer = document.getElementById('tableContainer');
    tableContainer.innerHTML = multiSelectHtml;
}
