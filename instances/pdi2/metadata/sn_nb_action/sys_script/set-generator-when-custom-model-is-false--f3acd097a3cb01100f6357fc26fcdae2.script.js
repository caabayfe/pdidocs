(function executeRule(current, previous /*null when async*/ ) {

    var generatorType = current['generator_type'].getRefRecord();
    if (generatorType['use_custom_model'] == false) {
        current['generator'] = generatorType.sys_id;
    }

})(current, previous);
