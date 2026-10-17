var TargetFieldGlideAjax = Class.create();
TargetFieldGlideAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    getTargetFieldType: function() {
        var name = this.getParameter('sysparm_table_name');
        var element = this.getParameter('sysparm_element');
        var result = {};

        if (!gs.tableExists(name))
            return JSON.stringify(result);

        var gr = new GlideRecordSecure(name);
        if (gr.getElement(element) == null)
            return JSON.stringify(result);

        var ge = gr.getElement(element).getED();

        if (ge == null)
            return JSON.stringify(result);

        var type = ge.getInternalType();
        result.type = type;
        if (type == 'reference')
            result.reference_table = ge.getReference();

        return JSON.stringify(result);
    },

    type: 'TargetFieldGlideAjax'
});
