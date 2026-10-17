(function() {
    var req_item_id = JSUtil.nil(options.req_item_id + '') ? '' : options.req_item_id + '';
    if (!req_item_id) {
        req_item_id = JSUtil.nil(input.req_item_id + '') ? '' : input.req_item_id + '';
    }
    if (!req_item_id) {
        data.error = gs.getMessage("Request Item Not Provided");
        return;
    }
    var sc_req_item = new GlideRecord('sc_req_item');
    sc_req_item.get(req_item_id);

    if (!sc_req_item.isValidRecord()) {
        data.error = gs.getMessage("Invalid Request Item ID");
        return;
    }

		data.properties = {'workflow_driven_show_approvers': gs.getProperty("glide.workflow.renderer.workflowdriven.show_approver"),
										 'linear_show_approvers': gs.getProperty("glide.workflow.renderer.linear.show_approver"),
										 'main_flow_show_approvers': gs.getProperty("glide.workflow.renderer.mainflow.show_approver"),
										 'flowdesigner_show_approvers': gs.getProperty("com.glide.hub.flow_engine.stage_display.show_approvers")
										};

		data.preferences = {'ui_accessibility' :
		gs.getPreference("glide.ui.accessibility", "false")};

    var ref = sc_req_item.stage;
    var product_name = sc_req_item.cat_item.name;
		var refValue = ref.getValue();
		data.display_value = ref.getDisplayValue();
		if (sc_req_item.request.approval == 'requested') {
			data.process_started = false;
			data.display_value = gs.getMessage("Request Approval");
		} else {
			data.process_started = true;
			if (refValue == "request_approved") {
				if ((sc_req_item.context.nil() && sc_req_item.flow_context.nil()) || (!sc_req_item.flow_context.nil() && sc_req_item.flow_context.state == 'QUEUED'))
					data.display_value = gs.getMessage("Initiating");
				else if (refValue == ref.getDisplayValue())
					data.display_value = gs.getMessage("Request Approved");
			}
		}

    GlideController.putGlobal('sc_req_item', sc_req_item);
    sc_req_item.putCurrent();
    var renderer = RendererFactory.getRenderer(ref, sc_req_item.sys_id);
    var api = new SNC.RendererAPI(renderer);
    data.renderer = renderer + "";
    var worflow_id = sc_req_item.stage;
    var choiceList;
		var high_contrast = "";

		if(data.preferences.ui_accessibility == "true")
			high_contrast = "_high_contrast";

		var checkInsertSFSStages = function (choiceList) {
			// Returns stages defined in sc_service_fulfillment_stage_data
			var getSFSStages = function () {
				var sfsStages = new GlideChoiceList();
				var stage_data_gr = new GlideRecord("sc_service_fulfillment_stage_data");

				// Get image name for a given state
				var getImage = function (status) {
					var src = "";
					if(status === "complete") src = "icon-check-circle";
					else if(status === "progress") src = "icon-arrow-right";
					else if(status === "not_started") src = "icon-empty-circle";
					else if(status === "failed") src = "icon-cross-circle";
					else if(status === "canceled") src = "icon-cross-circle";
					else if(status === "skipped") src = "icon-step-over";
					return src;
				}

				stage_data_gr.addQuery("task", req_item_id);
				stage_data_gr.orderBy("order");
				stage_data_gr.query();

				var curStageName = null;
				var curStageState = {};
				var insertCurStage = () => {
					if(curStageName) {
						var value = curStageName.value;
						var label = curStageName.displayValue;
						var choice = new GlideChoice(value, label);
						choice.setImage(getImage(curStageState.value));
						choice.setParameter("name", curStageName.value);
						choice.setParameter("state", curStageState.displayValue);
						choice.setParameter("level", 1);
						sfsStages.add(choice);
					}
				};

				// Merge unnamed stages to closest named stage
				while(stage_data_gr.next()){
					if(!JSUtil.nil(stage_data_gr.name)) {
						insertCurStage();
						curStageName = {
							value: stage_data_gr.getValue("name"),
							displayValue: stage_data_gr.getDisplayValue("name")
						}
					}
					else {
						if(stage_data_gr.state == "not_started") continue;
					}
					curStageState = {
						value: stage_data_gr.getValue("state"),
						displayValue: stage_data_gr.getDisplayValue("state")
					};
				}
				insertCurStage();

				return sfsStages;
			}

			for(var i=0; i<choiceList.size(); i++){
				var curName = choiceList.get(i).getValue();
				if(curName == "sc_service_fulfillment_process") {
					var sfsStages = getSFSStages();
					if(sfsStages.size()) {
						for (var j = 0; j < sfsStages.size(); j++) {
							choiceList.add(i + 1 + j, sfsStages.get(j));
						}
						break;
					}
				}
			}
		}

    if (renderer == 'Legacy' || renderer == "SCReqItemRenderer" || renderer == "FlowDesigner") {
				if (ref.getProviderType() == 'PFStagesProvider' || renderer == "FlowDesigner") {
					choiceList = ref.getStages();
					checkInsertSFSStages(choiceList);
				}
				else {
						var clGenerator = new GlideChoiceListGenerator('sc_req_item', 'stage');
						clGenerator.none = false;
						choiceList = clGenerator.get();
						api.internationalizeChoices(choiceList);
						var wfw;
						if (sc_req_item.stage.hasAttribute('icons') && typeof (this[sc_req_item.stage.getAttribute('icons')]) == "function")
								wfw = new this[sc_req_item.stage.getAttribute('icons')]('sc_req_item.stage');
						else
								wfw = new WorkflowIcons('sc_req_item.stage');
						choiceList = wfw.process(choiceList);

				}
        var list = [];
        if (!JSUtil.nil(choiceList)) {
            var showApprovers = false;
            if (renderer == "FlowDesigner")
                showApprovers = data.properties.flowdesigner_show_approvers == "true";

            for (var i = 0; i < choiceList.size(); i++) {
                var choice = choiceList.get(i);
                if (!JSUtil.nil(choice.getValue())) {
                	   if (ref.getProviderType() == 'PFStagesProvider' && (choice.getParameter('visible') == false || JSUtil.nil(choice.getParameter('state'))))
						continue;
                    var temp = {};
                    temp.label = choice.getLabel();
                    temp.title = choice.getParameter('title') || choice.getLabel();
										temp.state = choice.getParameter('state');
										temp.name = choice.getParameter('name');
                    if (ref.getProviderType() == 'PFStagesProvider')
												temp.displayValue = temp.title + " (" + temp.state + ")";
										else
												temp.displayValue = temp.title + " (" + temp.label + ")";
                    temp.value = choice.getValue();
                    temp.id = choice.getId();
                    temp.selected = choice.getSelected();

                    var imgsrc = choice.image.split(' ');
                    imgsrc = imgsrc.length ? imgsrc[0] : imgsrc;
                    if (!imgsrc)
                        imgsrc = temp.selected ? 'icon-check-circle' : 'icon-empty-circle';

										imgsrc += high_contrast;
                    temp.image = imgsrc + '.png';

                    if(choice.getParameter("level"))
											temp.level = choice.getParameter("level");

                    if (showApprovers) {
                        var approvers = choice.getParameter("approvers");
                        var approverArr = [];
                        for (var j = 0; j < approvers.size(); j++) {
                            var approver = JSON.parse(JSON.stringify(approvers.get(j)));
                            approverArr.push(approver.label);
                        }
                        temp.approvers = approverArr;
                    }

                    list.push(temp);
                }
            }
        }
        data.choiceList = list;
    } else if (renderer == "Linear" || renderer == "Main flow" || renderer == "Workflow-driven") {
        if (renderer == "Linear" || renderer == "Workflow-driven")
            choiceList = api.getAllWorkflowChoices(current, 'sc_req_item.stage');
        else
            choiceList = api.getParentWorkflowChoices(current, 'sc_req_item.stage');

				var showApprovers = false;
				if (renderer == "Linear")
					showApprovers = data.properties.linear_show_approvers == "true";
				else if (renderer == "Main flow")
					showApprovers = data.properties.main_flow_show_approvers == "true";
				else if (renderer == "Workflow-driven")
					showApprovers = data.properties.workflow_driven_show_approvers == "true";

        api.addIconsAndStatus(choiceList);
        var list = [];
        if (!JSUtil.nil(choiceList)) {
            for (var j = 0; j < choiceList.size(); j++) {
                var choice = choiceList.get(j);
                var isVisible = true;
                if (renderer == "Linear" && !api.getOption('showSkipped'))
                    if (choice.getParameter('state') + '' == 'skipped')
                        isVisible = false;

                if (renderer == "Main flow" || renderer == "Workflow-driven") {
                    var isWorkFlow = SNC.WorkflowStageRenderer.isWorkflow('sc_req_item.stage');
                    isVisible = (isWorkFlow == 'false') || ((choice.getParameter('visible') + '') == 'true');
                }
                if (choice.value == '')
                    isVisible = false;

                if (isVisible) {
                    var temp = {};
                    temp.label = choice.getLabel();
                    temp.value = choice.getValue();
										temp.state = choice.getParameter('state');
										temp.name = choice.getParameter('name');
                    temp.id = choice.getId();
                    temp.selected = choice.getSelected();
										if (showApprovers) {
											var approvers = choice.getParameter('approvers');
											var approverArr = [];
											for(var i=0; i<approvers.size(); i++) {
												var approver = approvers.get(i);
												approverArr.push(approver.get('label'));
											}
										}
										temp.approvers = approverArr;
                    temp.title = choice.getParameter('title') || choice.getLabel();
                    temp.displayValue = temp.title + " (" + temp.label + ")"
                    var imgsrc = choice.image.split(' ');
                    imgsrc = imgsrc.length ? imgsrc[0] : imgsrc;
                    if (!imgsrc)
                        imgsrc = temp.selected ? 'icon-check-circle' : 'icon-empty-circle';

					imgsrc += high_contrast;
                    temp.image = imgsrc + '.png';
                    list.push(temp);
                }
            }
        }
        data.choiceList = list;
    } else if (renderer == "SimpleProgressBar") {
        choiceList = api.getParentWorkflowChoices(current, 'sc_req_item.stage');
        var showValue = api.getOption('showValue') + '';
        var increment = 100.00 / choiceList.getSize();
        var percentComplete = 0;
        var atEnd = true;

        for (var i = 0; choiceList.getSize() > i; i++) {
            percentComplete += increment;
            if (choiceList.getChoice(i).getParameter('state') + '' === 'active') {
                atEnd = false;
                break;
            }
        }
        data.increment = increment;

        percentComplete = atEnd ? 100 : parseInt(percentComplete);
        if (!JSUtil.nil(choiceList)) {
            var list = [];
            for (var j = 0; j < choiceList.size(); j++) {
                var choice = choiceList.get(j);
                var isVisible = true;
                if (!api.getOption('showSkipped'))
                    if (choice.getParameter('state') + '' == 'skipped')
                        isVisible = false;

                if (choice.value == '')
                    isVisible = false;
                if (isVisible) {
                    var temp = {};
                    temp.label = choice.getLabel();
                    temp.value = choice.getValue();
                    temp.id = choice.getId();
										temp.state = choice.getParameter('state');
										temp.name = choice.getParameter('name');
                    temp.selected = choice.getSelected();
                    temp.title = choice.getParameter('title') || choice.getLabel();
                    var isVisible = true;
                    temp.isVisible = isVisible;
                    temp.displayValue = temp.label;

                    var imgsrc = 'progress_pctnotdone.gifx';
                    if (choice.getParameter('state') + '' != 'pending')
                        imgsrc = 'progress_pctdone.gifx';
                    temp.image = imgsrc;
                    list.push(temp);
                }
            }
        }
        data.choiceList = list;
				data.showValue = showValue;
			data.percentComplete = percentComplete;
    }
    data.aria_labels = {
  collapse: gs.getMessage("Collapse stage message {0}", data.display_value),
  expand: gs.getMessage("Expand stage message {0}", data.display_value)
};
    data.current_stage_msg = gs.getMessage("Current stage: {0}", data.display_value); //We need this for WCAG
    data.approval_stages_msg = gs.getMessage("all stages "); //also for WCAG
    data.toggle_message = gs.getMessage("{0} Toggle stage state display for {1}",[data.display_value,product_name]);
    GlideController.removeGlobal('sc_req_item');
    sc_req_item.popCurrent();
})();
