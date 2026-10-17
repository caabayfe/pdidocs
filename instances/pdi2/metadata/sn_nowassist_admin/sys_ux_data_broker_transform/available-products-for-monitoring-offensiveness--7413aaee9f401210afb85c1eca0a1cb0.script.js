function transform() {
    try {
        var grUtil = new sn_nowassist_admin.NowAssistAdminGuardrails();
        var metaUtil = new sn_nowassist_admin.NowAdminAssistMetadata();
        var availableProducts = [];
        var activeProducts = [];
        var workflows = NAAWorkFlowFeatureUtil.getWorkflows();
        var productListNotSupportingOffensiveness = metaUtil.PRODUCT_LIST_NOT_SUPPORTING_OFFENSIVENESS;
        workflows.forEach(function(workflow) {
            var allProducts = NAAWorkFlowFeatureUtil.getProducts(workflow?.id);
            //Adding skills under workflows
            if (allProducts.length === 0 && workflow?.id !== metaUtil.PLATFORM_WORKFLOW_ID) {
                allProducts.push(workflow);
            }
            allProducts.forEach(function(product) {
                for (var nonSupportedProduct of productListNotSupportingOffensiveness) {
                    if (product.id === nonSupportedProduct.id) {
                        return;
                    }
                }
                var skills = NAASkillConfigUtil.getSkillsOfProduct(product?.id);
                if (skills.length !== 0) {
                    // Check if atleast one skill is active
                    var isActive = false;
                    for (let skill of skills) {
                        if (skill?.active) {
                            isActive = true;
                        }
                    }
                    // Get Detection Impact of the product
                    var result = grUtil.getDetectionImpact(skills, metaUtil.NOW_ASSIST_GUARDIAN?.OFFENSIVENESS_TYPE);
                    if (result?.detectionImpact === metaUtil.NOW_ASSIST_GUARDIAN.OFF || result?.detectionImpact === "") {
                        if (isActive) {
                            var offensivenessDescription;
                            switch (product?.name) {
                                case 'ITSM':
                                case 'CSM':
                                case 'HRSD':
                                case 'Security Operations':
                                case 'FSM':
                                case 'PSDS':
                                    offensivenessDescription = sn_i18n.Message.getMessage("sn_nowassist_admin", "Add logging and the option to block offensive content for Now Assist for {name} summarization and generation skills.", {
                                        name: product?.name
                                    });
                                    break;
                                case 'FSO':
                                case 'LSD':
                                    offensivenessDescription = sn_i18n.Message.getMessage("sn_nowassist_admin", "Add logging and the option to block offensive content for Now Assist for {name} summarization skills.", {
                                        name: product?.name
                                    });
                                    break;
                                case 'Creator':
                                    offensivenessDescription = sn_i18n.Message.getMessage("sn_nowassist_admin", "Add logging and the option to block offensive content for Now Assist for {name} for the catalog item generation skill.", {
                                        name: product?.name
                                    });
                                    break;
                                case 'Sourcing and Procurement Operations':
                                    offensivenessDescription = sn_i18n.Message.getMessage("sn_nowassist_admin", "Add logging and the option to block offensive content for Now Assist for SPO summarization and conversational intake skills.");
                                    break;
                                case 'Supplier Lifecycle Operations':
                                    offensivenessDescription = sn_i18n.Message.getMessage("sn_nowassist_admin", "Add logging and the option to block offensive content for Now Assist for SLO summarization skills.");
                                    break;
                                case 'Accounts Payable Operations':
                                    offensivenessDescription = sn_i18n.Message.getMessage("sn_nowassist_admin", "Add logging and the option to block offensive content for Now Assist for APO summarization skills.");
                                    break;
                                case 'ITOM':
                                    offensivenessDescription = sn_i18n.Message.getMessage("sn_nowassist_admin", "Add logging and the option to block offensive content for Now Assist for {name} alert skills.", {
                                        name: product?.name
                                    });
                                    break;
                                case 'SPM':
                                    offensivenessDescription = sn_i18n.Message.getMessage("sn_nowassist_admin", "Add logging and the option to block offensive content for Now Assist for {name} summarization and docs skills.", {
                                        name: product?.name
                                    });
                                    break;
                                case 'CMDB':
                                    offensivenessDescription = sn_i18n.Message.getMessage("sn_nowassist_admin", "Add logging and the option to block offensive content for Now Assist for {name} configuration item summarization skill.", {
                                        name: product?.name
                                    });
                                    break;
                                case 'Other':
                                    offensivenessDescription = sn_i18n.Message.getMessage("sn_nowassist_admin", "Add logging and the option to block offensive content for custom skills created with Now Assist Skill Kit.");
                                    break;
                                default:
                                    offensivenessDescription = sn_i18n.Message.getMessage("sn_nowassist_admin", "Add logging and the option to block offensive content for Now Assist for {name} skills.", {
                                        name: product?.name
                                    });
                                    break;
                            }
                            availableProducts.push({
                                id: product?.id,
                                name: product?.name,
                                description: offensivenessDescription,
                            });
                        }
                    } else {
                        activeProducts.push({
                            id: product?.id,
                            name: product?.name,
                            controlSettingData: result,
                            isActive: isActive
                        });
                    }
                }
            });
        });
        return {
            availableProducts: availableProducts,
            activeProducts: activeProducts
        };
    } catch (error) {
        gs.error("Error in getting products for Monitoring offensiveness data broker :" + error.toString());
    }
}
