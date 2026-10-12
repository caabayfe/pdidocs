gs.include("PrototypeServer");

var ArchiveTableList = Class.create();

ArchiveTableList.prototype = {

    process: function() {
        var list = new Array();
        var dd = new GlideRecord('sys_dictionary');
        dd.addNullQuery('element');
        dd.addQuery('name', 'IN', this._getArchivedList());
        dd.query();
        while (dd.next()) {
            list.push(dd.name + '');
        }
        return list;
    },

    _getArchivedList: function() {
        var arrayUtil = new ArrayUtil();
        var list = new Array();
        var ar = new GlideRecord('sys_archive');
        ar.addQuery('api_only', false).addOrCondition('api_only', 'NULL');
        ar.query();
        while (ar.next()) {
            var allTables = GlideDBObjectManager.get().getAllExtensions(ar.table);

            for (i = 0; i < allTables.size(); i++) {
                var arTable = 'ar_' + allTables.get(i);

                if (!arrayUtil.contains(list, arTable))
                    list.push(arTable + '');
            }
        }
        return list;
    },

    type: "ArchiveTableList"
};
