/**
 * Handles all the details of formatting Linux OS name
 * 
 */
var LinuxOSNameHelper = Class.create();

LinuxOSNameHelper.prototype = {
    initialize: function() { /* do nothing */ },

    formatLinuxOSName: function(name) {
        // do not classify this as a Linux computer if OS name is not found
        if (JSUtil.nil(name))
            return null;

        var newName = this.osCleanupName(name);
        newName = OSChoice.reconcile(newName);
        return newName;
    },

    osCleanupName: function(osName) {
        if (this._contains(osName, 'red hat'))
            return "Linux Red Hat";
        else if (this._contains(osName, 'oracle'))
            return "Linux Oracle";
        else if (this._contains(osName, 'fedora'))
            return "Linux Fedora";
        else if (this._contains(osName, 'suse'))
            return "Linux SuSE";
        else if (this._contains(osName, 'centos stream'))
            return "Linux CentOS Stream";
        else if (this._contains(osName, 'centos'))
            return "Linux CentOS";
        else if (this._contains(osName, 'ubuntu'))
            return "Linux Ubuntu";
        else if (this._contains(osName, 'debian'))
            return "Linux Debian";
        else if (this._contains(osName, 'alma'))
            return "Linux Alma";
        else if (this._contains(osName, 'amazon'))
            return "Linux Amazon";
        else if (this._contains(osName, 'alpine'))
            return "Linux Alpine";
        else if (this._contains(osName, 'acro'))
            return "Linux Acro";
        else if (this._contains(osName, 'rocky'))
            return "Linux Rocky";
        else if (this._contains(osName, 'elementary'))
            return "Linux Elementary";
        else if (this._contains(osName, 'endeavour'))
            return "Linux Endeavour";
        else if (this._contains(osName, 'scientific'))
            return "Linux Scientific";
        else if (this._contains(osName, 'manjaro'))
            return "Linux Manjaro";
        else if (this._contains(osName, 'mint'))
            return "Linux Mint";
        else if (this._contains(osName, 'arch'))
            return "Linux Arch";
        else if (this._contains(osName, 'raspberry'))
            return "Linux Raspberry Pi";
        else if (this._contains(osName, 'chrome'))
            return "Linux ChromeOS";
        else if (this._contains(osName, 'puppy'))
            return "Linux Puppy";
        else if (this._contains(osName, 'pop'))
            return "Linux Pop";
        else if (this._contains(osName, 'kali'))
            return "Linux Kali";
        else if (this._contains(osName, 'antix'))
            return "Linux AntiX";
        else if (this._contains(osName, 'garuda'))
            return "Linux Garuda";
        else if (this._contains(osName, 'easy'))
            return "Linux EasyOS";
        else if (this._contains(osName, 'lite'))
            return "Linux Lite";
        else if (this._contains(osName, 'sparky'))
            return "Linux Sparky";
        else if (this._contains(osName, 'neon'))
            return "Linux KDE Neon";
        else if (this._contains(osName, 'zorin'))
            return "Linux Zorin";
        else if (this._contains(osName, 'mx'))
            return "Linux MX";
        else
            return "GNU/Linux";
    },

    /**
     *
     * Util method to check for Substr
     *
     * Checks if the string is contained in the original/given String.
     *
     **/
    _contains: function(mainStr, subStr) {
        if (mainStr && subStr)
            return mainStr.toLowerCase().includes(subStr.toLowerCase());
        return false;
    },

    type: "LinuxOSNameHelper"
}
