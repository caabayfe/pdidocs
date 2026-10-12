trickleChangesDownToComponents();

function trickleChangesDownToComponents() {
    var inheritInfoFromParentAsset = false;
    var regeneratePIDforChildren = false;
    if (current.sys_class_name != 'alm_consumable' && current.sys_class_name != 'alm_license' && (current.install_status.changes() || current.substatus.changes() ||
            current.location.changes() || current.stockroom.changes() ||
            current.company.changes() || current.department.changes() ||
            current.assigned_to.changes() || current.managed_by.changes() ||
            current.owned_by.changes() || current.assigned.changes() ||
            current.cost_cc.changes() || current.cost_center.changes() ||
            current.reserved_for.changes() ||
			(current.isValidField('ot_entity') && current.ot_entity.changes()) ||
            (current.isValidField('sn_itam_common_aisle') && current.sn_itam_common_aisle.changes()) ||
            (current.isValidField('sn_itam_common_space') && current.sn_itam_common_space.changes()) ||
            (current.isValidField('aisle_space_location') && current.aisle_space_location.changes()))) {
        inheritInfoFromParentAsset = true;
    }
    if (gs.getProperty(AssetProductInstanceUtil.ENABLE_PID_RECALCULATION_FOR_CHILD_ASSET) === 'true') {
        regeneratePIDforChildren = true;
    }

    if (inheritInfoFromParentAsset || regeneratePIDforChildren) {
        // Retrieve components 
        var component = new GlideRecord('alm_asset');
        component.addQuery('parent', current.sys_id.toString());
        component.query();
        var showErrorMessage = true;
        while (component.next()) {
            var hasError = false;
            if (inheritInfoFromParentAsset) {
                // Trickle those fields changes down
                (new AssetandCI()).inheritInfoFromParentAsset(component, current);
            }
            if (regeneratePIDforChildren && ProductInstanceUtil.isProductInstance(component.model_category)) {
                try {
                    AssetProductInstanceUtil.calculatePIDForAsset(component, true);
                } catch (e) {
                    if (showErrorMessage) {
                        showErrorMessage = false;
                        gs.addErrorMessage(e.message);
                    }
                    hasError = true;
                }
            }
            if (!hasError) {
                component.update();
            }

        }
    }
}
