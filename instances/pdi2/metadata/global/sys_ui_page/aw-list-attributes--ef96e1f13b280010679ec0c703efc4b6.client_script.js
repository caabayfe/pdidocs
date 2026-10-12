var attributeMap = {};

(function($) {
	$(function() {
		
		handleSelectAllCheckbox();
		
	$('.btn').on('click', function() {
		$('table').hide();
		$('h1').hide();
		$('h2').hide();
		$('h4').hide();
		$('#save_button_bottom').hide();
		$('#save_button').hide();
		$('.icon-loading').show();
    });
		
		$('#selected_workspace').on('change', function(){
			window.location = 'aw_list_attributes.do?sysparm_workspace=' + $(this).val();
		});
		
		$('thead').on('click', '.select-all', function() {
			var $this = $(this);
			var checked = this.checked;
			
			var $table = $this.closest('table');
			var $checkboxes = $table.find('tbody input[value=' + this.value + ']');
			
			$checkboxes.each(function () { 
				if (this.checked !== checked)
					$(this).click();
			});
		});
		
		$('tbody').on('click', '.checkbox', function() {
			var attributeObject = {};
			var keyArray = [];
			var $this = $(this);
			
			var $row = $this.closest('tr');
			$row.find('input').each(function () {
				if (this.checked)
					keyArray.push(this.value);
			});
			var attributeKey = keyArray.join() || "delete";
			var sysid = $row.data('sysid');
			
			Object.keys(attributeMap).forEach(function (key) {
				for (var i = 0; i < attributeMap[key].length; i++) {
					if (attributeMap[key][i] == sysid)
						attributeMap[key].splice(i,1);
				}
			});
			
			attributeMap[attributeKey] = (attributeMap[attributeKey] || []);
			attributeMap[attributeKey].push($row.data('sysid'));

			handleSelectAllCheckbox(this.name);
		});
	
		function handleSelectAllCheckbox(name) {
			
			$('.icon-loading').hide();
			
			var $selectAllCheckboxes;
			
			if (name)
				$selectAllCheckboxes = $('input[class="select-all"][id$=' + name + ']');
			else
				$selectAllCheckboxes = $('.select-all');

			$selectAllCheckboxes.each(function () {
				var $this = $(this);
				var $table = $this.closest('table');
				var $checkboxes = $table.find('tbody input[value=' + this.value + ']');
				if ($checkboxes.filter(':checked').length == $checkboxes.length)
					$this.prop('checked', true);
				else
					$this.removeAttr('checked');
			});
		}
	});
})($j);

function submitAttributes() {
	var attributesJSON = JSON.stringify(attributeMap);
	var glideAjaxListAttributes = new GlideAjax('AWListAttributeAjax');
	glideAjaxListAttributes.addParam('sysparm_name', 'modifyAttributes');
	glideAjaxListAttributes.addParam('sysparm_changedAttributes', attributesJSON);
	glideAjaxListAttributes.getXML(asyncResponse);
	
	function asyncResponse(response) {
		location.reload();
	}
		


}
