var CMDBWsGetRelTypes = Class.create();
CMDBWsGetRelTypes.prototype = {
    initialize: function() {
        this.output = [];
		this.PARENT_LABEL = gs.getMessage(' (Parent)');
		this.CHILD_LABEL = gs.getMessage(' (Child)');
    },

    getRelTypes: function(className) {

        var pl = this._getPlausible(className);
        var gr = this._getAllRelationships();

        while (gr.next()) {
            var pd = 'parent:' + gr.sys_id;
            var cd = 'child:' + gr.sys_id;

            var pSuggest = pl[pd] && true ? pl[pd].suggested : false;
            var cSuggest = pl[cd] && true ? pl[cd].suggested : false;
            var parentDependentClass = pl[pd] && true ? pl[pd].dependentClass : 'cmdb_ci';
            var childDependentClass = pl[cd] && true ? pl[cd].dependentClass : 'cmdb_ci';

            this._addItem(pd, gr.getDisplayValue('parent_descriptor') + this.PARENT_LABEL, parentDependentClass, pSuggest, true, 'cmdb_rel_ci', gr.getDisplayValue('name'));
            this._addItem(cd, gr.getDisplayValue('child_descriptor') + this.CHILD_LABEL, childDependentClass, cSuggest, false, 'cmdb_rel_ci', gr.getDisplayValue('name'));
        }

        // Add user and group
        this._addUserAndGroup();

        return this.output;
    },

    _getPlausible: function(tableName) {
        var parents = new GlideTableHierarchy(tableName).getTables();

        var plausible = new Object();
        var gr = new GlideRecord('cmdb_rel_type_suggest');
        gr.addQuery('base_class', parents);
        gr.query();
        while (gr.next()) {
            if (new CMDBWsServiceUtil().parseBoolean(gr.parent, 'parent')) {
                var key = 'parent:' + gr.cmdb_rel_type;
                if (!(plausible[key]))
                    plausible[key] = {
                        suggested: true,
                        dependentClass: gr.dependent_class + ''
                    };
                else if (plausible[key].dependentClass.indexOf(gr.dependent_class + '') < 0)
                    plausible[key].dependentClass += (',' + gr.dependent_class);

            }
            if (new CMDBWsServiceUtil().parseBoolean(gr.child, 'child')) {
                var key = 'child:' + gr.cmdb_rel_type;
                if (!(plausible[key]))
                    plausible[key] = {
                        suggested: true,
                        dependentClass: gr.dependent_class + ''
                    };
                else if (plausible[key].dependentClass.indexOf(gr.dependent_class + '') < 0)
                    plausible[key].dependentClass += (',' + gr.dependent_class);
            }
        }

        return plausible;
    },

    _getAllRelationships: function() {
        var gr = new GlideRecord('cmdb_rel_type');
        gr.orderBy('parent_descriptor');
        gr.query();
        return gr;
    },

    _addUserAndGroup: function() {
        var gr = new GlideRecord('cmdb_rel_user_type');
        gr.orderBy('parent_descriptor');
        gr.query();
        while (gr.next())
            this._addItem('parent:sys_user:' + gr.sys_id, gr.getDisplayValue('parent_descriptor') + this.PARENT_LABEL, 'sys_user', false, true, 'cmdb_rel_person', gr.getDisplayValue('name'));

        var gr = new GlideRecord('cmdb_rel_group_type');
        gr.orderBy('parent_descriptor');
        gr.query();
        while (gr.next())
            this._addItem('parent:sys_user_group:' + gr.sys_id, gr.getDisplayValue('parent_descriptor') + this.PARENT_LABEL, 'sys_user_group', false, true, 'cmdb_rel_group', gr.getDisplayValue('name'));

    },

    _addItem: function(value, label, dependentClass, suggested, isParent, type, relName) {
        var item = {};
        item['value'] = value;
        item['label'] = label;
        item['is_parent'] = isParent;
        item['type'] = type;
        item['rel_name'] = relName;
        if (typeof(suggested) != 'undefined')
            item['suggested'] = suggested;
        if (typeof(dependentClass) != 'undefined') {
            item['dependent_class'] = dependentClass;
            if (dependentClass.includes('sys_user') || dependentClass.includes('sys_user_group'))
                item['filter'] = 'active=true';
            else {
                var rejoin = '';
                dependentClass.split(',').forEach(function(value, index) {
                    if (rejoin != '') rejoin += '^OR';
                    rejoin += 'sys_class_nameINSTANCEOF' + value;
                });
                item['filter'] = rejoin;
            }
        }
        this.output.push(item);
    },

    type: 'CMDBWsGetRelTypes'
};
