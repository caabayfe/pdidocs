var win1 = createGlideWindow('window_div', 'id_abcd', false, 'moveable glide window', 'see code below');
win1.moveTo(30, 20);

var win2 = createGlideWindow('window_div2', 'id_efgh', true, 'fixed glide window', 'see code below');
win2.moveTo(30, 20);

var win3 = createGlideWindow('window_div3', 'id_ijkl', true, 'add right icon', 'see code below');
addIcon(win3);
win3.moveTo(30, 20);

var win4 = createGlideWindow('window_div4', 'id_mnop', true, 'add icon with js handler', 'see line below');
addFunctionIcon(win4);
win4.moveTo(30, 20);


function createGlideWindow(div, id, readOnly, title, body) {
   var w = new GlideWindow(id, readOnly);
   w.setPosition('relative'); 
   w.setTitle(title); 
   w.setSize(200, 30);
   w.setBody(body); 
   w.setFontSize(9);
   w.setFontWeight("normal");
   w.setHeaderColor("LightGoldenRodYellow"); 
   w.insert(div);
   return w; 
}

function addIcon(w) {
   var icon = cel('img');
   icon.src = 'images/gwt/document.gifx';
   icon.alt = 'Document';
   w.addDecoration(icon, false); 
}

function addFunctionIcon(w) {
    w.addFunctionDecoration('images/add_circle.gifx', 'Add', function() {alert("icon clicked")}, true); 
}

function showLoadingDialog() {
   var loadingDialog = new GlideDialogWindow("dialog_loading", true);
   loadingDialog.setDialog('loading');
   loadingDialog.render();
   setTimeout(function() {loadingDialog.destroy()}, 1500); 
}

function showGlidePaneForm() {

    var dialog = new GlidePaneForm('new_item', 'sc_cat_item');
    dialog.setTitle("New Item");
    dialog.setSysID(-1);
    dialog.addParm('sysparm_view', 'default');
    dialog.addParm('sysparm_titleless', 'true');
    dialog.addParm('sysparm_form_only', 'true');
    dialog.render();
}
