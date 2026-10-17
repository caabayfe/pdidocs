var catBeingCreated = 0, //flag
	closePickerClicked = 0; //flag

// Update the form
function setCategory() {
	if(!catBeingCreated){
		var id = $j('#categoryId').val();
		g_form.setValue('kb_category', id);
		if(g_form && (typeof g_form.modifiedFields === 'object')){
			g_form.modifiedFields['kb_knowledge.kb_category'] = true;
		}
		GlideDialogWindow.get().destroy(); //Close the dialog window
	}
	else
		closePickerClicked = 1;
}

function getCompatibleColumnWidth() {
	if (window.frameElement && window.frameElement.id == "dialog_frame")
		return (window.frameElement.getWidth() * 0.75); // Resize if displayed from a dialog
	else
		return 700; // Default value for content width
}

$j(function() {
	var kbCategoriesJSON = $j('#kbCategoriesJSON');
	var kbCategoryId = g_form.getTableName() + '.kb_category';

	kbCategoriesJSON.columnview({
		jsonData: kbCategoriesJSON.html(),
		maxWidth: getCompatibleColumnWidth(),
		idValue: gel(kbCategoryId).value || false,
		blockEditing: $[disable_editing]
	}).bind({
		columnview_select: function (ev, obj) {
			$j("#categoryId").val(obj.id); // hidden field located at component level: gets destroyed with the component.
		},
		columnview_create: function(ev, obj) {
			// root nodes don't have a parent: use the KB article's knowledge base ID
			var kbElementVal = null;
			
			if(g_form.getControl("kb_knowledge_base")){
				kbElementVal = g_form.getValue("kb_knowledge_base");
			}else{
				return;
			}
			
			catBeingCreated = 1; //setting flag
			var id = (obj.id) ? obj.id : kbElementVal;
			var ga = new GlideAjax('KBCategoryCrud');
			ga.addParam('sysparm_name','create');
			ga.addParam('sysparm_label', obj.value);
			ga.addParam('sysparm_is_root', (obj.id ? 'false' : 'true'));
			ga.addParam('sysparm_id', id); // ID of parent
			ga.getXML(function(serverResponse) {
				if(serverResponse.status > 199 && serverResponse.status < 300){
					var result = serverResponse.responseXML.getElementsByTagName("result");
					var id = result[0].getAttribute("sysId");
					$j("#categoryId").val(id);
					if ($j.isFunction(obj.callback)) {
						obj.callback(id, obj);
					}
					catBeingCreated = 0;
					if(closePickerClicked) // in case 'OK' button was already clicked
						setCategory(); //set the new category and then close
				}
				else{
					console.log("ERROR: Error in creating the new category. Please check the server response below.");
					console.log(serverResponse);
					catBeingCreated = 0;
					if(closePickerClicked) // in case 'OK' button was already clicked
						setCategory(); //set the new category and then close
				}
			});
		},
		columnview_update: function(ev, obj) {
			var ga = new GlideAjax('KBCategoryCrud');
			ga.addParam('sysparm_name','update');
			ga.addParam('sysparm_id', obj.id); // ID of self
			ga.addParam('sysparm_label', obj.value);
			ga.getXML(function(serverResponse) {
				var result = serverResponse.responseXML.getElementsByTagName("result");
				$j("#categoryId").val(obj.id);
				var currentId = g_form.getValue('kb_category');
				if (currentId === obj.id) {
					// refresh the field when the user updates the label of same category.
					g_form.setValue('kb_category', obj.id);
				}
				if ($j.isFunction(obj.callback)) {
					obj.callback(obj.id, obj);
				}
			});
		}
	});
});
