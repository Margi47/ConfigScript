$(document).ready(function(){    
    var headers = $('h1').eq(1).nextUntil($('h1').eq(5),'h3');
    $.each(headers, function(index, value){
        var firstRow= headers.eq(index).next().find('tbody').first('tr');
        var name = firstRow.first('td').find('code').text();
        var defaultValues = firstRow.find('td').eq(2).text().split(':');

        var values=[];
        var secondRows = headers.eq(index).nextUntil('h3','table').eq(1).find('tbody').find('tr');
        $.each(secondRows, function(index, value){
            values.push(secondRows.eq(index).find('td').first().text());
        })

        headers.eq(index).after(getText(name, values, defaultValues[1]!=undefined));

        setDefaults(name, defaultValues);
    })

    createButton();


    var saveAs = saveAs || (function(view) {
    "use strict";
    // IE <10 is explicitly unsupported
    if (typeof view === "undefined" || typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
        return;
    }
    var
          doc = view.document
          // only get URL when necessary in case Blob.js hasn't overridden it yet
        , get_URL = function() {
            return view.URL || view.webkitURL || view;
        }
        , save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
        , can_use_save_link = "download" in save_link
        , click = function(node) {
            var event = new MouseEvent("click");
            node.dispatchEvent(event);
        }
        , is_safari = /constructor/i.test(view.HTMLElement) || view.safari
        , is_chrome_ios =/CriOS\/[\d]+/.test(navigator.userAgent)
        , throw_outside = function(ex) {
            (view.setImmediate || view.setTimeout)(function() {
                throw ex;
            }, 0);
        }
        , force_saveable_type = "application/octet-stream"
        // the Blob API is fundamentally broken as there is no "downloadfinished" event to subscribe to
        , arbitrary_revoke_timeout = 1000 * 40 // in ms
        , revoke = function(file) {
            var revoker = function() {
                if (typeof file === "string") { // file is an object URL
                    get_URL().revokeObjectURL(file);
                } else { // file is a File
                    file.remove();
                }
            };
            setTimeout(revoker, arbitrary_revoke_timeout);
        }
        , dispatch = function(filesaver, event_types, event) {
            event_types = [].concat(event_types);
            var i = event_types.length;
            while (i--) {
                var listener = filesaver["on" + event_types[i]];
                if (typeof listener === "function") {
                    try {
                        listener.call(filesaver, event || filesaver);
                    } catch (ex) {
                        throw_outside(ex);
                    }
                }
            }
        }
        , auto_bom = function(blob) {
            // prepend BOM for UTF-8 XML and text/* types (including HTML)
            // note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
            if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
                return new Blob([String.fromCharCode(0xFEFF), blob], {type: blob.type});
            }
            return blob;
        }
        , FileSaver = function(blob, name, no_auto_bom) {
            if (!no_auto_bom) {
                blob = auto_bom(blob);
            }
            // First try a.download, then web filesystem, then object URLs
            var
                  filesaver = this
                , type = blob.type
                , force = type === force_saveable_type
                , object_url
                , dispatch_all = function() {
                    dispatch(filesaver, "writestart progress write writeend".split(" "));
                }
                // on any filesys errors revert to saving with object URLs
                , fs_error = function() {
                    if ((is_chrome_ios || (force && is_safari)) && view.FileReader) {
                        // Safari doesn't allow downloading of blob urls
                        var reader = new FileReader();
                        reader.onloadend = function() {
                            var url = is_chrome_ios ? reader.result : reader.result.replace(/^data:[^;]*;/, 'data:attachment/file;');
                            var popup = view.open(url, '_blank');
                            if(!popup) view.location.href = url;
                            url=undefined; // release reference before dispatching
                            filesaver.readyState = filesaver.DONE;
                            dispatch_all();
                        };
                        reader.readAsDataURL(blob);
                        filesaver.readyState = filesaver.INIT;
                        return;
                    }
                    // don't create more object URLs than needed
                    if (!object_url) {
                        object_url = get_URL().createObjectURL(blob);
                    }
                    if (force) {
                        view.location.href = object_url;
                    } else {
                        var opened = view.open(object_url, "_blank");
                        if (!opened) {
                            // Apple does not allow window.open, see https://developer.apple.com/library/safari/documentation/Tools/Conceptual/SafariExtensionGuide/WorkingwithWindowsandTabs/WorkingwithWindowsandTabs.html
                            view.location.href = object_url;
                        }
                    }
                    filesaver.readyState = filesaver.DONE;
                    dispatch_all();
                    revoke(object_url);
                }
            ;
            filesaver.readyState = filesaver.INIT;

            if (can_use_save_link) {
                object_url = get_URL().createObjectURL(blob);
                setTimeout(function() {
                    save_link.href = object_url;
                    save_link.download = name;
                    click(save_link);
                    dispatch_all();
                    revoke(object_url);
                    filesaver.readyState = filesaver.DONE;
                });
                return;
            }

            fs_error();
        }
        , FS_proto = FileSaver.prototype
        , saveAs = function(blob, name, no_auto_bom) {
            return new FileSaver(blob, name || blob.name || "download", no_auto_bom);
        }
    ;
    // IE 10+ (native saveAs)
    if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
        return function(blob, name, no_auto_bom) {
            name = name || blob.name || "download";

            if (!no_auto_bom) {
                blob = auto_bom(blob);
            }
            return navigator.msSaveOrOpenBlob(blob, name);
        };
    }

    FS_proto.abort = function(){};
    FS_proto.readyState = FS_proto.INIT = 0;
    FS_proto.WRITING = 1;
    FS_proto.DONE = 2;

    FS_proto.error =
    FS_proto.onwritestart =
    FS_proto.onprogress =
    FS_proto.onwrite =
    FS_proto.onabort =
    FS_proto.onerror =
    FS_proto.onwriteend =
        null;

    return saveAs;
}(
       typeof self !== "undefined" && self
    || typeof window !== "undefined" && window
    || this.content
));
// `self` is undefined in Firefox for Android content script context
// while `this` is nsIContentFrameMessageManager
// with an attribute `content` that corresponds to the window

if (typeof module !== "undefined" && module.exports) {
  module.exports.saveAs = saveAs;
} else if ((typeof define !== "undefined" && define !== null) && (define.amd !== null)) {
  define("FileSaver.js", function() {
    return saveAs;
  });
}

    $('#resultButton').click(function(){
        var text= getResults();
        var blob = new Blob([text], {type: "text/plain;charset=utf-8"});

        saveAs(blob, "config.txt");
    });
});

function getText(name, values, hasLevel){
    var options ="";
    $.each(values, function(index, value){
        options += '<input type="radio" name="' + name + '" value="' + value.toLowerCase() + '"/>' + value;
    });

    var text ='<label>Value</label><div>' + options + '</div>';
    var levelText =`
        <label>Severity</label>
        <div>
            <input type="radio" name="` + name + `-level" value="none"/>None
            <input type="radio" name="` + name + `-level" value="suggestion"/>Suggestion
            <input type="radio" name="` + name + `-level" value="warning"/>Warning
            <input type="radio" name="` + name + `-level" value="error"/>Error
        </div>`;

    if(hasLevel){
        text += levelText;
    }
    return text;
}

function setDefaults(name, values){
    $('input[name="' + name +'"][value="' + values[0] + '"]').prop('checked', true);

    if(values[1] != undefined){
        $('input[name="' + name +'-level"][value="' + values[1] + '"]').prop('checked', true);
    }
}

function createButton(){
    var button=`
    <div id="resultButton">
        Get Results
    </div>
    `
    $('body').first().prepend(button);
    $('#resultButton').css({
        'position':'fixed', 
        'top': '0', 
        'right':'0', 
        'border':'3px solid red',
        'font-size':'40px',
        'background-color':'white',
        'padding':'5px',
        'z-index':'2'
    });
}

function getResults(){
    var result = "";
    var headers = $('h1').eq(1).nextUntil($('h1').eq(5),'h3');
    $.each(headers, function(index, value){
        var name = headers.eq(index).nextUntil('h3','table').first().find('tbody').first('tr').first('td').find('code').text();
                
        var resultValue = $('input[name="' + name +'"]:checked').val();
        var resultLevel = $('input[name="' + name +'-level"]:checked').val();

        var resultLine = name + '=' + resultValue;
        if(resultLevel != undefined){
            resultLine += ':' + resultLevel;
        }
        result += resultLine + '\r\n';
    });

    return result;
}