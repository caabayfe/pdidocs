function enableDiableIcons(response) {
	    if (response == 'false') {
	        g_form.setReadOnly('icon', true);
	        g_form.setReadOnly('banner_image', true);
	    } else {
	        g_form.setReadOnly('icon', false);
	        g_form.setReadOnly('banner_image', false);
	    }
	}
	
	
	function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	
	    if (isLoading || newValue === '') {
	        return;
	    }
	
	    var gr = new GlideRecord('taxonomy');
	    gr.addQuery('sys_id', newValue);
	    gr.query(recordCallback);
	
	    function recordCallback(gr) {
	        while (gr.next()) { //While the recordset contains records, iterate through them
	            var ga = new GlideAjax('global.TaxonomyUtilAjax');
	            ga.addParam('sysparm_name', 'checkManagerAccess');
	            ga.addParam('sysparm_taxonomy', gr.sys_id);
	            ga.getXMLAnswer(enableDiableIcons);
	        }
	    }
	
	}
