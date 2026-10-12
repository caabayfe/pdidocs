var bsmCollapseTable;
var bsmCollapseList;
var bsmExpandList;

function actionOk(btn) {
   // call the dialog's onOK method with the list of selected ids
   var dialog = GlideDialogWindow.prototype.locate(btn);
   return dialog.onOK(bsmExpandList.getValues());
}

function collapseDialogClose(dialog) {
   bsmCollapseTable.clear();
   bsmCollapseList = null;
   bsmExpandList = null;
   bsmCollapseTable = null;
}

function initSelectTable() {
   var okBtn = gel('ok_button');
   var dialog = GlideDialogWindow.prototype.locate(okBtn);
   dialog.on("beforeclose", collapseDialogClose);

   bsmCollapseTable = new GwtSelectTable('tbl');
   bsmCollapseTable.initZones($(tbl));
   bsmCollapseTable.setMultiSelect(true);
   bsmExpandList = bsmCollapseTable.getList('expanded_list');
   bsmExpandList.allowRemove = false;

   bsmCollapseList = bsmCollapseTable.getList('collapsed_list');
   bsmCollapseList.allowRemove = false;

   bsmCollapseTable.setDblClickTarget('collapsed_list', 'expanded_list');
   bsmCollapseTable.setDblClickTarget('expanded_list', 'collapsed_list');

   var xml = getXMLIsland('select_info');
   if (!xml)
      return;

   var vals = xml.getElementsByTagName('select_val');
   for (var i = 0; i < vals.length; i++)
      bsmCollapseList.add(vals[i].getAttribute('name'), vals[i].getAttribute('value'));
}

addLoadEvent(initSelectTable);
