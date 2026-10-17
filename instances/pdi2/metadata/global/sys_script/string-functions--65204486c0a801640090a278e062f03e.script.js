// removes white space 
function trim(st) {
    st = st.toString();
    var len = st.length
    var begin = 0, end = len - 1;
    var ws = new RegExp(/(\s)/);
    while (st.charAt(begin).match(ws) && begin < len) {
        begin++;
    }
    while (st.charAt(end).match(ws) && begin < end) {
        end--;
    }
    return st.substring(begin, end+1);
}
