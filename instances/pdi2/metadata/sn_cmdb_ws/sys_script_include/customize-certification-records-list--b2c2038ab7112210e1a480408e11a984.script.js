(function transform(transformBuilder, transformScriptArgs) {
	try {
		if (!transformBuilder)
			return;

		if (!Object.keys(transformScriptArgs).length > 0)
			return;

		const DM = new CMDBWsDMConstants();
		const certDashboardManager = new CMDBWsDMCertDashboardManager();
		const taskAccessor = new CMDBWsDMTaskAccessor();
		const certRecordsListUtil = new CertificationRecordsListUtil();

		const instanceId = transformScriptArgs.instanceId;
		const certificationFields = transformScriptArgs.certificationFields ? transformScriptArgs.certificationFields.split(",") : [];

		// Additional columns
		const newColumns = [
			{
				column: {
					key: "certTask",
					type: "link",
					label: gs.getMessage("Certification task")
				},
				columnData: []
			},
			{
				column: {
					key: "certTaskAssignedTo",
					type: "link",
					label: gs.getMessage("Assigned to")
				},
				columnData: []
			},
			{
				column: {
					key: "certTaskToDocRecordLevelComment",
					type: "string",
					label: gs.getMessage("Comments"),
					cellEditingDisabled: true
				},
				columnData: []
			}
		];

		if (transformBuilder && transformBuilder.rowDefinitions && transformBuilder.rowDefinitions.rows) {
			let documentIds = transformBuilder.rowDefinitions.rows.map((row) => {
				if (row.type == 'grouped') {
					return row.children.map(c => c.key);
				} else {
					return row.key;
				}
			});

			let gr = certDashboardManager.getCertTaskToDocumentForCertInstance(instanceId, documentIds);
			let taskToDoc = {};
			while (gr.next()) {
				let documentId = gr.getValue(DM.CERTIFICATION_TASK_TO_DOCUMENT.CI);
				taskToDoc[documentId] = {
					status: taskAccessor.getCertificationAttributeStatus(gr),
					task: {
						label: gr.getDisplayValue("cmdb_data_management_task"),
						value: gr.getValue("cmdb_data_management_task")
					},
					assignedTo: {
						label: gr.getDisplayValue("cmdb_data_management_task.assigned_to"),
						value: gr.cmdb_data_management_task.assigned_to
					},
					comments: gr.getDisplayValue("comment")
				};
			}

			certRecordsListUtil.transformColumnsForDisplay(transformBuilder.columnDefinitions, certificationFields);
			certRecordsListUtil.transformRowsForDisplay(transformBuilder.rowDefinitions, transformBuilder.columnDefinitions, certificationFields, taskToDoc, transformScriptArgs.experienceURL);

			transformBuilder.rowDefinitions.rows.forEach(function process(row) {
				if(row.type == 'grouped') {
					if (row.type === 'grouped' && row.children) {
						row.children.forEach(process);
						return;
					}
				} else {
					if (taskToDoc[row.key]) {
						newColumns[0].columnData.push({
							rowKey: row.key,
							cellValue: {
								value: taskToDoc[row.key].task.value,
								label: taskToDoc[row.key].task.label,
								metadata: {
									referenceSysId: taskToDoc[row.key].task.value,
									internalValue: taskToDoc[row.key].task.value,
									internalType: "reference",
									recordClassName: "cmdb_data_management_task",
									openRecordMetadata: {
										sysId: taskToDoc[row.key].task.value,
										displayValue: taskToDoc[row.key].task.label,
										table: "cmdb_data_management_task",
										referenceKeyValue: ""
									}
								}
							}
						});

						newColumns[1].columnData.push({
							rowKey: row.key,
							cellValue: {
								value: taskToDoc[row.key].assignedTo.value,
								label: taskToDoc[row.key].assignedTo.label,
								metadata: {
									referenceSysId: taskToDoc[row.key].assignedTo.value,
									internalValue: taskToDoc[row.key].assignedTo.value,
									internalType: "reference",
									recordClassName: "sys_user",
									openRecordMetadata: {
										sysId: taskToDoc[row.key].assignedTo.value,
										displayValue: taskToDoc[row.key].assignedTo.label,
										table: "sys_user",
										referenceKeyValue: ""
									}
								}
							}
						});

						newColumns[2].columnData.push({
							rowKey: row.key,
							cellValue: {
								value: taskToDoc[row.key].comments
							}
						});
					}
				}
			});
		}

		const listModel = transformBuilder.addColumns(newColumns).transform(); // additionl columns added
		return listModel;
	}
	// do not remove
	catch(error) {
		return {
			failed: true,
			error: error.message
		};
	}
})(transformBuilder, transformScriptArgs);
