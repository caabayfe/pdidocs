function transform(input) {
    var info = {};
    info.sys_id = input.midSysId;
    info.user_name = input.userName;
    info.version = input.version;
    info.mutual_auth = input.mutualAuth;
    var midInfo = new MIDServerDetailsProvider(info);

    var versionInfo = midInfo.setVersionInfo();
    var userInfo = midInfo.setUserInfo();
    return {
        version: versionInfo,
        user: userInfo
    };
}
