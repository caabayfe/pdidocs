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
var isEmpty = function (str) {
    return (!str || 0 === str.length);
};

var Base64={
	_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
	decode:function(e){
		var t="";
		var n,r,i;
		var s,o,u,a;
		var f=0;
		e=e.replace(/[^A-Za-z0-9+/=]/g,"");
		while(f<e.length){
			s=this._keyStr.indexOf(e.charAt(f++));
			o=this._keyStr.indexOf(e.charAt(f++));
			u=this._keyStr.indexOf(e.charAt(f++));
			a=this._keyStr.indexOf(e.charAt(f++));
			n=s<<2|o>>4;
			r=(o&15)<<4|u>>2;
			i=(u&3)<<6|a;
			t=t+String.fromCharCode(n);
			if(u!=64)
				t=t+String.fromCharCode(r);
			if(a!=64)
				t=t+String.fromCharCode(i);
		}
		return t;
	},
};


g_menu.setHidden(g_item);
var msgSysId;

//This menu is being opened on DB view, so it's sysId
//is concatenation of cmdb_ci SysId
//and sa_discovery_message sysId (platform convention)

if ("__ENC__" == g_sysId.substring(0, "__ENC__".length)) {
    var str = Base64.decode(g_sysId.substring("__ENC__".length, g_sysId.length));
    msgSysId = str.substring(32, 64);
} else
	msgSysId = g_sysId.substring(32, 64);

var gr = new GlideRecord('sa_discovery_message');
gr.get(msgSysId);
var url = gr.getValue('url');
if (!isEmpty(url)) {
	g_menu.setVisible(g_item);	
	g_menu.setEnabled(g_item);	
    g_list.cmdb_log_url = url;
}
