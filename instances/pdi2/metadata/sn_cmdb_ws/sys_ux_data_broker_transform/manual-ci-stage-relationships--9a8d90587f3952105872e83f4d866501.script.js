function transform(input) {
    let {
        classInfo,
        currentRels,
        listProps,
        relTypeObj
    } = input.payload;
    const {
        isParent,
        relTypeSysId,
        relName,
        relTable
    } = relTypeObj;
    const {
        selectionProps: {
            allRowsSelected,
            exceptedRowIds,
            selectedRowIds
        },
        table,
        query
    } = listProps;
    const {
        dependencies,
        sysClassName
    } = classInfo;
    let baseObj = {
        isParent,
        type: relTable,
        relType: {
            value: relTypeSysId,
            displayValue: relName
        }
    };
    let stagedRels = [];
    let gr = new GlideRecord(table);
    gr.addEncodedQuery(query, true);
    gr.orderBy('name');
    if (allRowsSelected) {
        gr.addQuery('sys_id', 'NOT IN', exceptedRowIds);
    } else {
        gr.addQuery('sys_id', 'IN', selectedRowIds);
    }
    gr.query();
    while (gr.next()) {
        stagedRels.push({
            ...baseObj,
            [isParent ? 'parent' : 'child']: {
                value: 'new_ci',
                displayValue: sn_i18n.Message.getMessage('sn_cmdb_ws', 'New CI'),
                className: sysClassName
            },
            [isParent ? 'child' : 'parent']: {
                value: gr.getUniqueValue(),
                displayValue: gr.getDisplayValue(),
                className: gr.getValue('sys_class_name')
            }
        });
    }
    let notificationItems = [];
    let validRels = [...stagedRels];
    if (dependencies && dependencies.length) {
        // Verify none of the staged rels match criteria of dependent relationship
        validRels = stagedRels.filter((rel) => {
            const newCiIsParent = rel.isParent;
            return !dependencies.some((dep) => {
                return dep.is_reverse == !newCiIsParent &&
                    dep.relTypeSysId == rel.relType.value &&
                    dep.id == rel[newCiIsParent ? 'child' : 'parent'].className;
            });
        });
        if (validRels.length < stagedRels.length) {
            notificationItems.push({
                type: 'error',
                message: sn_i18n.Message.getMessage('sn_cmdb_ws', 'Skipped adding {0} relationship(s). Dependent relationship has already been selected.', {
                    0: String(stagedRels.length - validRels.length)
                })
            });
        }
    }
    let allRels = currentRels.concat(validRels);
    let keys = {};
    let uniqueRels = allRels.filter((rel) => {
        const key = ['parent', 'relType', 'child'].map(k => rel[k].value).join('|');
        if (!keys[key]) {
            rel.key = key;
            keys[key] = true;
            return true;
        }
    });
    if (uniqueRels.length < allRels.length) {
        notificationItems.push({
            type: 'error',
            message: sn_i18n.Message.getMessage('sn_cmdb_ws', 'Skipped adding {0} duplicate relationship(s).', {
                0: String(allRels.length - uniqueRels.length)
            })
        });
    }
    if (uniqueRels.length > currentRels.length) {
        notificationItems.push({
            type: 'success',
            message: sn_i18n.Message.getMessage('sn_cmdb_ws', 'Successfully added {0} relationship(s).', {
                0: String(uniqueRels.length - currentRels.length)
            })
        });
    }
    return {
        relationships: uniqueRels,
        notificationItems
    };
}
