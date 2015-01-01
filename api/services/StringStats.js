exports.wordCount = function(s) {
    s = s.replace(/(^\s*)|(\s*$)/gi,"");
    s = s.replace(/[ ]{2,}/gi," ");
    s = s.replace(/\n /,"\n");
    return s.split(' ').length;
};

exports.wordCountHTML = function(s) {
    var strippedString = s.replace(/(<([^>]+)>)/ig,"");
    return exports.wordCount(strippedString);
};