/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { showNotification, disableSave, isSameScopesAndAPIs, areAPIsSame, copyToClipboard } = imports["global.APIAuthenticationConsoleUtil"]();
        
    if(event.elementId == "jwt_verifier_map") {
        api.setState('jwtVerifierMap', {"kid": generateRandomAlphanumeric()});
    } else if (event.elementId == "look_up_certificates") {
        let certificatesData = api.data.look_up_certificates.results;
        let certificates = [];
        for(let index in certificatesData) {
            certificates.push({
                "id": certificatesData[index]["sys_id"]["displayValue"],
                "label": certificatesData[index]["name"]["value"]
            });
        }
        api.setState("certificates", certificates);
    } else if (event.elementId == "look_up_jwt_verifier_maps") {
        let verifierMapsDB = api.data.look_up_jwt_verifier_maps.results;
        let verifierMapsClientState = [];
        for(let index in verifierMapsDB) {
            verifierMapsClientState.push({
                "id": verifierMapsDB[index]["sys_id"]["displayValue"],
                "label": verifierMapsDB[index]["name"]["value"]
            });
        }
        api.setState("allVerifierMaps", verifierMapsClientState);
    } else if (event.elementId == "jwt_verifier_map_certificate_select") {
        api.state.jwtVerifierMap["sys_certificate"] = event.payload.value;
    } else if (event.elementId == "typeahead_multi_1") {
        let currentVerifierMaps = event.payload.value;
        if(currentVerifierMaps.length < api.state.allVerifierMaps.length) {
            let allVerifierMaps = api.state.allVerifierMaps;
            let toBeDeleted = allVerifierMaps.filter(map => {
                let filter = true;
                for(let i in currentVerifierMaps) {
                    if(currentVerifierMaps[i].id == map.id)
                        filter = false;
                }
                return filter;
            });
            api.setState("toBeDeletedJWTVerifierMap", toBeDeleted[0]);
            helpers.modal.open("confirm_delete_jwt_verifier_map");
        }
    } else if (event.elementId == "delete_jwt_verifier_map") {
        if(event.name == "DATA_OP_SUCCEEDED") {
            try {
                if(event.payload.data.output.data.GlideRecord_Mutation.delete_jwt_verifier_map.modified_count == 1) {
                    showNotification(api, "jwt_verifier_delete_success", "positive", api.state.translatedMessages.jwtVerifierDeleteSuccess);
                    api.data.look_up_jwt_verifier_maps.refresh();
                    removeNotification(helpers, "jwt_verifier_delete_success");
                }
            } catch (e) {
                showNotification(api, "jwt_verifier_delete_fail", "critical", api.state.translatedMessages.jwtVerifierDeleteFail);
                removeNotification(helpers, "jwt_verifier_delete_fail");
            }
        }

        if(event.name == "DATA_OP_FAILED") {
            showNotification(api, "jwt_verifier_delete_fail", "critical", api.state.translatedMessages.jwtVerifierDeleteFail);
            removeNotification(helpers, "jwt_verifier_delete_fail");
        }
    } else if (event.elementId == "create_jwt_verifier") {
        if(event.name == "DATA_OP_SUCCEEDED") {
            showNotification(api, "jwt_verifier_create_success", "positive", api.state.translatedMessages.jwtVerifierCreateSuccess);
            api.data.look_up_jwt_verifier_maps.refresh();
            removeNotification(helpers, "jwt_verifier_create_success");
        }
        if(event.name == "DATA_OP_FAILED") {
            showNotification(api, "jwt_verifier_create_fail", "critical", api.state.translatedMessages.jwtVerifierCreateFail);
            removeNotification(helpers, "jwt_verifier_create_fail");
        }
        helpers.modal.close("jwt_verifier_map");
    } else if (event.elementId == "jwt_verifier_name_input") {
        var verifierMapName = event.payload.fieldValue.trim();
        api.state.jwtVerifierMap[event.payload.name] = verifierMapName;
        if(verifierMapName == '') {
            api.setState('disableJWTSave', true);
            api.setState('jwtVerifierNameInputInvalid', true);
        } else {
            api.setState('disableJWTSave', false);
            api.setState('jwtVerifierNameInputInvalid', false);
        }
    } else {
        if(event.name == "NOW_INPUT#INVALID_SET") {
            if (event.payload.fieldValue == undefined || event.payload.fieldValue == '')
                api.state.jwtVerifierMap[event.payload.name] = event.payload.fieldValue;
        } else {
            api.state.jwtVerifierMap[event.payload.name] = event.payload.value;
            api.setState('disableJWTSave', false);
        }
        if(api.state.jwtVerifierMap["name"] == undefined || api.state.jwtVerifierMap["name"] == '') {
            api.setState('disableJWTSave', true);
        }
    }

    function removeNotification(helpers, id) {
            helpers.timing.setTimeout(() => api.emit("NOW_UXF_PAGE#REMOVE_NOTIFICATIONS", {
            items: [{
                id: id
            }, {
                id: id
            }, ]
        }), 2000);
    }

    function generateRandomAlphanumeric(length = 32) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
    }
}
