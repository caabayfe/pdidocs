const RequestNewRequestAppService = (function() {
    return class RequestNewRequestAppService {
        static type = "RequestNewRequestAppService";
        static #TABLE_NAME = "sn_creatorstudio_new_application_task";

        static create(payload) {
            const {
                name,
                description,
                additionalComments,
                url
            } = payload;
            const pipelineConfigChecks = new sn_pipeline.PipelineConfigChecks();
            const currentInstanceInfo = pipelineConfigChecks.getCurrentInstanceInfo();
            if (currentInstanceInfo.isController) {
                const requestAppRequestGR = new GlideRecordSecure(
                    RequestNewRequestAppService.#TABLE_NAME
                );
                if (!requestAppRequestGR.canCreate()) {
                    throw ErrorService.createError(
                        ErrorService.ERROR_TYPES.UNAUTHORIZED,
                        gs.getMessage(
                            "Insufficient permissions to create a record in {0} table",
                            [RequestNewRequestAppService.#TABLE_NAME]
                        ), {
                            tableName: RequestNewRequestAppService.#TABLE_NAME,
                        }
                    );
                }

                try {
                    requestAppRequestGR.initialize();
                    requestAppRequestGR.setValue("short_description", name);
                    requestAppRequestGR.setValue("description", description);
                    requestAppRequestGR.setValue("studio_url", url);
                    requestAppRequestGR.setValue(
                        "originating_instance_id",
                        currentInstanceInfo.instanceId
                    );
                    requestAppRequestGR.setValue("requestor", gs.getUserID());
                    requestAppRequestGR.setValue("app_type", "request_app");

                    if (additionalComments) {
                        const requestNewRequestAppGlobal =
                            new global.RequestNewRequestAppGlobal();
                        requestNewRequestAppGlobal.setJournalEntry(
                            requestAppRequestGR,
                            additionalComments
                        );
                    }

                    const sysId = requestAppRequestGR.insert();
                    const newlyCreatedGR = new GlideRecordSecure(
                        RequestNewRequestAppService.#TABLE_NAME
                    );

                    if (newlyCreatedGR.get(sysId)) {
                        return {
                            sysId,
                        };
                    } else {
                        throw gs.getMessage(
                            "{0} table does not include record with sysId: {1}",
                            [RequestNewRequestAppService.#TABLE_NAME, sysId]
                        );
                    }
                } catch (e) {
                    throw ErrorService.createError(
                        ErrorService.ERROR_TYPES.RECORD_CREATION_FAILED,
                        gs.getMessage(
                            "Failed to create a record in {0} table due to error: {1}",
                            [
                                RequestNewRequestAppService.#TABLE_NAME,
                                JSON.stringify(e.message),
                            ]
                        ), {
                            tableName: RequestNewRequestAppService.#TABLE_NAME,
                        }
                    );
                }
            } else {
                if (!currentInstanceInfo.hasValidControllerRecord) {
                    throw ErrorService.createError(
                        ErrorService.ERROR_TYPES.UNAUTHORIZED,
                        gs.getMessage(
                            "Current environment is not a controller and does not have a valid controller record"
                        )
                    );
                }
                try {
                    const grPipelineEnvironment =
                        pipelineConfigChecks.getControllerRecord();
                    const inputs = {
                        url: currentInstanceInfo.controllerEnvironment.instance_url,
                        credential: grPipelineEnvironment.instance_credential.getRefRecord(),
                        label: name,
                        description: description,
                        additional_comments: additionalComments,
                        studio_url: url,
                        originating_instance_id: currentInstanceInfo.instanceId,
                        requestor: gs.getUserID(),
                    };
                    const result = sn_fd.FlowAPI.getRunner()
                        .action(
                            "sn_creatorstudio.create_new_app_request_record_in_environment"
                        )
                        .inForeground()
                        .withInputs(inputs)
                        .run();
                    const outputs = result.getOutputs() || {};
                    if (
                        outputs.__action_status__ &&
                        outputs.__action_status__.code === 0 &&
                        outputs.variable
                    ) {
                        return {
                            sysId: outputs.variable,
                        };
                    } else {
                        var message = outputs.__action_status__ ?
                            outputs.__action_status__.message :
                            gs.getMessage(
                                "Something went wrong when creating task record in controller"
                            );
                        throw message;
                    }
                } catch (e) {
                    throw ErrorService.createError(
                        ErrorService.ERROR_TYPES.RECORD_CREATION_FAILED,
                        gs.getMessage(
                            "Failed to create a record in {0} table in controller due to error: {1}",
                            [
                                RequestNewRequestAppService.#TABLE_NAME,
                                JSON.stringify(e.message),
                            ]
                        )
                    );
                }
            }
        }
    };
})();
