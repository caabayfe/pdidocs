function createTree(parent, name, workflowId, order) {
    var blockId = gs.generateGUID();
    var node = {
        block_id: blockId,
        id: blockId,
        parent_block_id: parent ? parent.block_id : context.block_id,
        active: true,
        name: name,
        label: name,
        title: name,
        subtitle: "",
        order: order.toString(),
        type: {
            group: "element",
            name: "Side Nav",
            id: "9ffd5fc9c38501104b8e88c7c840ddb8",
            route: "",
            props: [{
                    element: "icon",
                    type: "string"
                },
                {
                    element: "type",
                    type: "choice"
                },
                {
                    element: "endpoint",
                    type: "string"
                }
            ]
        },
        lazyLoad: "0",
        children: [],
        props_details: {
            icon: "",
            type: "custom",
            endpoint: 'skill-list?productId=' + workflowId,
            nav_payload: {
                route: "skill-list",
                fields: {
                    productId: workflowId
                },
            },
            telemetryData: {
                event_name: "Workflow selected",
                title: name,
                append_to_payload: {
                    workflow: name
                }
            }
        },
        props_details_display: {},
        visibility: "answer=true;",
        post_script: "(function(context, pageParams){})(context, pageParams);"
    };
    return node;
}

function buildTree(workflowProducts, workflows) {
    var tree = [];
    var platfromWorkFlowDefaultChild = {
        id: NAAConstant.PLATFORM_WORKFLOW_ALL_PLATFORM_SKILLS,
        label: NAAConstant.PLATFORM_WORKFLOW_ALL_PLATFORM_SKILLS_LABEL,
        name: NAAConstant.PLATFORM_WORKFLOW_ALL_PLATFORM_SKILLS_LABEL,
        sub_title: "",
        description: "<p>platform child item</p>",
        image_url: null,
        preview_image: null,
        parent: "00202261eb383110da1861c59c5228e4", // same parent as other Platform items
        type: "product",
        category: "custom"
    };

    // Add the new child to the "Platform" array
    if (Array.isArray(workflowProducts["Platform"])) {
		workflowProducts["Platform"].unshift(platfromWorkFlowDefaultChild); 
    } else {
        workflowProducts["Platform"] = [platfromWorkFlowDefaultChild];
    }
    Object.keys(workflowProducts).forEach(function(parentName) {
        var workflowId = workflows.find(function(item) {
            return item.name === parentName;
        }).id;
        var parentNode = createTree(null, parentName, workflowId, 3);
        if (workflowProducts[parentName].length > 0) {
            parentNode.props_details = {
                icon: "",
                type: "custom",
                endpoint: 'skill-list?productId=' + workflowProducts[parentName][0].id,
                nav_payload: {
                    route: "skill-list",
                    fields: {
                        productId: workflowId == NAAConstant.PLATFORM_WORKFLOW_ID ? NAAConstant.PLATFORM_WORKFLOW_ID + '' : workflowProducts[parentName][0].id + ''
                    }
                },
                telemetryData: {
                    event_name: "Workflow default Product selected",
                    title: parentName,
                    append_to_payload: {
                        workflow: parentName,
                        product: workflowProducts[parentName][0].name
                    }
                }
            };
        }
        if (workflowId === 'a5efaf1c93764210aa5730f16489186d') {
            parentNode.props_details = {
                icon: "",
                type: "page",
                endpoint: 'other-skills',
                nav_payload: {},
                telemetryData: {
                    event_name: "Workflow selected",
                    title: parentName,
                    append_to_payload: {
                        workflow: parentName
                    }
                }
            };
        }

        workflowProducts[parentName].forEach(function(child) {

            var childNode = createTree(parentNode, child.name, workflowId, 0);
            childNode.label = child.label; // Setting label as per the provided object
            childNode.props_details = {
                icon: "",
                type: "custom",
                endpoint: 'skill-list?productId=' + (workflowId == NAAConstant.PLATFORM_WORKFLOW_ID && child.id == NAAConstant.PLATFORM_WORKFLOW_ALL_PLATFORM_SKILLS ? NAAConstant.PLATFORM_WORKFLOW_ID : child.id),
                nav_payload: {
                    route: "skill-list",
                    fields: {
                        productId: (workflowId == NAAConstant.PLATFORM_WORKFLOW_ID && child.id == NAAConstant.PLATFORM_WORKFLOW_ALL_PLATFORM_SKILLS ? NAAConstant.PLATFORM_WORKFLOW_ID : child.id + '')
                    }
                },
                telemetryData: {
                    event_name: "Product selected",
                    title: child.name,
                    append_to_payload: {
                        workflow: parentName,
                        product: child.name
                    }
                }
            };
            parentNode.children.push(childNode);
        });
        tree.push(parentNode);
    });
    return tree;
}
(function(context, pageParams) {
    try {
        var params = JSON.parse(context.props_details.page_parameters);
        var workflows = NAAWorkFlowFeatureUtil.getWorkflows();
        var workflowProducts = {};
        for (var i = 0; i < workflows.length; i++) {
            var products = NAAWorkFlowFeatureUtil.getProducts(workflows[i].id);
            workflowProducts[workflows[i].name] = products;
        }
        // choosing the first product to be selected dynamically instaed of hardcoding it
        params.productId = workflowProducts[workflows[0].name][0].id;
        context.props_details.page_parameters = JSON.stringify(params);
        if (pageParams.route !== "skill-guided-setup")
            context.menu = buildTree(workflowProducts, workflows);
        context.props_details.telemetryData = {
            event_name: "Now Assist Skills clicked",
            title: "Now Assist Skills",
            append_to_payload: {}
        };
        context.title = sn_i18n.Message.getMessage("sn_nowassist_admin", "Now Assist Skills");
        context.label = sn_i18n.Message.getMessage("sn_nowassist_admin", "Now Assist Skills");
    } catch (e) {
        //gs.error("Unable to set fields for features page in Now assist admin"+JSON.stringify(e));
    }
})(context, pageParams);
