function validate(value) {
    if (!value)
       return true;

    var ajax = new GlideAjax('XMLValidator');
    ajax.addParam('sysparm_name','validate');
    ajax.addParam('sysparm_xml',value);
    ajax.getXMLWait();
    var answer = ajax.getAnswer();
    if (answer == null)
        return true;

    return answer;
}
