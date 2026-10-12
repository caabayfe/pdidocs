/**
 * This client-side script is used to dynamically change the context menu before it is displayed.
 * It is called before showing the context menu if the Run onShow script flag is checked.
 *
 * The following variables are available to the script:
 *    'g_menu' the context menu that is about to be shown
 *    'g_item' the current context menu item
 *    'g_list' the GlideList2 that the script is running against (only valid for List context menus)
 *    'g_fieldName' the name of the field that the context menu is running against (only valid for List context menus)
 *    'g_fieldLabel' the label of the field that the context menu is running against (only valid for List context menus)
 *    'g_sysId' the sys_id of the row or form that the script is running against
 */

/**
 *
 * Enable/Disable context menu item
 * Enable - if the field is  groupable and one of the supported types Reference/Choice/Date/Boolean 
 */
function enableMenuForSupportedTypes() {
    var hdrCell = g_list.getHeaderCell(g_fieldName);
    if (!hdrCell)
        return;

    //g_menu.setEnabled(g_item);
    /*
       var groupable = (getAttributeValue(hdrCell, "groupable") == "true");
       var typeOfColumn = hdrCell.getAttribute('glide_type');
       var isOtherSupported = typeOfColumn == "string" || typeOfColumn == "integer" || typeOfColumn == "choice" || typeOfColumn == "reference" ;
       var dtTypes = ["glide_date_time","due_date","date","datetime","glide_date"];
       var isDateTypeColumn = dtTypes.indexOf(typeOfColumn) > -1;
       var onInteractiveAnalysis = window.SNC && window.SNC.interactiveAnalysis && window.SNC.interactiveAnalysis.isInteractiveAnalysisActive;
    	//(groupable and OtherSupported) or (groupable or dateColumn)
        if (((groupable && isOtherSupported) || (groupable ||isDateTypeColumn)) && !onInteractiveAnalysis){
            g_menu.setEnabled(g_item);
        } else {
            g_menu.setDisabled(g_item);
        }
    */
}

enableMenuForSupportedTypes();
