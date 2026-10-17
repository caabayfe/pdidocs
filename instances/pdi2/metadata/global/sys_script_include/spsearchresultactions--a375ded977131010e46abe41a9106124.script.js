var SPSearchResultActions = Class.create();
SPSearchResultActions.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    isPublic: function() {
        return true;
    },
    getPayloadFieldDefTable: function() {
        var actionId = this.getParameter('sysparm_actionId');
        var result = this.newItem('result');
        result.setAttribute('payloadFieldTable', '');
        var gr = new GlideRecord('sys_declarative_action_assignment');
        gr.addQuery('sys_id', actionId);
        gr.query();
        if (gr.next())
            result.setAttribute('payloadFieldTable', gr.client_action.payload_field_table);
    },

    getSuggestionResultAction: function() {
        var tableName = this.getParameter('sysparam_tableName');
        var sysId = this.getParameter('sysparam_sysId') || null;
        var portalId = this.getParameter('sysparam_portalId');

        var answer = this.newItem('answer');
        var actionId = '';

        var className = this._getClassName(tableName, sysId);
        if (className != null) {

            //Retrieve the declarative action from record's EVAM config
            var m2mGr = new GlideRecord('sys_ux_predicate_m2m_action_assignment');
            m2mGr.addQuery('predicate.active', true);
            m2mGr.addQuery('predicate.table', 'IN', this._checkIfClassNameExistsInViewConfig(className, tableName));
            m2mGr.addQuery('predicate.predicate_bundle', 'IN', this._getEVAMBundle(portalId));
            m2mGr.addActiveQuery();
            m2mGr.orderBy('predicate.order');
            m2mGr.query();

            while (m2mGr.next()) {
                var conditionPasses = this._checkPredicateCondition(m2mGr.getValue("predicate"), className, sysId);
                if (conditionPasses) {
                    actionId = m2mGr.getValue("declarative_action_assignment");
                    break;
                } else if (!conditionPasses && m2mGr.getValue('predicate.table') == tableName) {
                    actionId = m2mGr.getValue("declarative_action_assignment");
                }
            }
        }
        answer.setAttribute('actionId', actionId);

        //Retrieve any external url used by the action
        var urlGR = new GlideRecord(tableName);
        if (urlGR.get(sysId))
            answer.setAttribute('actionUrl', urlGR.getElement(this._getPayloadUrl(actionId)));

        return answer;
    },

    _getClassName: function(table, sysId) {
        var sGr = new GlideRecord(table);
        if (sysId != null && sGr.get(sysId) && sGr.getValue('sys_class_name') != null)
            return sGr.getValue('sys_class_name');

        return table;
    },

    _checkIfClassNameExistsInViewConfig: function(className, tableName) {
        var answerarr = [];
        var sGr = new GlideRecord('sys_ux_composite_data_template_predicate');
        sGr.addQuery('table', className);
        sGr.query();
        if (sGr.next()) {
            answerarr.push(className);
        }
        answerarr.push(tableName);
        return answerarr;
    },

    _checkPredicateCondition: function(predicateId, tableName, sysId) {

        if (sysId != null && new TableUtils(tableName).getAbsoluteBase() != 'v_ais_external_content') {
            var gr = new GlideRecord(tableName);
            gr.addQuery("sys_id", sysId);
            var predicateGr = new GlideRecord("sys_ux_composite_data_template_predicate");
            predicateGr.get(predicateId);

            var condition = predicateGr.getValue("condition");
            if (condition != null)
                gr.addQuery(condition);

            gr.query();
            return gr.hasNext();
        }
        return true;
    },

    //Returns EVAM view config bundle for the portal
    _getEVAMBundle: function(id) {
        var arr = [];
        var portalGr = new GlideRecord('sp_portal');
        if (portalGr.get(id)) {
            var m2mGr = new GlideRecord('sys_ux_composite_data_m2m_predicate_bundle');
            m2mGr.addQuery('dataset', portalGr.search_results_configuration);
            m2mGr.query();

            while (m2mGr.next()) {
                arr.push("" + m2mGr.predicate_bundle);
            }
        }
        return arr;
    },

    //Fetch url field if present in the action payload
    _getPayloadUrl: function(actionId) {
        var sGr = new GlideRecord('sys_declarative_action_assignment');
        if (actionId && sGr.get(actionId)) {
            var data = JSON.parse(sGr.client_action.payload_template.toString());
            if (data.url) {
                var field = data.url.replace(/^{{(.*)}}$/, '$1').replace("columns.", '');
                if (field != 'navigation_url')
                    return field.toString();
            }
        }
        return null;
    },

    type: 'SPSearchResultActions'
});
