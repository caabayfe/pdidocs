const RequestAppService = (function() {
    return class RequestAppService {
        static type = "RequestAppService";
        static #TABLE_NAME = "sn_creatorstudio_request_app_config";

        static #glideRecordToRequestApp(grRequestApp) {
            const requestApp = {};
            requestApp.sysId = grRequestApp.getValue("sys_id");
            requestApp.createdOn = grRequestApp.getDisplayValue("sys_created_on");
            requestApp.createdBy = grRequestApp.getDisplayValue("sys_created_by");
            requestApp.requestTable = grRequestApp.getValue("request_table");
            requestApp.isDeleting = Boolean(grRequestApp.is_deleting);
            requestApp.requestTableLabel = new GlideRecordSecure(
                requestApp.requestTable
            ).getLabel();
            requestApp.icon = grRequestApp.getValue("icon");
            requestApp.color = grRequestApp.getValue("color");
            const grScope = grRequestApp.sys_scope.getRefRecord();
            if (grScope && grScope.isValidRecord() && grScope.canRead()) {
                requestApp.scopeId = grScope.getValue("sys_id");
                requestApp.name = grScope.getDisplayValue("name");
                requestApp.description = grScope.getDisplayValue("short_description");
                requestApp.logo = grScope.getDisplayValue("logo");
                requestApp.scope = grScope.getDisplayValue("scope");
                requestApp.version = grScope.getDisplayValue("version");
            } else {
                requestApp.scopeId = "";
                requestApp.name = "";
                requestApp.description = "";
                requestApp.logo = "";
                requestApp.version = "";
            }

            const table = grRequestApp.getValue("request_table");
            const requestTableScope = RequestAppService.#getRequestTableScopeId(table);
            requestApp.requestTableInfo = {
                supportsRequestTypeTriggerCondition: global.CreatorStudioRequestAppUtils.hasRequestType(requestApp.requestTable),
                canRead: gs.hasRightsTo(`record/${table}/read`),
                scopeMatchesApp: requestTableScope === requestApp.scopeId,
            };

            return Object.freeze(requestApp);
        }

        static #getRequestTableScopeId(requestTable) {
            const grDbObject = new GlideRecord("sys_db_object");
            if (grDbObject.get("name", requestTable))
                return grDbObject.getValue("sys_scope");
            return "";
        }

        /**
         * Get the Request App specified by the sysId
         *
         * @param sysId - the sysId of the request app
         * @returns a frozen Request App object
         */
        static getById(sysId, includeIsDeleting) {
            const grRequestApp = new GlideRecord(RequestAppService.#TABLE_NAME);
            const found = grRequestApp.get(sysId);

            if (!found || (Boolean(grRequestApp.is_deleting) && !includeIsDeleting)) {
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.NOT_FOUND,
                    gs.getMessage("Record not found! Table: {0}, sys_id: {1}", [
                        RequestAppService.#TABLE_NAME,
                        sysId,
                    ]), {
                        sysId,
                        tableName: RequestAppService.#TABLE_NAME,
                    }
                );
                throw error;
            }

            if (!grRequestApp.canRead()) {
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.UNAUTHORIZED,
                    gs.getMessage("Access not authorized! Table: {0}, sys_id: {1}", [
                        RequestAppService.#TABLE_NAME,
                        sysId,
                    ]), {
                        sysId,
                        tableName: RequestAppService.#TABLE_NAME,
                    }
                );
                throw error;
            }

            const requestApp =
                RequestAppService.#glideRecordToRequestApp(grRequestApp);

            return requestApp;
        }

        /**
         * Get the Request App specified by the scopeId
         *
         * @param scopeId - the sysId of the scope/app
         * @returns a frozen Request App object
         */
        static getByScopeId(scopeId) {
            const grRequestApp = new GlideRecord(RequestAppService.#TABLE_NAME);
            grRequestApp.addQuery("sys_scope", scopeId);
            const qc = grRequestApp.addQuery("is_deleting", false);
            qc.addOrCondition("is_deleting", null);
            grRequestApp.addJoinQuery("sys_app", "sys_scope", "sys_id"); // DEF0509516 - filter out sys_store_app records
            grRequestApp.orderByDesc("sys_created_on");
            grRequestApp.setLimit(1);
            grRequestApp.query();

            if (!grRequestApp.hasNext()) {
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.NOT_FOUND,
                    gs.getMessage("Record not found! Table: {0} for scopeId: {1}", [
                        RequestAppService.#TABLE_NAME,
                        scopeId,
                    ]), {
                        scopeId,
                        tableName: RequestAppService.#TABLE_NAME,
                    }
                );
                throw error;
            }

            if (!grRequestApp.canRead()) {
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.UNAUTHORIZED,
                    gs.getMessage("Access not authorized! Table: {0}, scopeId: {1}", [
                        RequestAppService.#TABLE_NAME,
                        scopeId,
                    ]), {
                        scopeId,
                        tableName: RequestAppService.#TABLE_NAME,
                    }
                );
                throw error;
            }

            grRequestApp.next();
            const requestApp =
                RequestAppService.#glideRecordToRequestApp(grRequestApp);
            return requestApp;
        }

        static getAgentRoleForRequestApp(requestTableName, scopeId) {
            const agentRoles = [];
            const grACLRole = new GlideRecordSecure("sys_security_acl_role");
            const grACLJoin = grACLRole.addJoinQuery(
                "sys_security_acl",
                "sys_security_acl",
                "sys_id"
            );
            grACLJoin.addCondition("name", requestTableName);
            grACLJoin.addCondition("operation", "write");
            grACLJoin.addCondition("type", "record");

            const grRoleJoin = grACLRole.addJoinQuery(
                "sys_user_role",
                "sys_user_role",
                "sys_id"
            );
            grRoleJoin.addCondition("sys_scope", scopeId);

            grACLRole.query();

            while (grACLRole.next()) {
                const agentRole = {};
                agentRole.sysId = grACLRole.getValue("sys_user_role");
                agentRole.label = grACLRole.getDisplayValue("sys_user_role");

                agentRoles.push(agentRole);
            }

            return agentRoles;
        }

        static updateRequestApp(sysId, payload = {}) {
            const grRequestApp = new GlideRecordSecure(RequestAppService.#TABLE_NAME);
            const found = grRequestApp.get(sysId);

            if (!found || Boolean(grRequestApp.is_deleting)) {
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.NOT_FOUND,
                    gs.getMessage("Record not found! Table: {0}, sys_id: {1}", [
                        RequestAppService.#TABLE_NAME,
                        sysId,
                    ]), {
                        sysId,
                        tableName: RequestAppService.#TABLE_NAME,
                    }
                );
                throw error;
            }
            if (!grRequestApp.canWrite()) {
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.UNAUTHORIZED,
                    gs.getMessage("Access not authorized! Table: {0}, sys_id: {1}", [
                        RequestAppService.#TABLE_NAME,
                        sysId,
                    ]), {
                        sysId,
                        tableName: RequestAppService.#TABLE_NAME,
                    }
                );
                throw error;
            }
            const {
                name,
                description,
                icon,
                color,
            } = payload;

            // 02/13/24 At the time of this being written, sys_app record has not been opened up for editing by delegated dev.
            // canDelete() check was used to enforce access.
            const grApp = new GlideRecord("sys_app");
            if (grApp.get(grRequestApp.getValue("sys_scope")) && grApp.canDelete()) {
                if (name !== undefined) grApp.setValue("name", name);
                if (description !== undefined)
                    grApp.setValue("short_description", description);

                grApp.update();
            } else {
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.UNAUTHORIZED,
                    gs.getMessage("Access not authorized! Table: {0}, sys_id: {1}", [
                        "sys_app",
                        grApp.getUniqueValue(),
                    ]), {
                        sysId: grApp.getUniqueValue(),
                        tableName: "sys_app",
                    }
                );
                throw error;
            }
            if (icon !== undefined) grRequestApp.setValue("icon", icon);
            if (color !== undefined) grRequestApp.setValue("color", color);
            grRequestApp.update();

            // Refetch the request app so we get changes made to the sys_app record
            return RequestAppService.getById(grRequestApp.getUniqueValue());
        }

        static prepareForDeletion(sysId) {
            const grRequestApp = new GlideRecordSecure(RequestAppService.#TABLE_NAME);
            const found = grRequestApp.get(sysId);

            if (!found || Boolean(grRequestApp.is_deleting)) {
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.NOT_FOUND,
                    gs.getMessage("Record not found! Table: {0}, sys_id: {1}", [
                        RequestAppService.#TABLE_NAME,
                        sysId,
                    ]), {
                        sysId,
                        tableName: RequestAppService.#TABLE_NAME,
                    }
                );
                throw error;
            }

            const appGr = new GlideRecordSecure("sys_app");
            const scopeId = grRequestApp.getValue("sys_scope");
            if (!appGr.get(scopeId)) {
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.NOT_FOUND,
                    gs.getMessage("Record not found! Table: {0}, sys_id: {1}", [
                        "sys_app",
                        scopeId,
                    ]), {
                        sysId: scopeId,
                        tableName: "sys_app",
                    }
                );
                throw error;
            }

            if (!appGr.canDelete()) {
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.UNAUTHORIZED,
                    gs.getMessage("Access not authorized! Table: {0}, sys_id: {1}", [
                        "sys_app",
                        scopeId,
                    ]), {
                        sysId: scopeId,
                        tableName: "sys_app",
                    }
                );
                throw error;
            }

            grRequestApp.setValue("is_deleting", true);
            grRequestApp.update();

            // find all checked out rps in this scope, set active to false so they will not be seen if deletion fails
            const grRecordProducerGr = new GlideRecord("sc_cat_item_producer");
            grRecordProducerGr.addQuery("sys_scope", scopeId);
            grRecordProducerGr.addQuery("checked_out", true);
            grRecordProducerGr.query();

            const dataProxy = new global.CreatorStudioDataProxy();
            while (grRecordProducerGr.next()) {
                dataProxy.update(grRecordProducerGr, {
                    checked_out: false,
                    active: false
                });
            }

            return RequestAppService.getById(grRequestApp.getUniqueValue(), true);
        }
    };
})();
