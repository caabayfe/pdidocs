function getTarget() {
		var selSysIds = g_list.getChecked();
		if(!selSysIds) {
			var dialogClass = typeof GlideModal != 'undefined' ? GlideModal : GlideDialogWindow;
			var dlg = new dialogClass('glide_modal_info');
			dlg.setTitle(new GwtMessage().getMessage('Info'));
			dlg.setWidth(400);
			dlg.setPreference('body', "Please select at least one Application to proceed");
			dlg.setPreference('onPromptComplete', cancelReport.bind(this));
			dlg.render();
		}
		else {
			var ajaxHelper = new GlideAjax("sn_itom_licensing.ITOMTriggerLicensableCIsReportStore");
			ajaxHelper.addParam('sysparm_name', 'getNavParams');
			ajaxHelper.addParam('sysparm_selValueStreams', JSON.stringify(selSysIds));
			ajaxHelper.getXMLAnswer(setNavigate.bind(this), null, null);
		}	
	}

	function cancelReport() {
		g_list.refresh();
	}

	function setNavigate(answer) {	
		var ans = JSON.parse(answer);
		var sValueStream = "";
		var sSKU = "";
		ans.valueStreamList.slice(0,-1).forEach(function(vs) {
			sValueStream += "value_stream="+vs+"^OR";
		});
		sValueStream += "value_stream="+ans.valueStreamList[ans.valueStreamList.length-1];
		ans.skuList.slice(0,-1).forEach(function(sku) {
			sSKU += "sku="+sku+"^OR";
		});
		sSKU += "sku="+ans.skuList[ans.skuList.length-1];
		var navigationURL="/itom_lu_licensable_cis_list.do?sysparm_query=" + sSKU + "^" + sValueStream;
		g_navigation.open(navigationURL);
	}

	
