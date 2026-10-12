(function transform(transformBuilder, transformScriptArgs) {

    try {
        if (!transformBuilder) return;

        var listModel = transformBuilder;

        var AUDIT_COLUMN_KEY = 'AuditS';
        var ATTRIBUTE_AUDIT_TYPE = '';

        var sys_id = transformScriptArgs;

        if (!sys_id) {
            return;
        }

        var tableName = '';
        var gr = new GlideRecord('sys_dictionary');
        gr.addQuery('sys_id', sys_id);
        gr.query();

        if (gr.next()) {
            tableName = gr.getValue('name');

            var auditEnabled = gr.getValue('audit') === '1';

            var auditType = GlideTableDescriptor.get(tableName).getED().getAttribute("audit_type");

            if (auditType === null) {
                auditType = "blacklist";
            }

            auditType = JSON.stringify(auditType);
            ATTRIBUTE_AUDIT_TYPE = auditType;
            ATTRIBUTE_AUDIT_TYPE = ATTRIBUTE_AUDIT_TYPE.replace(/^"|"$/g, '');
        }

        listModel.columnDefinitions.columns.push({
            key: AUDIT_COLUMN_KEY,
            label: 'Audit Status',
            type: 'string',
            metadata: {
                isFilterable: false,
                isGroupable: false,
                isSortable: true,
                internalType: 'string'
            }
        });

        if (auditEnabled) {
            listModel.rowDefinitions.rows.forEach(function(row) {
                if (!row.cells) {
                    return;
                }

                var element = row.cells.element ? row.cells.element.value : null;
                if (!element) {
                    return;
                }

                try {
                    var hasAudit = GlideTableDescriptor.get(tableName).getElementDescriptor(element).hasAttribute("audit");
                    var hasNoAudit = GlideTableDescriptor.get(tableName).getElementDescriptor(element).hasAttribute("no_audit");

                    var isAuditEnabled = false;

                    if (ATTRIBUTE_AUDIT_TYPE === "whitelist" && hasAudit) {
                        isAuditEnabled = true;
                    } else if (ATTRIBUTE_AUDIT_TYPE === "blacklist" && hasNoAudit) {
                        isAuditEnabled = false;
                    } else {
                        if (ATTRIBUTE_AUDIT_TYPE === "whitelist") {
                            isAuditEnabled = false;
                        } else if (ATTRIBUTE_AUDIT_TYPE === "blacklist") {
                            isAuditEnabled = true;
                        }
                    }

                    row.cells[AUDIT_COLUMN_KEY] = {
                        value: isAuditEnabled ? 'Enabled' : 'Disabled',
                        label: isAuditEnabled ? 'Enabled' : 'Disabled',
                        metadata: {
                            internalValue: isAuditEnabled ? 'Enabled' : 'Disabled',
                            internalType: 'string'
                        }
                    };

                } catch (e) {
                    return;
                }
            });
        } else {
            listModel.rowDefinitions.rows.forEach(function(row) {
                row.cells[AUDIT_COLUMN_KEY] = {
                    value: 'Disabled',
                    label: 'Disabled',
                    metadata: {
                        internalValue: 'Disabled',
                        internalType: 'string'
                    }
                };
            });
        }

        return listModel;

    } catch (error) {
        return {
            failed: true,
            error: error.message
        };
    }
})(transformBuilder, transformScriptArgs);
