var regListSelectAll = false;
var regListSpecificView = [];

var relatedListMap = {};

(function($) {
  $(function() {

    loadFunction();
    
    $('#table_button').on('click', function() {
      var $tableName = $('#table_name');
      window.location = 'omit_count_helper.do?sysparm_page=table&sysparm_tableName=' + $tableName.val();
    });

    $('#number_button').on('click', function() {
      var $inputNumber = $('#number_input');
      window.location = 'omit_count_helper.do?sysparm_sizeclass=' + $inputNumber.val();
    });

    $("#number_input").on('keypress', function(e) {
      if (e.which === 13) 
        window.location = 'omit_count_helper.do?sysparm_sizeclass=' + this.value;
    });

    $('thead').on('click', '.select-all', function() {
      var $this = $(this);
      var checked = this.checked;
      
      var $table = $this.closest('table');
      var $checkboxes = $table.find('tbody input[name=' + this.id + ']');
      
      $checkboxes.each(function () { 
        if (this.checked !== checked)
          $(this).click();
      });

     if ($this.attr('id') === 'regList_omitCount')
        regListSelectAll = checked;
    });
    
    $('tbody').on('click', '.checkbox', function() {
      var viewArray = [];
      var $this = $(this);
      
      var $checkboxes = $this.closest('table').find('input[name=' + this.name + ']').each(function () {
        if (this.checked && this.name === 'regList_omitCount')
          viewArray.push(this.value);
      });

      if (this.name === 'relatedList_omitCount') {
        relatedListMap[this.getAttribute('table')] = relatedListMap[this.getAttribute('table')] || {};
        relatedListMap[this.getAttribute('table')][this.getAttribute('relatedList')] = this.checked;
      }

      $selectAllCheckboxes = $('#' +this.name);

      if ($checkboxes.filter(':checked').length === $checkboxes.length) {
          $selectAllCheckboxes.prop('checked', true);
          if (this.name === 'regList_omitCount')
            regListSelectAll = true;
        } else {
          $selectAllCheckboxes.removeAttr('checked');
          if (this.name === 'regList_omitCount')
            regListSelectAll = false;
        }

      regListSpecificView = viewArray;
    });

    $('.btn').on('click', function() {
      $('table').hide();
      $('h1').hide();
      $('h2').hide();
      $('h4').hide();
      $('#save_button_bottom').hide();
      $('#save_button').hide();
      $('.icon-loading').show();
    });

    function loadFunction() {
		
	$('#table_name').focus();
    
    $('.icon-loading').hide();
    
        var $selectAll = $('.select-all')

        $selectAll.each(function () {
          var $this = $(this);
          var $table = $this.closest('table');
          var $checkboxes = $table.find('tbody input[name=' + this.id + ']');

          if ($checkboxes.filter(':checked').length === $checkboxes.length)
            $this.prop('checked', true);
          else
            $this.removeAttr('checked');
        })
    }

  });
})($j);

function goBack() {
  window.location = 'omit_count_helper.do';
}

function modifyListLayout() {
  var glideAjaxRegularList = new GlideAjax('omitCountHelperAjax');
  glideAjaxRegularList.addParam('sysparm_name', 'omitCountRegularListControl');
  glideAjaxRegularList.addParam ('sysparm_table', '$[tableName]');
  glideAjaxRegularList.addParam('sysparm_listControl', '$[listControlSysId]');
  glideAjaxRegularList.addParam('sysparm_selectAll', regListSelectAll.toString());
  glideAjaxRegularList.addParam('sysparm_views', regListSpecificView.join(','));
  glideAjaxRegularList.getXML();

  var glideAjaxRelatedList = new GlideAjax('omitCountHelperAjax');
  glideAjaxRelatedList.addParam('sysparm_name', 'omitCountRelatedListControl');
  glideAjaxRelatedList.addParam('sysparm_map', JSON.stringify(relatedListMap));
  glideAjaxRelatedList.getXML(ajaxResp);

  function ajaxResp(response) {
    location.reload();
  }
}
