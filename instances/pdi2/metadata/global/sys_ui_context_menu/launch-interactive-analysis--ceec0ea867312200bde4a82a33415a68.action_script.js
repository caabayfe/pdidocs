/**
 * Script executed on the Client for this menu action
 *
 * The following variables are available to the script:
 *    'g_list' the GlideList2 that the script is running against (only valid for List context menus)
 *    'g_fieldName' the name of the field that the context menu is running against (only valid for List context menus)
 *    'g_fieldLabel' the label of the field that the context menu is running against (only valid for List context menus)
 *    'g_sysId' the sys_id of the row or form that the script is running against
 *    'rowSysId' is also set to the sys_id of the row to support legacy actions, but g_sysId is preferred
 */

runContextAction();

function runContextAction() {
   var url = new GlideURL('$interactive_analysis.do');
   url.addParam('sysparm_field', g_fieldName);
   url.addParam('sysparm_table', g_list.getTableName());
   url.addParam('sysparm_from_list', 'true');
   url.addParam('sysparm_query', g_list.getQuery({orderby: true, fixed: true}));
   url.addParam('sysparm_list_view', g_list.getView());
   var frames = null;
   if (window !== null)   {
		frames = window.top.document.getElementsByTagName("iframe");
   }
   var frameToLoad = null;

   if (typeof frames !== "undefined" && window !== null && frames.length > 0) {
        for(var i=0;i<frames.length;i++){
            if(frames[i].name === "gsft_main"){
                frameToLoad = frames[i];
            }
        }
        //GSFT Main
        if(frameToLoad !== null){
            frameToLoad.contentWindow.location = url.getURL();
        }else{
            frames[0].contentWindow.parent.location = url.getURL();
        }

   } else {
		g_navigation.open(url.getURL());
   }
}
 
