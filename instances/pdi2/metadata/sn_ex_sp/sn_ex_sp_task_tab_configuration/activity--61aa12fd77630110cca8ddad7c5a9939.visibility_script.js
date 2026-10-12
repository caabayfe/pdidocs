/**
 * `answer` should be returned with true/false which validates if a tab is visible
 * The `current` object refers to the current Task(extension) record 
 **/
(function(current, answer) {

    // Activity stream for sc_request having multiple sc_req_item
    var itemsCountGa = new GlideAggregate('sc_req_item');
    itemsCountGa.addQuery('request', current.sys_id);
    itemsCountGa.addAggregate('COUNT');
    itemsCountGa.query();
    var count = (itemsCountGa.next()) ? itemsCountGa.getAggregate('COUNT') : 0;
    answer = (count > 1) ? true : false;

    return answer;

})(current, answer);
