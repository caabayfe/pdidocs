
			var gr = new GlideRecord("sys_dictionary");
			gr.addQuery("name", current.name);
			gr.addQuery("internal_type", "collection");
			gr.query();
			if (gr.next()) {
				var url = "sys_dictionary.do?";
				url += "sys_id=" + gr.sys_id;
				gs.setRedirect(url);
				action.setReturnURL(current);
			}
			
