function addCatalogItem() {
    var prequest = gel("sys_uniqueValue").value;
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    var gDialog = new dialogClass("dialog_add_item");	
    gDialog.setPreference('prequest', prequest);
    gDialog.setPreference('table', 'add_catalog_item');
    gDialog.setTitle('Add Catalog Item');
    gDialog.render();
}

function validateNewItem() {
    var item = $("item_ref_field");
    var quantity = gel("myquantity");
    var problem = false;
    if (item.value == "") {
        highlightRow("itemrow", true);
        problem = true;
    } else
        highlightRow("itemrow", false);

    if (quantity.value == "") {
        highlightRow("quantityrow", true);
        problem = true;
    } else
        highlightRow("quantityrow", false);

    if (problem)
        return false;

    hideRow("itemrow", true);
    hideRow("quantityrow", true);
    hideRow("dialogbuttons", true);
    hideRow("poll_img", false);
    return true;
}

function highlightRow(rowName, doHighlight) {
    var row = gel(rowName);
    if (!row) {
        return;
    }
    if (doHighlight) {
        flash(row);
    } else
        row.style.backgroundColor = '';
}

function flash(row) {
    var flashColor = "RGB(var(--now-alert--warning--background-color,var(--now-color_alert--warning-0,244,240,191)))";
    var labels = [];
    var temp = row.querySelectorAll('.label_left, .label_right, .label, .control-label');
    for (var i = 0; i < temp.length; i++) {
        labels.push(temp[i]);
    }
    var count = 0;
    var isFlash = false;

    var interval = setInterval(function() {
        isFlash = !isFlash;
        for (var i = 0; i < labels.length; i++) {
            labels[i].style.backgroundColor = isFlash ? flashColor : '';
        }
        count++;
        if (count >= 4) {
            clearInterval(interval);
            for (var i = 0; i < labels.length; i++) {
                labels[i].style.backgroundColor = '';
            }
        }
    }, 500);
}



function hideRow(rowName, doHide) {
    var row = gel(rowName);
    if (doHide)
        row.style.display = "none";
    else
        row.style.display = "block";
}
