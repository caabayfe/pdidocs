var GetSpPageDynamicVariables = Class.create();
GetSpPageDynamicVariables.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

    getVariables: function() {
        var pageId = this.getParameter("sysparm_page_sys_id");

        var variables = [];
        var variableGr = new GlideRecord("sp_page_title_variable");
        variableGr.addQuery("sp_page" , "=", pageId);

        variableGr.query();
        while(variableGr.next())
            variables.push(variableGr.getValue("variable"));

        return JSON.stringify(variables);
    },
    type: 'GetSpPageDynamicVariables'
});
