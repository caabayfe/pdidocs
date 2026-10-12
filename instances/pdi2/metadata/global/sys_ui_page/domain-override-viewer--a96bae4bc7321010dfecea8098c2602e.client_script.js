(function($) {
    $(function() {
        loadFunction();
        function loadFunction() {
            $('#loading_spinner').hide();
        }

    $('#table_name').change(function() {
        $('#recordListDetails').hide();
        $('#loading_spinner').show();
    });
       
    });
  })($j);
  

  function selectTableForOverrides(){
    var container = document.querySelector('.container');
    var tableNameForRecordList = container.querySelector('#table_name').value;
    var recordListDetails = container.querySelector('.listDetails');

    var ga = new GlideAjax('DomainOverrideViewerUtil');
    ga.addParam('sysparm_name', 'getOverrideRecordList');
    ga.addParam('sysparm_table_name', tableNameForRecordList);
    ga.getXML(callback);

    function callback(response){
        var spinner = document.getElementById('loading_spinner');
        spinner.style.display = 'none';
        var recordListDetails = document.getElementById('recordListDetails');
        recordListDetails.style.display = 'block';

        var result = response.responseXML.documentElement.getAttribute('answer');
        var recordRows = JSON.parse(result);
        var html = [];

        html.push('<table class="listTable">');
        html.push('<thead><tr><th scope="col">Name</th><th scope="col">SysID</th><th scope="col">Domain</th><th scope="col">Overrides Count</th><th scope="col">View Records</th></tr></thead>');
        html.push('<tbody>');
        recordRows.forEach(function(recordRow){
            var keys = Object.keys(recordRow);
            html.push('<tr>');
            keys.forEach(function(key){
                var text = recordRow[key];
                if(key == 'ViewRecords'){
                    text = 'View Overrides';
                    html.push('<th scope="row"><a href="' + recordRow[key] + '" target="_blank">' + text + '</a></th>');
                } else {
                    html.push('<th scope="row">' + text + '</th>');
                }
    
            });
            html.push('</tr>');
        });
        html.push('</tbody></table>');
        recordListDetails.innerHTML = html.join("");
    }
}
