function include({imports}, api, event, helpers) {

    class SOWListContextActionHandlerSNC {
        static SUPPORTED_ACTIONS = {
            "COMMON_ACTIONS": ["copy_sysId"],
            "ITSM_ACTIONS": ["copy_url", "reassign", "assign_to_me"],
            "INCIDENT_ACTIONS": ["reassign_incident", "assign_to_me_incident"]
        };

        static ACTIONS_REQUIRED_ACCESS = ["reassign_incident", "reassign"];

        static invokeContextActionHandler(recordSysId, actionId) {
            var actionType = this._resolveActionType(actionId);
            switch (actionType) {
                case 'ITSM_ACTIONS':
                    var SOWListContextActionHandlerITSM = imports['sn_sow_itsm_common.SOWListContextActionHandlerITSM'](api, event, helpers);
                    SOWListContextActionHandlerITSM.handleContextAction(recordSysId, actionId);
                    break;
                case 'COMMON_ACTIONS':
                    var SOWListContextActionHandlerCommon = imports['sn_sow.SOWListContextActionHandlerCommon'](api, event, helpers);
                    SOWListContextActionHandlerCommon.handleContextAction(recordSysId, actionId);
                    break;
                case 'INCIDENT_ACTIONS':
                    var SOWListContextActionHandlerIncident = imports['sn_sow_inc.SOWListContextActionHandlerIncident'](api, event, helpers);
                    SOWListContextActionHandlerIncident.handleContextAction(recordSysId, actionId);
                    break;
            }
        }

        static getRecordSysId(str) {
            let parts = str.split("@");
            return parts[parts.length - 1];
        }

        static _resolveActionType(actionId) {
            for (let actionType in this.SUPPORTED_ACTIONS) {
                if (this.SUPPORTED_ACTIONS.hasOwnProperty(actionType) && this.SUPPORTED_ACTIONS[actionType].indexOf(actionId) != -1)
                    return actionType;
            }
            return "";
        }

        static checkIfActionRequireAccess(actionId) {
            return this.ACTIONS_REQUIRED_ACCESS.indexOf(actionId) != -1;
        }

    }
    return SOWListContextActionHandlerSNC;
}
