function transform(input) {
    var outputResultObj = {};
    if (!gs.nil(input.versions)) {
        var outputResultArray = input.versions.split(',');
        if (!gs.nil(outputResultArray) && outputResultArray.length == 2) {
            outputResultObj = {
                "firstVersion": outputResultArray[0],
                "secondVersion": outputResultArray[1]
            };
        }
    }
    return outputResultObj;
}
