String.prototype.startsWith =function(prefix){
   return (this.substr(0,prefix.length)==prefix);
}

String.prototype.endsWith = function(s) {
   if (!s)
      return false;
   
   if (this.length < s.length)
      return false;
   
   return (this.substr(this.length - s.length, s.length) == s);
}

String.prototype.trimLeft =function(){
   return this.replace(/^\s*/,"");
}

String.prototype.trimRight =function(){
   return this.replace(/\s*$/,"");
}

String.prototype.trim =function(){
   return this.trimRight().trimLeft();
}

String.prototype.replaceAll = function(from, to) {
   var str = this;
   from = from.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
   return str.replace(new RegExp(from, 'g'), to);
}
