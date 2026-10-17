function onLoad() {
	if(!g_user.hasRole("admin") && g_form.getControl('mandatory_fields')) {
		// wait until the page is loaded so we can also manipulate the option elements
		addAfterPageLoadedEvent(function() {
			try{
				// disable the left and right select boxes
				gel("kb_knowledge_base.mandatory_fields_left").setAttribute("disabled","true");
				gel("kb_knowledge_base.mandatory_fields_right").setAttribute("disabled","true");
				
				// remove the left and right arrows
				$j("a[data-id='kb_knowledge_base.mandatory_fields']").css('display','none');
				
				// deselect the left and right option elements because the user will still be able to double click
				// and move selected items if there are any
				var optionsRight = gel("kb_knowledge_base.mandatory_fields_right").getElementsByTagName("option");
				for(var i = 0; i < optionsRight.length; i++)
					optionsRight[i].selected = false;
				
				var optionsLeft = gel("kb_knowledge_base.mandatory_fields_left").getElementsByTagName("option");
				for(var i = 0; i < optionsLeft.length; i++)
					optionsLeft[i].selected = false;
			}
			catch(e){}
			});
		}
	}
