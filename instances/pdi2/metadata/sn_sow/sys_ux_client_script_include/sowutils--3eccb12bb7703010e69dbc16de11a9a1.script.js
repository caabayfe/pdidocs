function include({imports}) {
    class SowUtils {
        static nameValueMap = {};
        static addValue(key, value) {
            if (key in this.nameValueMap) {
                if (Array.isArray(this.nameValueMap[key]))
                    this.nameValueMap[key].push(value);
                else
                    this.nameValueMap[key] = [this.nameValueMap[key], value];
            }
            else
                this.nameValueMap[key] = value;
        }
        static getNameValueMap(query) {
            this.nameValueMap = {};
            var queryTokens = query.split('^');
            for (var index in queryTokens) {
                var token = queryTokens[index];
                if (token.indexOf('<') != -1) {
                    var fieldValue = token.split('<');
                    this.addValue(fieldValue[0], '<' + fieldValue[1]);
                    continue;
                }
                if (token.indexOf('>') != -1) {
                    var fieldValue = token.split('>');
                    this.addValue(fieldValue[0], '>' + fieldValue[1]);
                    continue;
                }
                if (token.indexOf('=') != -1) {
                    var fieldValue = token.split('=');
                    this.nameValueMap[fieldValue[0]] = fieldValue[1];
                }
            }
            return this.nameValueMap;
        }
    }
    return SowUtils;
}
