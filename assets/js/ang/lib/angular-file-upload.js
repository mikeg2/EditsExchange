/*! 1.2.8 */
!function(){var a=angular.module("angularFileUpload",[]);a.service("$upload",["$http","$rootScope","$timeout",function(a,b,c){function d(b){b.method=b.method||"POST",b.headers=b.headers||{},b.transformRequest=b.transformRequest||function(b){return window.ArrayBuffer&&b instanceof ArrayBuffer?b:a.defaults.transformRequest[0](b)},window.XMLHttpRequest.__isShim&&(b.headers.__setXHR_=function(){return function(a){b.__XHR=a,a.upload.addEventListener("progress",function(a){b.progress&&c(function(){b.progress&&b.progress(a)})},!1),a.upload.addEventListener("load",function(a){a.lengthComputable&&c(function(){b.progress&&b.progress(a)})},!1)}});var d=a(b);return d.progress=function(a){return b.progress=a,d},d.abort=function(){return b.__XHR&&c(function(){b.__XHR.abort()}),d},d.then=function(a,c){return function(d,e,f){return b.progress=f||b.progress,c.apply(a,[d,e,f]),a}}(d,d.then),d}this.upload=function(b){b.headers=b.headers||{},b.headers["Content-Type"]=void 0,b.transformRequest=b.transformRequest||a.defaults.transformRequest;var c=new FormData;if(b.data)for(var e in b.data){var f=b.data[e];if(b.formDataAppender)b.formDataAppender(c,e,f);else{if("function"==typeof b.transformRequest)f=b.transformRequest(f);else for(var g=0;g<b.transformRequest.length;g++){var h=b.transformRequest[g];"function"==typeof h&&(f=h(f))}c.append(e,f)}}b.transformRequest=angular.identity;var i=b.fileFormDataName||"file";if("[object Array]"===Object.prototype.toString.call(b.file))for(var j="[object String]"===Object.prototype.toString.call(i),g=0;g<b.file.length;g++)c.append(j?i+g:i[g],b.file[g],b.file[g].name);else c.append(i,b.file,b.file.name);return b.data=c,d(b)},this.http=function(a){return d(a)}}]),a.directive("ngFileSelect",["$parse","$http","$timeout",function(a,b,c){return function(b,d,e){var f=a(e.ngFileSelect);d.bind("change",function(a){var d,e,g=[];if(d=a.target.files,null!=d)for(e=0;e<d.length;e++)g.push(d.item(e));c(function(){f(b,{$files:g,$event:a})})}),d.bind("click",function(){this.value=null})}}]),a.directive("ngFileDropAvailable",["$parse","$http","$timeout",function(a,b,c){return function(b,d,e){if("draggable"in document.createElement("span")){var f=a(e.ngFileDropAvailable);c(function(){f(b)})}}}]),a.directive("ngFileDrop",["$parse","$http","$timeout",function(a,b,c){return function(b,d,e){if("draggable"in document.createElement("span")){var f=null,g=a(e.ngFileDrop);d[0].addEventListener("dragover",function(a){c.cancel(f),a.stopPropagation(),a.preventDefault(),d.addClass(e.ngFileDragOverClass||"dragover")},!1),d[0].addEventListener("dragleave",function(){f=c(function(){d.removeClass(e.ngFileDragOverClass||"dragover")})},!1),d[0].addEventListener("drop",function(a){a.stopPropagation(),a.preventDefault(),d.removeClass(e.ngFileDragOverClass||"dragover");var f,h=[],i=a.dataTransfer.files;if(null!=i)for(f=0;f<i.length;f++)h.push(i.item(f));c(function(){g(b,{$files:h,$event:a})})},!1)}}}])}();