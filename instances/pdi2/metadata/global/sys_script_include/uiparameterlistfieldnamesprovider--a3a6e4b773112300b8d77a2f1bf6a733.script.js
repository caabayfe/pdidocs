var UIParameterListFieldNamesProvider = Class.create();
UIParameterListFieldNamesProvider.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    getAllowedFieldNames: function() {
        var tableName = this.getParameter("table_name");
        var listType = this.getParameter("list_type");
        var items = {};
        if (listType == "list")
            items = this._getListValues(tableName);
        else if (listType == "search_list")
            items = this._getSearchListValues(tableName);

        for (name in items) {
            var result = this.newItem("result");
            result.setAttribute("name", name);
            result.setAttribute("label", items[name]);
        }

    },

    _getSearchListValues: function(tableName) {
        return this.getListValuesCommon(tableName, false);
    },

    _getListValues: function(tableName) {
        return this.getListValuesCommon(tableName, true);
    },

    getListValuesCommon: function(tableName, use_choices) {
        var gr = new GlideRecord(tableName);
        if (!gr.canRead()) {
            MobileMessageUtil.addSecurityErrorForTable(tableName);
            return {};
        }

        var ge = gr.getElements();
        this._fields = [];

        for (var i = 0; i < ge.size(); i++) {
            var ed = ge.get(i).getED();
            if (ed.isReference() || (use_choices && ed.isChoiceTable())) {
                this._fields.push({
                    "label": ed.getLabel() + "",
                    "name": ed.getName() + "",
                    "dupe": false,
                    "namelabel": ed.getLabel() + "(" + ed.getName() + ")"
                });
            }
        }

        this._fields.sort(this._compare);

        var items = {};
        for (var i = 0; i < this._fields.length; i++) {
            if (this._fields[i].dupe)
                items[this._fields[i].name] = this._fields[i].namelabel;
            else
                items[this._fields[i].name] = this._fields[i].label;
        }

        return items;
    },

    _compare: function(a, b) {
        if (a.label.equals(b.label)) {
            a.dupe = true;
            b.dupe = true;
        }
        if (a.namelabel < b.namelabel)
            return -1;
        if (a.namelabel > b.namelabel)
            return 1;
        return 0;
    },

    type: 'UIParameterListFieldNamesProvider'
});
