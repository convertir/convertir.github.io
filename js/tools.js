var undoStack = [];

function mkUndo (toolName) {
    var undoSelector = '#' + toolName + '-submit-undo';
    var textSelector = '#' + toolName + '-text';

    $(undoSelector).click(function (ev) {
        ev.preventDefault();

        var last = undoStack.pop();
        $(textSelector).val(last);

        if (undoStack.length == 0) {
            $(undoSelector).hide();
        }
    });
}

function mkTool (toolName, computeFn, opts) {
    opts = opts || {};

    var submitSelector = '#' + toolName + '-submit';
    var undoSelector = '#' + toolName + '-submit-undo';
    var textSelector = '#' + toolName + '-text';

    $(submitSelector).click(function () {
        var text = $(textSelector).val();
        if (!opts.allowEmptyText) {
            if (!text.length) return;
        }

        $('#action-error').hide();

        try {
            if (opts.asyncResultFn) {
                computeFn(text, opts.asyncResultFn);
            }
            else {
                var result = computeFn(text, opts.asyncResultFn);
                $(textSelector).val(result);
            }
        }
        catch (err) {
            if (opts.exceptionFn) opts.exceptionFn(err);
            return;
        }

        undoStack.push(text);

        $(undoSelector).show();
    });

    mkUndo(toolName);
}

$(function () {
    // make copy to clipboard work
    //
    $('#copy-to-clipboard').click(function (ev) {
        ev.preventDefault();
        $('#tool-implementation textarea').select();
        document.execCommand('copy');
    });

    function mkImageConvertTool (toolName, inputOpts, outputOpts, computeFn) {
        if ($('#tool-' + toolName).length == 0) return;

        var fileSelector = '#file-select';
        var submitSelector = '#submit';
        var selectedFile;

        // make file selector work
        $(fileSelector).on('change', function (ev) {
            $('#action-error').hide();
            var file = ev.target.files[0];
            if (file.type != inputOpts.inputMime) {
                $('#action-error').show();
                $('#action-error').text("Selected file is not a " + inputOpts.inputHumanFormat);
                return;
            }
            selectedFile = file;
            $(submitSelector).attr('disabled', false);
        });

        // make drag & drop work
        $('#drag-and-drop').on('dragover', function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            $('#drag-and-drop').addClass('hover');
        });
        $('#drag-and-drop').on('dragenter', function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            $('#drag-and-drop').addClass('hover');
        });
        $('#drag-and-drop').on('dragleave', function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            $('#drag-and-drop').removeClass('hover');
        });
        $('#drag-and-drop').on('dragend', function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            $('#drag-and-drop').removeClass('hover');
        });
        $('#drag-and-drop').on('drop', function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            $('#drag-and-drop').removeClass('hover');
            $('#action-error').hide();
            ev.dataTransfer = ev.originalEvent.dataTransfer;
            var file = ev.dataTransfer.files[0];
            if (file.type != inputOpts.inputMime) {
                $('#action-error').show();
                $('#action-error').text("Selected file is not a " + inputOpts.inputHumanFormat);
                return;
            }
            $('#drag-and-drop-selected').text("Selected " + file.name);
            selectedFile = file;
            $(submitSelector).attr('disabled', false);
        });

        // make convert button work
        //
        $(submitSelector).click(function () {
            var reader = new FileReader();
            reader.onload = function () {
                var img = new Image;
                img.onload = function () {
                    var canvas = $('<canvas>')[0];
                    canvas.width = img.width;
                    canvas.height = img.height;
                    var canvasCtx = canvas.getContext('2d');
                    canvasCtx.drawImage(img, 0, 0);
                    function blobHandler (blob) {
                        var lastDot = selectedFile.name.lastIndexOf('.');
                        if (lastDot != -1) {
                            var outputFileName = selectedFile.name.substring(0, lastDot) + '.' + outputOpts.outputExt;
                        }
                        else {
                            var outputFileName = selectedFile.name + '.' + optputOpts.outputExt;
                        }
                        saveAs(blob, outputFileName);
                    }
                    canvas.toBlob(blobHandler, outputOpts.outputMime);
                }
                img.src = reader.result;
            }
            reader.readAsDataURL(selectedFile);
        });
    }

    // make ascii85-encode tool work
    //
    mkTool('ascii85-encode', function (text) {
        return ascii85.encode(text);
    });

    // make ascii85-decode tool work
    //
    mkTool('ascii85-decode', function (text) {
        return ascii85.decode(text);
    });

    // make uu-encode tool work
    //
    mkTool('uu-encode', function (text) {
        return uuencode.encode(text);
    });

    // make uu-decode tool work
    //
    mkTool('uu-decode', function (text) {
            return uuencode.decode(text);
    });

    // make punycode-encode tool work
    //
    mkTool('punycode-encode', function (text) {
        return punycode.toASCII(text);
    });

    // make punycode-decode tool work
    //
    mkTool('punycode-decode', function (text) {
        return punycode.toUnicode(text);
    });

    // make idn-encode tool work
    //
    mkTool('idn-encode', function (text) {
        return punycode.toASCII(text);
    });

    // make idn-decode tool work
    //
    mkTool('idn-decode', function (text) {
        return punycode.toUnicode(text);
    });

    // make text-to-morse tool work
    //
    mkTool('text-to-morse', function (text) {
        return textToMorse(text);
    });

    // make morse-to-text tool work
    //
    mkTool('morse-to-text', function (text) {
        return morseToText(text);
    });

    // make hex-to-ip tool work
    //
    mkTool('hex-to-ip', function (text) {
        text.replace(/\r\n/g, '\n');
        var lines = text.split('\n');

        var output = '';
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var line = line.replace(/0x/gi, '');
            if (line.indexOf('.') > 0) {
                var match = /([0-f]+\.[0-f]+\.[0-f]+\.[0-f]+)/i.exec(line);
                if (match) {
                    var matchText = match[1];
                    var ipParts = matchText.split('.');
                    var p0 = parseInt(ipParts[0],16);
                    var p1 = parseInt(ipParts[1],16);
                    var p2 = parseInt(ipParts[2],16);
                    var p3 = parseInt(ipParts[3],16);
                    output += p0 + "." + p1 + "." + p2 + "." + p3;
                }
                else {
                    output += line;
                }
            }
            else {
                var match = /([0-f]+)/i.exec(line);
                if (match) {
                    var matchText = parseInt(match[1],16);
                    var converted = ((matchText>>24)&0xff) + '.' +
                        ((matchText>>16)&0xff) + '.' +
                        ((matchText>>8)&0xff) + '.' + 
                        (matchText&0xff);
                    output += converted;
                }
                else {
                    output += line;
                }
            }
            output += '\n';
        }

        return output;
    });

    // make ip-to-hex tool work
    //
    mkTool('ip-to-hex', function (text) {
        text.replace(/\r\n/g, '\n');
        var lines = text.split('\n');

        var output = '';
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var match = /(\d+\.\d+\.\d+\.\d+)/.exec(line);
            if (match) {
                var matchText = match[1];
                var ipParts = matchText.split('.');
                var p3 = parseInt(ipParts[3],10);
                var p3x = p3.toString(16);
                var p2 = parseInt(ipParts[2],10);
                var p2x = p2.toString(16);
                var p1 = parseInt(ipParts[1],10);
                var p1x = p1.toString(16);
                var p0 = parseInt(ipParts[0],10);
                var p0x = p0.toString(16);
                var dec = p3 + p2 * 256 + p1 * 256 * 256 + p0 * 256 * 256 * 256;
                var hex = dec.toString(16);
                function pad2 (hex) {
                    while (hex.length < 2) {
                        hex = "0" + hex;
                    }
                    return hex;
                }
                function pad8 (hex) {
                    while (hex.length < 8) {
                        hex = "0" + hex;
                    }
                    return hex;
                }
                hex = "0x" + pad8(hex);
                output += pad2(p0x) + "." + pad2(p1x) + "." + pad2(p2x) + "." + pad2(p3x) +
                    " (" + hex + ")";
            }
            else {
                output += line;
            }
            output += '\n';
        }

        return output;
    });

    // make csv-to-json tool work
    //
    mkTool(
        'csv-to-json',
        function (text, asyncResultFn) {
            var Converter = window.csvtojson.Converter;
            var converter = new Converter({});
            converter.fromString(text, function(err, result){
                if (err) throw new Error(err);
                asyncResultFn(result);
            });
        },
        {
            asyncResultFn : function (result) {
                $('#csv-to-json-text').val(JSON.stringify(result, null, 2));
            },
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err);
            }
        }
    );

    // make csv-to-xml tool work
    //
    mkTool(
        'csv-to-xml',
        function (text, asyncResultFn) {
            var Converter = window.csvtojson.Converter;
            var converter = new Converter({});
            converter.fromString(text, function(err, result){
                if (err) throw new Error(err);
                asyncResultFn(result);
            });
        },
        {
            asyncResultFn : function (result) {
                var json = result;
                var converted = vkbeautify.xml(json2xml(json));

                $('#csv-to-xml-text').val(converted);
            },
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err);
            }
        }
    );

    // make unix-to-utc tool work
    //
    mkTool('unix-to-utc', function (text) {
        text.replace(/\r\n/g, '\n');
        var lines = text.split('\n');

        var output = '';
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var match = /(\d+)/.exec(line);
            if (match) {
                var matchText = match[1];
                var converted = new Date(matchText * 1000);
                converted = converted.toUTCString();
                output += converted;
            }
            else {
                output += line;
            }
            output += '\n';
        }

        return output;
    });

    // make utc-to-unix tool work
    //
    mkTool('utc-to-unix', function (text) {
        text.replace(/\r\n/g, '\n');
        var lines = text.split('\n');

        var output = '';
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (line.length == 0) {
                output += '\n';
                continue;
            }

            var momentObj = moment(line);
            if (momentObj.isValid()) {
                var converted = momentObj.unix();
                output += converted;
            }
            else {
                output += "Invalid date or couldn't prase it (" + line + ")";
            }
            output += '\n';
        }

        return output;
    });

    // make json-to-csv tool work
    //
    mkTool(
        'json-to-csv',
        function (text) {
            try {
                var parsed = JSON.parse(text);
                var converted = json2csv({
                    data : parsed
                });
            }
            catch (err) {
                throw new Error("Invalid JSON"); // rethrow for exceptionFn
            }
            return converted;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make tsv-to-csv tool work
    //
    mkTool(
        'tsv-to-csv',
        function (text) {
            text = text.replace("\r\n", "\n");
            var lines = text.split("\n");
            var data = [];
            var fields = [];
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                var cols = line.split("\t");
                if (i == 0) {
                    fields = cols;
                }
                else {
                    var jsonObj = {};
                    for (var j = 0; j < fields.length; j++) {
                        jsonObj[fields[j]] = cols[j];
                    }
                    data.push(jsonObj);
                }
            }
                
            try {
                var converted = json2csv({
                    data : data,
                    fields : fields
                });
            }
            catch (err) {
                throw new Error("Couldn't convert data"); // rethrow for exceptionFn
            }

            return converted;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make tsv-to-text tool work
    //
    mkTool(
        'tsv-to-text',
        function (text) {
            text = text.replace("\r\n", "\n");
            var lines = text.split("\n");
            var ret = '';
            var maxColLens = [];
            for (var row = 0; row < lines.length; row++) {
                var cols = lines[row].split('\t');
                for (var col = 0; col < cols.length; col++) {
                    if (maxColLens[col] === undefined) {
                        maxColLens[col] = 0;
                    }
                    if (cols[col].length > maxColLens[col]) {
                        maxColLens[col] = cols[col].length;
                    }
                }
            }
            for (var row = 0; row < lines.length; row++) {
                var cols = lines[row].split('\t');
                for (var col = 0; col < cols.length; col++) {
                    if (cols[col].length < maxColLens[col]) {
                        var extraSpaceCount = maxColLens[col] - cols[col].length;
                        for (var i = 0; i < extraSpaceCount; i++) {
                            cols[col] += ' ';
                        }
                    }
                    ret += cols[col] + ' ';
                }
                ret += "\n";
            }
            return ret;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make text-to-tsv tool work
    //
    mkTool(
        'text-to-tsv',
        function (text) {
            text = text.replace("\r\n", "\n");
            var lines = text.split("\n");
            var ret = '';
            for (var i = 0; i < lines.length; i++) {
                var cols = lines[i].split(/\s+/g);
                ret += cols.join('\t') + "\n";
            }
            return ret;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err);
            }
        }
    );

    // make csv-to-tsv tool work
    //
    mkTool(
        'csv-to-tsv',
        function (text, asyncResultFn) {
            // duplicate first line so that csv parser treats second row
            // as column names. otherwise there's no way to access column names
            // in correct order.
            //
            text = text.replace("\r\n", "\n");
            var lines = text.split("\n");
            lines.splice(0,0,lines[0]);
            text = lines.join("\n");

            var Converter = window.csvtojson.Converter;
            var converter = new Converter({});
            converter.transform = function (json, row, index) {
                json['rowIndex_xyzzy'] = index;
                json['row_xyzzy'] = row;
            }
            converter.fromString(text, function(err, result){
                if (err) throw new Error(err);
                asyncResultFn(result, text);
            });
        },
        {
            asyncResultFn : function (result, text) {
                var ret = '';
                var json = result;
                for (var i = 0; i < json.length; i++) {
                    ret += json[i]['row_xyzzy'].join("\t") + "\n";
                }
                $('#csv-to-tsv-text').val(ret);
            },
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err);
            }
        }
    );

    // make csv-to-text tool work
    //
    mkTool(
        'csv-to-text',
        function (text, asyncResultFn) {
            // duplicate first line so that csv parser treats second row
            // as column names. otherwise there's no way to access column names
            // in correct order.
            //
            text = text.replace("\r\n", "\n");
            var lines = text.split("\n");
            lines.splice(0,0,lines[0]);
            text = lines.join("\n");

            var Converter = window.csvtojson.Converter;
            var converter = new Converter({});
            converter.transform = function (json, row, index) {
                json['rowIndex_xyzzy'] = index;
                json['row_xyzzy'] = row;
            }
            converter.fromString(text, function(err, result){
                if (err) throw new Error(err);
                asyncResultFn(result, text);
            });
        },
        {
            asyncResultFn : function (result, text) {
                var ret = '';
                var json = result;
                var maxColLens = [];
                for (var row = 0; row < json.length; row++) {
                    for (var col = 0; col < json[row]['row_xyzzy'].length; col++) {
                        if (maxColLens[col] === undefined) {
                            maxColLens[col] = 0;
                        }
                        if (json[row]['row_xyzzy'][col].length > maxColLens[col]) {
                            maxColLens[col] = json[row]['row_xyzzy'][col].length;
                        }
                    }
                }
                for (var row = 0; row < json.length; row++) {
                    var cols = json[row]['row_xyzzy'];
                    for (var col = 0; col < cols.length; col++) {
                        if (cols[col].length < maxColLens[col]) {
                            var extraSpaceCount = maxColLens[col] - cols[col].length;
                            for (var i = 0; i < extraSpaceCount; i++) {
                                cols[col] += ' ';
                            }
                        }
                        ret += cols[col] + ' ';
                    }
                    ret += "\n";
                }
                $('#csv-to-text-text').val(ret);
            },
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err);
            }
        }
    );

    // make text-to-csv tool work
    //
    mkTool(
        'text-to-csv',
        function (text) {
            text = text.replace("\r\n", "\n");
            var lines = text.split("\n");
            var data = [];
            var fields = [];
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                var cols = line.split(/\s+/g);
                if (i == 0) {
                    fields = cols;
                }
                else {
                    var jsonObj = {};
                    for (var j = 0; j < fields.length; j++) {
                        jsonObj[fields[j]] = cols[j];
                    }
                    data.push(jsonObj);
                }
            }
                
            try {
                var converted = json2csv({
                    data : data,
                    fields : fields
                });
            }
            catch (err) {
                throw new Error("Couldn't convert data"); // rethrow for exceptionFn
            }

            return converted;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make xml-to-tsv tool work
    //
    mkTool(
        'xml-to-tsv',
        function (text, asyncResultFn) {
            var x2js = new X2JS();
            var parsed = x2js.xml_str2json(text);

            var keys = Object.keys(parsed);
            if (keys.length > 1) {
                throw new Error("XML contains multiple primary keys. Too complex to convert to TSV.");
            }

            var primaryKey = keys[0];

            if (typeof parsed[primaryKey] == 'string' || typeof parsed[primaryKey] == 'number') {
                // case:
                //
                // <cars>    <cars>
                //   x         5
                // </cars>   </cars>
                //
                return primaryKey + "\n" + parsed[primaryKey];
            }
            else if (typeof parsed[primaryKey] == 'object') {
                // case:
                //
                // <cars>
                //   <complex xml>
                // </cars>
                //
                var complexObjectKeys = Object.keys(parsed[primaryKey]);
                if (complexObjectKeys.length == 1) {
                    var primaryComplexObjectKey = complexObjectKeys[0];
                    if (typeof parsed[primaryKey][primaryComplexObjectKey] == 'string' || 
                        typeof parsed[primaryKey][primaryComplexObjectKey] == 'number')
                    {
                        // case:
                        //
                        // <cars>
                        //   <car>x</car>
                        // </cars>
                        return primaryKey + "\n" + parsed[primaryKey][primaryComplexObjectKey];
                    }
                    else if (parsed[primaryKey][primaryComplexObjectKey] instanceof Array) {
                        if (typeof parsed[primaryKey][primaryComplexObjectKey][0] == 'string' ||
                            typeof parsed[primaryKey][primaryComplexObjectKey][0] == 'number')
                        {
                            // case:
                            //
                            // <cars>
                            //   <car>x</car>
                            //   <car>y</car>
                            // </cars>
                            //
                            var ret = primaryKey + "\n";
                            for (var i = 0; i < parsed[primaryKey][primaryComplexObjectKey].length; i++) {
                                ret += parsed[primaryKey][primaryComplexObjectKey][i] + "\n";
                            }
                            return ret;
                        }
                        else if (typeof parsed[primaryKey][primaryComplexObjectKey][0] == 'object') {
                            // case:
                            //
                            // <cars>
                            //   <car>
                            //    <name>x</name>
                            //    <color>red</color>
                            //   </car>
                            //   <car>
                            //    <name>y</name>
                            //    <color>green</color>
                            //   </car>
                            // </cars>
                            var objKeys = Object.keys(parsed[primaryKey][primaryComplexObjectKey][0]);
                            var ret = objKeys.join("\t") + "\n";
                            for (var i = 0; i < parsed[primaryKey][primaryComplexObjectKey].length; i++) {
                                for (var j = 0; j < objKeys.length; j++) {
                                    ret += parsed[primaryKey][primaryComplexObjectKey][i][objKeys[j]] + "\t";
                                }
                                ret += "\n";
                            }
                            return ret;
                        }
                        else {
                            throw new Error("xml too complex to convert to tsv, or something went wrong");
                        }
                    } 
                    else if (typeof parsed[primaryKey][primaryComplexObjectKey] == 'object') {
                        // case:
                        //
                        // <cars>
                        //   <car>
                        //    <name>x</name>
                        //    <color>red</color>
                        //   </car>
                        // </cars>
                        var objKeys = Object.keys(parsed[primaryKey][primaryComplexObjectKey]);
                        var ret = objKeys.join("\t") + "\n";
                        for (var i = 0; i < objKeys.length; i++) {
                            ret += parsed[primaryKey][primaryComplexObjectKey][objKeys[i]] + "\t";
                        }
                        return ret;
                    }
                    else {
                        throw new Error("xml too complex to convert to tsv, or something went wrong");
                    }
                }
                else {
                    // case:
                    //
                    // <car>
                    //   <name>x</name>
                    //   <color>21</color>
                    // </car>
                    ret = complexObjectKeys.join("\t") + "\n";
                    for (var i = 0; i < complexObjectKeys.length; i++) {
                        ret += parsed[primaryKey][complexObjectKeys[i]] + "\t";
                    }
                    return ret;
                }
            }
            else {
                throw new Error("xml too complex to convert to tsv, or something went wrong");
            }
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err);
            }
        }
    );

    // make tsv-to-xml tool work
    //
    mkTool(
        'tsv-to-xml',
        function (text) {
            text = text.replace("\r\n", "\n");
            var lines = text.split("\n");
            var data = [];
            var fields = [];
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                var cols = line.split("\t");
                if (i == 0) {
                    fields = cols;
                }
                else {
                    var jsonObj = {};
                    for (var j = 0; j < fields.length; j++) {
                        jsonObj[fields[j]] = cols[j];
                    }
                    data.push(jsonObj);
                }
            }

            var converted = vkbeautify.xml(json2xml(data));
            return converted;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make tsv-to-json tool work
    //
    mkTool(
        'tsv-to-json',
        function (text) {
            text = text.replace("\r\n", "\n");
            var lines = text.split("\n");
            var data = [];
            var fields = [];
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                var cols = line.split("\t");
                if (i == 0) {
                    fields = cols;
                }
                else {
                    var jsonObj = {};
                    for (var j = 0; j < fields.length; j++) {
                        jsonObj[fields[j]] = cols[j];
                    }
                    data.push(jsonObj);
                }
            }

            var prettified = JSON.stringify(data, null, 2);
            return prettified;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make json-to-tsv tool work
    //
    function jsonToTsv (json) {
        var ret = '';

        if (json instanceof Array) {
            if (json.length) {
                var obj = json[0];
                var keys = Object.keys(obj);
                if (keys.length == 0) {
                    for (var i = 0; i < json.length; i++) {
                        var val = json[i];
                        ret += val;
                        if (i != json.length-1) {
                            ret += "\t";
                        }
                    }
                }
                else {
                    for (var i = 0; i < keys.length; i++) {
                        var title = keys[i];
                        ret += title;
                        if (i != keys.length-1) {
                            ret += "\t";
                        }
                    }
                    ret += "\n";

                    for (var i = 0; i < json.length; i++) {
                        for (var j = 0; j < keys.length; j++) {
                            var key = keys[j];
                            ret += json[i][key];
                            if (j != keys.length-1) {
                                ret += "\t";
                            }
                        }
                        ret += "\n";
                    }
                }
            }
        }
        else {
            // todo: reuse code from above
            var keys = Object.keys(json);
            for (var i = 0; i < keys.length; i++) {
                var title = keys[i];
                ret += title;
                if (i != keys.length-1) {
                    ret += "\t";
                }
            }
            ret += "\n";

            for (var j = 0; j < keys.length; j++) {
                var key = keys[j];
                ret += json[key];
                if (j != keys.length-1) {
                    ret += "\t";
                }
            }
            ret += "\n";
        }
        return ret;
    }
    mkTool(
        'json-to-tsv',
        function (text) {
            var parsed = JSON.parse(text);
            return jsonToTsv(parsed);
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err);
            }
        }
    );

    // make json-to-xml tool work
    //
    mkTool(
        'json-to-xml',
        function (text) {
            try {
                var parsed = JSON.parse(text);
            }
            catch (err) {
                throw new Error("Invalid JSON"); // rethrow for exceptionFn
            }
            var converted = vkbeautify.xml(json2xml(parsed));
            return converted;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make xml-to-json tool work
    //
    mkTool(
        'xml-to-json',
        function (text) {
            var x2js = new X2JS();
            var converted = JSON.stringify(x2js.xml_str2json(text), 0, 2);
            return converted;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make xml-to-csv tool work
    //
    mkTool(
        'xml-to-csv',
        function (text) {
            var x2js = new X2JS();
            var json = x2js.xml_str2json(text);
            while (Object.keys(json).length == 1) {
                if (typeof json[Object.keys(json)[0]] == "object") {
                    json = json[Object.keys(json)[0]];
                }
                else {
                    break;
                }
            }
            var converted = json2csv({
                data : json
            });
            return converted;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make xml-to-yaml tool work
    //
    mkTool(
        'xml-to-yaml',
        function (text) {
            // first convert xml to json
            var x2js = new X2JS();
            var jsonObj = x2js.xml_str2json(text);

            // then convert json to yaml
            return YAML.stringify(jsonObj);
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make csv-to-yaml tool work
    //
    mkTool(
        'csv-to-yaml',
        function (text, asyncResultFn) {
            // first convert csv to json
            var Converter = window.csvtojson.Converter;
            var converter = new Converter({});
            converter.fromString(text, function(err, result){
                if (err) throw new Error(err);
                asyncResultFn(result);
            });
        },
        {
            asyncResultFn : function (json) {
                $('#csv-to-yaml-text').val(YAML.stringify(json));
            },
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err);
            }
        }
    );

    // make yaml-to-xml tool work
    //
    mkTool(
        'yaml-to-xml',
        function (text) {
            // first convert yaml to json

            try {
                var jsonObj = YAML.parse(text);
            }
            catch (err) {
                throw new Error("Invalid YAML"); // rethrow for exceptionFn
            }

            // then convert json to xml
            return vkbeautify.xml(json2xml(jsonObj));
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make yaml-to-csv tool work
    //
    mkTool(
        'yaml-to-csv',
        function (text) {
            // first convert yaml to json

            try {
                var jsonObj = YAML.parse(text);
            }
            catch (err) {
                throw new Error("Invalid YAML"); // rethrow for exceptionFn
            }

            // then convert json to csv
            var converted = json2csv({
                data : jsonObj
            });

            return converted
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make json-to-text tool work
    //
    mkTool(
        'json-to-text',
        function (text) {
            try {
                var parsed = JSON.parse(text);
            }
            catch (err) {
                throw new Error("Invalid JSON"); // rethrow for exceptionFn
            }

            return jsonToText(parsed);
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make json-to-yaml tool work
    //
    mkTool(
        'json-to-yaml',
        function (text) {
            try {
                var parsed = JSON.parse(text);
            }
            catch (err) {
                throw new Error("Invalid JSON"); // rethrow for exceptionFn
            }

            return YAML.stringify(parsed);
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make yaml-to-json tool work
    //
    mkTool(
        'yaml-to-json',
        function (text) {
            try {
                var jsonObj = YAML.parse(text);
            }
            catch (err) {
                throw new Error("Invalid YAML"); // rethrow for exceptionFn
            }

            return JSON.stringify(jsonObj, 0, 2);
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make yaml-to-tsv tool work
    //
    mkTool(
        'yaml-to-tsv',
        function (text) {
            try {
                var jsonObj = YAML.parse(text);
            }
            catch (err) {
                throw new Error("Invalid YAML"); // rethrow for exceptionFn
            }

            return jsonToTsv(jsonObj);
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make tsv-to-yaml tool work
    //
    mkTool(
        'tsv-to-yaml',
        function (text) {
            // copy pasted from tsv-to-json
            // todo: dont copy paste
            text = text.replace("\r\n", "\n");
            var lines = text.split("\n");
            var data = [];
            var fields = [];
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                var cols = line.split("\t");
                if (i == 0) {
                    fields = cols;
                }
                else {
                    var jsonObj = {};
                    for (var j = 0; j < fields.length; j++) {
                        jsonObj[fields[j]] = cols[j];
                    }
                    data.push(jsonObj);
                }
            }

            // then convert json to yaml
            return YAML.stringify(data);
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make csv-extract-column work
    //
    mkTool(
        'csv-extract-column',
        function (text, asyncResultFn) {
            var col = $('#csv-extract-column-number').val();
            if (!/^\d+$/.test(col)) {
                throw new Error("Invalid column number");
            }
            text = text.replace("\r\n", "\n");
            var lines = text.split("\n");
            lines.splice(0,0,lines[0]);
            text = lines.join("\n");

            var Converter = window.csvtojson.Converter;
            var converter = new Converter({});
            converter.transform = function (json, row, index) {
                json['rowIndex_xyzzy'] = index;
                json['row_xyzzy'] = row;
            }
            converter.fromString(text, function(err, result){
                if (err) throw new Error(err);
                asyncResultFn(result, text, col);
            });
        },
        {
            asyncResultFn : function (json, text, col) {
                var ret = '';
                colName = json[0]['row_xyzzy'][col-1];
                if (colName === undefined) {
                    var err = "Column " + col + " doesn't exist";
                    $('#action-error').show();
                    $('#action-error').text(err);
                    return;
                }
                    
                for (var i = 0; i < json.length; i++) {
                    ret += json[i][colName] + "\n";
                }
                $('#csv-extract-column-text').val(ret);
            },
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err);
            }
        }
    );

    // make csv-delete-column work
    //
    mkTool(
        'csv-delete-column',
        function (text, asyncResultFn) {
            var col = $('#csv-delete-column-number').val();
            if (!/^\d+$/.test(col)) {
                throw new Error("Invalid column number");
            }
            text = text.replace("\r\n", "\n");
            var lines = text.split("\n");
            lines.splice(0,0,lines[0]);
            text = lines.join("\n");

            var Converter = window.csvtojson.Converter;
            var converter = new Converter({});
            converter.transform = function (json, row, index) {
                json['rowIndex_xyzzy'] = index;
                json['row_xyzzy'] = row;
            }
            converter.fromString(text, function(err, result){
                if (err) throw new Error(err);
                asyncResultFn(result, text, col);
            });
        },
        {
            asyncResultFn : function (json, text, col) {
                var ret = '';
                colName = json[0]['row_xyzzy'][col-1];
                if (colName === undefined) {
                    var err = "Column " + col + " doesn't exist";
                    $('#action-error').show();
                    $('#action-error').text(err);
                    return;
                }
                var columnTitles = [];
                var columnData = [];
                for (var i = 0; i < json.length; i++) {
                    json[i]['row_xyzzy'].splice(col-1,1);
                }
                for (var i = 0; i < json.length; i++) {
                    if (i == 0) {
                        columnTitles = json[i]['row_xyzzy']
                    }
                    else {
                        var jsonObj = {};
                        for (var j = 0; j < json[i]['row_xyzzy'].length; j++) {
                            jsonObj[columnTitles[j]] = json[i]['row_xyzzy'][j];
                        }
                        columnData.push(jsonObj);
                    }
                }
                try {
                    var newCsv = json2csv({
                        data : columnData,
                        fields : columnTitles
                    });
                }
                catch (err) {
                    throw new Error("Couldn't convert data"); // rethrow for exceptionFn
                }
                
                $('#csv-delete-column-text').val(newCsv);
            },
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err);
            }
        }
    );

    // make tsv-extract-column tool work
    //
    mkTool(
        'tsv-extract-column',
        function (text) {
            var col = $('#tsv-extract-column-number').val();
            if (!/^\d+$/.test(col)) {
                throw new Error("Invalid column number");
            }
            text = text.replace("\r\n", "\n");
            var lines = text.split("\n");
            var ret = '';
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (line.length) {
                    var cols = line.split("\t");
                    ret += cols[col-1] + "\n";
                }
                else {
                    ret += "\n";
                }
            }
            return ret;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make tsv-delete-column tool work
    //
    mkTool(
        'tsv-delete-column',
        function (text) {
            var col = $('#tsv-delete-column-number').val();
            if (!/^\d+$/.test(col)) {
                throw new Error("Invalid column number");
            }
            text = text.replace("\r\n", "\n");
            var lines = text.split("\n");
            var ret = '';
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (line.length) {
                    var cols = line.split("\t");
                    cols.splice(col-1,1);
                    ret += cols.join("\t") + "\n";
                }
                else {
                    ret += "\n";
                }
            }
            return ret;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make tsv-replace-column tool work
    //
    mkTool(
        'tsv-replace-column',
        function (text) {
            var col = $('#tsv-replace-column-number').val();
            if (!/^\d+$/.test(col)) {
                throw new Error("Invalid column number");
            }
            var newCol = $('#tsv-replace-column-new-column').val();

            text = text.replace("\r\n", "\n");
            var lines = text.split("\n");

            var ret = '';

            if (newCol.length == 0) {
                // delete column
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    var cols = line.split("\t");
                    cols.splice(cols-1,1);
                    ret += cols.join('\t') + "\n";
                }
            }
            else {
                // replace column
                var newColLines = newCol.split('\n');
                if (newColLines.length < lines.length) {
                    $('#action-error').show();
                    $('#action-error').text('The new column has less rows than the existing TSV. Replacing anyway.');
                    for (var i = 0; i < lines.length-newColLines.length; i++) {
                        newColLines.push('');
                    }
                }
                if (newColLines.length > lines.length) {
                    $('#action-error').show();
                    $('#action-error').text('The new column has more rows than the existing TSV. Replacing anyway.');
                    newColLines.splice(lines.length,newColLines.length);
                }
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    var cols = line.split("\t");
                    cols[col-1] = newColLines[i];
                    ret += cols.join('\t') + "\n";
                }
            }
            return ret;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make tsv-append-column tool work
    //
    mkTool(
        'tsv-append-column',
        function (text) {
            var newCol = $('#tsv-append-column-new-column').val();

            text = text.replace("\r\n", "\n");
            var lines = text.split("\n");

            var ret = '';

            if (newCol.length == 0) {
                // append an empty column
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    var cols = line.split("\t");
                    cols.push('');
                    ret += cols.join('\t') + "\n";
                }
            }
            else {
                // append column
                var newColLines = newCol.split('\n');
                if (newColLines.length < lines.length) {
                    $('#action-error').show();
                    $('#action-error').text('The new column has less rows than the existing TSV. Appending anyway.');
                    for (var i = 0; i < lines.length-newColLines.length; i++) {
                        newColLines.push('');
                    }
                }
                if (newColLines.length > lines.length) {
                    $('#action-error').show();
                    $('#action-error').text('The new column has more rows than the existing TSV. Appending anyway.');
                    newColLines.splice(lines.length,newColLines.length);
                }
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    var cols = line.split("\t");
                    cols.push(newColLines[i]);
                    ret += cols.join('\t') + "\n";
                }
            }
            return ret;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make tsv-insert-column tool work
    //
    mkTool(
        'tsv-insert-column',
        function (text) {
            var col = $('#tsv-insert-column-number').val();
            if (!/^-?\d+$/.test(col)) {
                throw new Error("Invalid column number");
            }
            var newCol = $('#tsv-insert-column-new-column').val();

            text = text.replace("\r\n", "\n");
            var lines = text.split("\n");

            var ret = '';

            if (newCol.length == 0) {
                // insert an empty column
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    var cols = line.split("\t");
                    if (col == -1) {
                        var colCount = cols.length;
                        cols.splice(colCount, 0, '');
                    }
                    else {
                        cols.splice(col-1, 0, '');
                    }
                    ret += cols.join('\t') + "\n";
                }
            }
            else {
                // insert column
                var newColLines = newCol.split('\n');
                if (newColLines.length < lines.length) {
                    $('#action-error').show();
                    $('#action-error').text('The new column has less rows than the existing TSV. Inserting anyway.');
                    for (var i = 0; i < lines.length-newColLines.length; i++) {
                        newColLines.push('');
                    }
                }
                if (newColLines.length > lines.length) {
                    $('#action-error').show();
                    $('#action-error').text('The new column has more rows than the existing TSV. Inserting anyway.');
                    newColLines.splice(lines.length,newColLines.length);
                }
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    var cols = line.split("\t");
                    if (col == -1) {
                        var colCount = cols.length;
                        cols.splice(colCount, 0, newColLines[i]);
                    }
                    else {
                        cols.splice(col-1, 0, newColLines[i]);
                    }
                    ret += cols.join('\t') + "\n";
                }
            }
            return ret;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make extract-column tool work
    //
    mkTool(
        'extract-column',
        function (text) {
            var col = $('#extract-column-number').val();
            var delim = $('#extract-column-delimiter').val();
            if (!/^\d+$/.test(col)) {
                throw new Error("Invalid column number");
            }
            text = text.replace("\r\n", "\n");
            var lines = text.split("\n");
            var ret = '';
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (line.length) {
                    if (delim == ' ') {
                        var cols = line.split(/\s+/g);
                    }
                    else {
                        var cols = line.split(delim);
                    }
                    ret += cols[col-1] + "\n";
                }
                else {
                    ret += "\n";
                }
            }
            return ret;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make delete-column tool work
    //
    mkTool(
        'delete-column',
        function (text) {
            var col = $('#delete-column-number').val();
            var delim = $('#delete-column-delimiter').val();
            if (!/^\d+$/.test(col)) {
                throw new Error("Invalid column number");
            }
            text = text.replace("\r\n", "\n");
            var lines = text.split("\n");
            var ret = '';
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (line.length) {
                    if (delim == ' ') {
                        var cols = line.split(/\s+/g);
                    }
                    else {
                        var cols = line.split(delim);
                    }
                    cols.splice(col-1,1);
                    ret += cols.join(delim) + "\n";
                }
                else {
                    ret += "\n";
                }
            }
            return ret;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make replace-column tool work
    //
    mkTool(
        'replace-column',
        function (text) {
            var col = $('#replace-column-number').val();
            var delim = $('#replace-column-delimiter').val();
            if (!/^\d+$/.test(col)) {
                throw new Error("Invalid column number");
            }
            var newCol = $('#replace-column-new-column').val();

            text = text.replace("\r\n", "\n");
            var lines = text.split("\n");
            var ret = '';
            if (newCol.length == 0) {
                // delete column
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    var cols = line.split(delim);
                    cols.splice(cols-1,1);
                    ret += cols.join(delim) + "\n";
                }
            }
            else {
                // replace column
                var newColLines = newCol.split('\n');
                if (newColLines.length < lines.length) {
                    $('#action-error').show();
                    $('#action-error').text('The new column has less rows than the existing TSV. Replacing anyway.');
                    for (var i = 0; i < lines.length-newColLines.length; i++) {
                        newColLines.push('');
                    }
                }
                if (newColLines.length > lines.length) {
                    $('#action-error').show();
                    $('#action-error').text('The new column has more rows than the existing TSV. Replacing anyway.');
                    newColLines.splice(lines.length,newColLines.length);
                }
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    var cols = line.split(delim);
                    cols[col-1] = newColLines[i];
                    ret += cols.join(delim) + "\n";
                }
            }
            return ret;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make swap-column tool work
    //
    mkTool(
        'swap-columns',
        function (text) {
            var col1 = $('#swap-columns-col1').val();
            var col2 = $('#swap-columns-col2').val();
            var delim = $('#swap-columns-delimiter').val();
            if (!/^\d+$/.test(col1)) {
                throw new Error("Invalid column 1 number");
            }
            if (!/^\d+$/.test(col2)) {
                throw new Error("Invalid column 2 number");
            }
            if (col1 == col2) {
                throw new Error("Can't swap the same column");
            }
            text = text.replace("\r\n", "\n");
            var lines = text.split("\n");
            var ret = '';
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (line.length) {
                    if (delim == ' ') {
                        var cols = line.split(/\s+/g);
                    }
                    else {
                        var cols = line.split(delim);
                    }
                    var rowCol1 = cols[col1-1];
                    var rowCol2 = cols[col2-1];
                    cols[col1-1] = rowCol2;
                    cols[col2-1] = rowCol1;
                    ret += cols.join(delim) + "\n";
                }
                else {
                    ret += "\n";
                }
            }
            return ret;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make change-delimiter work
    //
    mkTool(
        'change-delimiter',
        function (text) {
            text = text.replace("\r\n", "\n");
            var lines = text.split("\n");
            var oldDelim = $('#change-delimiter-old-delimiter').val();
            var newDelim = $('#change-delimiter-new-delimiter').val();

            var ret = '';
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (oldDelim == ' ') {
                    var row = line.split(/\s+/g);
                }
                else {
                    var row = line.split(oldDelim);
                }

                row = row.join(newDelim);
                ret += row + '\n';
            }
            return ret;
        }
    );

    // make csv-transpose work
    //
    mkTool(
        'csv-transpose',
        function (text, asyncResultFn) {
            text = text.replace("\r\n", "\n");
            var lines = text.split("\n");
            lines.splice(0,0,lines[0]);
            text = lines.join("\n");

            var Converter = window.csvtojson.Converter;
            var converter = new Converter({});
            converter.transform = function (json, row, index) {
                json['rowIndex_xyzzy'] = index;
                json['row_xyzzy'] = row;
            }
            converter.fromString(text, function(err, result){
                if (err) throw new Error(err);
                asyncResultFn(result, text);
            });
        },
        {
            asyncResultFn : function (json, text) {
                var transposedJson = [];
                for (var i = 0; i < json.length; i++) {
                    var row = json[i]['row_xyzzy'];
                    for (var j = 0; j < row.length; j++) {
                        if (transposedJson[j] == undefined) {
                            transposedJson[j] = [];
                        }
                        transposedJson[j].push(row[j]);
                    }
                }
                var transposed = json2csv({
                    data : transposedJson
                });
                var lines = transposed.split('\n');
                transposed = lines.slice(1).join('\n');
                $('#csv-transpose-text').val(transposed);
            },
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err);
            }
        }
    );

    // make csv-rows-to-columns work
    //
    mkTool(
        'csv-rows-to-columns',
        function (text, asyncResultFn) {
            text = text.replace("\r\n", "\n");
            var lines = text.split("\n");
            lines.splice(0,0,lines[0]);
            text = lines.join("\n");

            var Converter = window.csvtojson.Converter;
            var converter = new Converter({});
            converter.transform = function (json, row, index) {
                json['rowIndex_xyzzy'] = index;
                json['row_xyzzy'] = row;
            }
            converter.fromString(text, function(err, result){
                if (err) throw new Error(err);
                asyncResultFn(result, text);
            });
        },
        {
            asyncResultFn : function (json, text) {
                var transposedJson = [];
                for (var i = 0; i < json.length; i++) {
                    var row = json[i]['row_xyzzy'];
                    for (var j = 0; j < row.length; j++) {
                        if (transposedJson[j] == undefined) {
                            transposedJson[j] = [];
                        }
                        transposedJson[j].push(row[j]);
                    }
                }
                var transposed = json2csv({
                    data : transposedJson
                });
                var lines = transposed.split('\n');
                transposed = lines.slice(1).join('\n');
                $('#csv-rows-to-columns-text').val(transposed);
            },
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err);
            }
        }
    );

    // make csv-swap-columns work
    //
    mkTool(
        'csv-swap-columns',
        function (text, asyncResultFn) {
            var col1 = $('#csv-swap-columns-col1').val();
            if (!/^\d+$/.test(col1)) {
                throw new Error("Invalid column 1 number");
            }
            var col2 = $('#csv-swap-columns-col2').val();
            if (!/^\d+$/.test(col2)) {
                throw new Error("Invalid column 2 number");
            }
            if (col1 == col2) {
                throw new Error("Can't swap the same column");
            }
            text = text.replace("\r\n", "\n");
            var lines = text.split("\n");
            lines.splice(0,0,lines[0]);
            text = lines.join("\n");

            var Converter = window.csvtojson.Converter;
            var converter = new Converter({});
            converter.transform = function (json, row, index) {
                json['rowIndex_xyzzy'] = index;
                json['row_xyzzy'] = row;
            }
            converter.fromString(text, function(err, result){
                if (err) throw new Error(err);
                asyncResultFn(result, text, col1, col2);
            });
        },
        {
            asyncResultFn : function (json, text, col1, col2) {
                var col1Name = json[0]['row_xyzzy'][col1-1];
                if (col1Name === undefined) {
                    var err = "Column " + col1 + " doesn't exist";
                    $('#action-error').show();
                    $('#action-error').text(err);
                    return;
                }
                var col2Name = json[0]['row_xyzzy'][col2-1];
                if (col2Name === undefined) {
                    var err = "Column " + col2 + " doesn't exist";
                    $('#action-error').show();
                    $('#action-error').text(err);
                    return;
                }
                var swappedJson = [];
                for (var i = 0; i < json.length; i++) {
                    var row = json[i]['row_xyzzy'];
                    var rowCol1 = row[col1-1];
                    var rowCol2 = row[col2-1];
                    row[col1-1] = rowCol2;
                    row[col2-1] = rowCol1;
                    swappedJson.push(row);
                }
                var transposed = json2csv({
                    data : swappedJson
                });
                var lines = transposed.split('\n');
                transposed = lines.slice(1).join('\n');
                $('#csv-swap-columns-text').val(transposed);
            },
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err);
            }
        }
    );

    // make csv-replace-column work
    //
    mkTool(
        'csv-replace-column',
        function (text, asyncResultFn) {
            var col = $('#csv-replace-column-number').val();
            if (!/^\d+$/.test(col)) {
                throw new Error("Invalid column number");
            }
            var newCol = $('#csv-replace-column-new-column').val();

            text = text.replace("\r\n", "\n");
            var lines = text.split("\n");
            lines.splice(0,0,lines[0]);
            text = lines.join("\n");

            var Converter = window.csvtojson.Converter;
            var converter = new Converter({});
            converter.transform = function (json, row, index) {
                json['rowIndex_xyzzy'] = index;
                json['row_xyzzy'] = row;
            }
            converter.fromString(text, function(err, result){
                if (err) throw new Error(err);
                asyncResultFn(result, text, col, newCol);
            });
        },
        {
            asyncResultFn : function (json, text, col, newCol) {
                var colName = json[0]['row_xyzzy'][col-1];
                if (colName === undefined) {
                    var err = "Column " + col + " doesn't exist";
                    $('#action-error').show();
                    $('#action-error').text(err);
                    return;
                }
                if (newCol.length == 0) {
                    // empty new column deletes the column
                    var replacedJson = [];
                    for (var i = 0; i < json.length; i++) {
                        json[i]['row_xyzzy'].splice(col-1,1);
                        replacedJson.push(json[i]['row_xyzzy']);
                    }
                    var replaced = json2csv({
                        data : replacedJson
                    });
                    var lines = replaced.split('\n');
                    replaced = lines.slice(1).join('\n');
                    $('#csv-replace-column-text').val(replaced);
                }
                else {
                    // replace column
                    var newColLines = newCol.split('\n');
                    if (newColLines.length < json.length) {
                        $('#action-error').show();
                        $('#action-error').text('The new column has less rows than the existing CSV. Replacing anyway.');
                        for (var i = 0; i < json.length-newColLines.length; i++) {
                            newColLines.push('');
                        }
                    }
                    if (newColLines.length > json.length) {
                        $('#action-error').show();
                        $('#action-error').text('The new column has more rows than the existing CSV. Replacing anyway.');
                        newColLines.splice(json.length,newColLines.length);
                    }
                    var replacedJson = [];
                    for (var i = 0; i < json.length; i++) {
                        json[i]['row_xyzzy'][col-1] = newColLines[i];
                        replacedJson.push(json[i]['row_xyzzy']);
                    }
                    var replaced = json2csv({
                        data : replacedJson
                    });
                    var lines = replaced.split('\n');
                    replaced = lines.slice(1).join('\n');
                    $('#csv-replace-column-text').val(replaced);
                }
            },
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err);
            }
        }
    );

    // make csv-append-column work
    //
    mkTool(
        'csv-append-column',
        function (text, asyncResultFn) {
            var newCol = $('#csv-append-column-new-column').val();

            text = text.replace("\r\n", "\n");
            var lines = text.split("\n");
            lines.splice(0,0,lines[0]);
            text = lines.join("\n");

            var Converter = window.csvtojson.Converter;
            var converter = new Converter({});
            converter.transform = function (json, row, index) {
                json['rowIndex_xyzzy'] = index;
                json['row_xyzzy'] = row;
            }
            converter.fromString(text, function(err, result){
                if (err) throw new Error(err);
                asyncResultFn(result, text, newCol);
            });
        },
        {
            asyncResultFn : function (json, text, newCol) {
                var newColLines = newCol.split('\n');
                if (newColLines.length < json.length) {
                    $('#action-error').show();
                    $('#action-error').text('The new column has less rows than the existing CSV. Appending anyway.');
                    for (var i = 0; i < json.length-newColLines.length; i++) {
                        newColLines.push('');
                    }
                }
                if (newColLines.length > json.length) {
                    $('#action-error').show();
                    $('#action-error').text('The new column has more rows than the existing CSV. Appending anyway.');
                    newColLines.splice(json.length,newColLines.length);
                }
                var colCount = json[0]['row_xyzzy'].length;
                var appendedJson = [];
                for (var i = 0; i < json.length; i++) {
                    json[i]['row_xyzzy'][colCount] = newColLines[i];
                    appendedJson.push(json[i]['row_xyzzy']);
                }
                var appended = json2csv({
                    data : appendedJson
                });
                var lines = appended.split('\n');
                appended = lines.slice(1).join('\n');
                $('#csv-append-column-text').val(appended);
            },
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err);
            }
        }
    );

    // make csv-insert-column work
    //
    mkTool(
        'csv-insert-column',
        function (text, asyncResultFn) {
            var col = $('#csv-insert-column-number').val();
            if (!/^-?\d+$/.test(col)) {
                throw new Error("Invalid column number");
            }
            var newCol = $('#csv-insert-column-new-column').val();

            text = text.replace("\r\n", "\n");
            var lines = text.split("\n");
            lines.splice(0,0,lines[0]);
            text = lines.join("\n");

            var Converter = window.csvtojson.Converter;
            var converter = new Converter({});
            converter.transform = function (json, row, index) {
                json['rowIndex_xyzzy'] = index;
                json['row_xyzzy'] = row;
            }
            converter.fromString(text, function(err, result){
                if (err) throw new Error(err);
                asyncResultFn(result, text, col, newCol);
            });
        },
        {
            asyncResultFn : function (json, text, col, newCol) {
                if (newCol.length == 0) {
                    // insert an empty column
                    var replacedJson = [];
                    for (var i = 0; i < json.length; i++) {
                        if (col == -1) { // end
                            var colCount = json[i]['row_xyzzy'].length;
                            json[i]['row_xyzzy'].splice(colCount,0,'');
                        }
                        else {
                            json[i]['row_xyzzy'].splice(col-1,0,'');
                        }
                        replacedJson.push(json[i]['row_xyzzy']);
                    }
                    var replaced = json2csv({
                        data : replacedJson
                    });
                    var lines = replaced.split('\n');
                    replaced = lines.slice(1).join('\n');
                    $('#csv-insert-column-text').val(replaced);
                }
                else {
                    // insert column
                    var newColLines = newCol.split('\n');
                    if (newColLines.length < json.length) {
                        $('#action-error').show();
                        $('#action-error').text('The new column has less rows than the existing CSV. Inserting anyway.');
                        for (var i = 0; i < json.length-newColLines.length; i++) {
                            newColLines.push('');
                        }
                    }
                    if (newColLines.length > json.length) {
                        $('#action-error').show();
                        $('#action-error').text('The new column has more rows than the existing CSV. Inserting anyway.');
                        newColLines.splice(json.length,newColLines.length);
                    }
                    var replacedJson = [];
                    for (var i = 0; i < json.length; i++) {
                        if (col == -1) { // end
                            var colCount = json[i]['row_xyzzy'].length;
                            json[i]['row_xyzzy'].splice(colCount,0,newColLines[i]);
                        }
                        else {
                            json[i]['row_xyzzy'].splice(col-1, 0, newColLines[i]);
                        }
                        replacedJson.push(json[i]['row_xyzzy']);
                    }
                    var replaced = json2csv({
                        data : replacedJson
                    });
                    var lines = replaced.split('\n');
                    replaced = lines.slice(1).join('\n');
                    $('#csv-insert-column-text').val(replaced);
                }
            },
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err);
            }
        }
    );

    // make csv-change-delimiter work
    //
    mkTool(
        'csv-change-delimiter',
        function (text, asyncResultFn) {
            var delim = $('#csv-change-delimiter-new-delimiter').val();
            text = text.replace("\r\n", "\n");
            var lines = text.split("\n");
            lines.splice(0,0,lines[0]);
            text = lines.join("\n");

            var Converter = window.csvtojson.Converter;
            var converter = new Converter({});
            converter.fromString(text, function(err, result){
                if (err) throw new Error(err);
                asyncResultFn(result, text, delim);
            });
        },
        {
            asyncResultFn : function (json, text, delim) {
                var newCsv = json2csv({
                    data : json,
                    del : delim
                });
                var lines = newCsv.split('\n');
                newCsv = lines.slice(1).join('\n');
                $('#csv-change-delimiter-text').val(newCsv);
            },
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err);
            }
        }
    );

    // make tsv-change-delimiter work
    //
    mkTool(
        'tsv-change-delimiter',
        function (text) {
            text = text.replace("\r\n", "\n");
            var lines = text.split("\n");
            var delim = $('#tsv-change-delimiter-new-delimiter').val();

            var ret = '';
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                var row = line.split("\t");
                row = row.join(delim);
                ret += row + '\n';
            }
            return ret;
        }
    );

    // make tsv-swap-columns tool work
    //
    mkTool(
        'tsv-swap-columns',
        function (text) {
            var col1 = $('#tsv-swap-columns-col1').val();
            if (!/^\d+$/.test(col1)) {
                throw new Error("Invalid column 1 number");
            }
            var col2 = $('#tsv-swap-columns-col2').val();
            if (!/^\d+$/.test(col2)) {
                throw new Error("Invalid column 2 number");
            }
            if (col1 == col2) {
                throw new Error("Can't swap the same column");
            }
            text = text.replace("\r\n", "\n");
            var lines = text.split("\n");
            var ret = '';
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (line.length) {
                    var cols = line.split("\t");
                    var rowCol1 = cols[col1-1];
                    var rowCol2 = cols[col2-1];
                    cols[col1-1] = rowCol2;
                    cols[col2-1] = rowCol1;

                    ret += cols.join("\t") + "\n";
                }
                else {
                    ret += "\n";
                }
            }
            return ret;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make tsv-columns-to-rows work
    //
    mkTool(
        'tsv-columns-to-rows',
        function (text, asyncResultFn) {
            text = text.replace("\r\n", "\n");
            var lines = text.split("\n");

            var transposed = [];
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                var row = line.split("\t");
                for (var j = 0; j < row.length; j++) {
                    if (transposed[j] == undefined) {
                        transposed[j] = [];
                    }
                    transposed[j].push(row[j]);
                }
            }
            for (var i = 0; i < transposed.length; i++) {
                transposed[i] = transposed[i].join("\t");
            }
            return transposed.join("\n");
        }
    );

    // make tsv-rows-to-columns work
    //
    mkTool(
        'tsv-rows-to-columns',
        function (text, asyncResultFn) {
            text = text.replace("\r\n", "\n");
            var lines = text.split("\n");

            var transposed = [];
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                var row = line.split("\t");
                for (var j = 0; j < row.length; j++) {
                    if (transposed[j] == undefined) {
                        transposed[j] = [];
                    }
                    transposed[j].push(row[j]);
                }
            }
            for (var i = 0; i < transposed.length; i++) {
                transposed[i] = transposed[i].join("\t");
            }
            return transposed.join("\n");
        }
    );

    // make text-columns-to-rows work
    //
    mkTool(
        'text-columns-to-rows',
        function (text, asyncResultFn) {
            text = text.replace("\r\n", "\n");
            var lines = text.split("\n");
            var delim = $('#text-columns-to-rows-delimiter').val();

            var transposed = [];
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (delim == ' ') {
                    var row = line.split(/\s+/g);
                }
                else {
                    var row = line.split(delim);
                }
                for (var j = 0; j < row.length; j++) {
                    if (transposed[j] == undefined) {
                        transposed[j] = [];
                    }
                    transposed[j].push(row[j]);
                }
            }
            for (var i = 0; i < transposed.length; i++) {
                transposed[i] = transposed[i].join(delim);
            }
            return transposed.join("\n");
        }
    );

    // make text-rows-to-columns work
    //
    mkTool(
        'text-rows-to-columns',
        function (text, asyncResultFn) {
            text = text.replace("\r\n", "\n");
            var lines = text.split("\n");
            var delim = $('#text-rows-to-columns-delimiter').val();

            var transposed = [];
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (delim == ' ') {
                    var row = line.split(/\s+/g);
                }
                else {
                    var row = line.split(delim);
                }
                for (var j = 0; j < row.length; j++) {
                    if (transposed[j] == undefined) {
                        transposed[j] = [];
                    }
                    transposed[j].push(row[j]);
                }
            }
            for (var i = 0; i < transposed.length; i++) {
                transposed[i] = transposed[i].join(delim);
            }
            return transposed.join("\n");
        }
    );

    // make tsv-transpose work
    //
    mkTool(
        'tsv-transpose',
        function (text) {
            text = text.replace("\r\n", "\n");
            var lines = text.split("\n");

            var transposed = [];
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                var row = line.split("\t");
                for (var j = 0; j < row.length; j++) {
                    if (transposed[j] == undefined) {
                        transposed[j] = [];
                    }
                    transposed[j].push(row[j]);
                }
            }
            for (var i = 0; i < transposed.length; i++) {
                transposed[i] = transposed[i].join("\t");
            }
            return transposed.join("\n");
        }
    );

    // make text-transpose work
    //
    mkTool(
        'text-transpose',
        function (text) {
            text = text.replace("\r\n", "\n");
            var lines = text.split("\n");
            var delim = $('#text-transpose-delimiter').val();

            var transposed = [];
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (delim == ' ') {
                    var row = line.split(/\s+/g);
                }
                else {
                    var row = line.split(delim);
                }
                for (var j = 0; j < row.length; j++) {
                    if (transposed[j] == undefined) {
                        transposed[j] = [];
                    }
                    transposed[j].push(row[j]);
                }
            }
            for (var i = 0; i < transposed.length; i++) {
                transposed[i] = transposed[i].join(delim);
            }
            return transposed.join("\n");
        }
    );

    // make xml-to-text tool work
    //
    mkTool(
        'xml-to-text',
        function (text) {
            var x2js = new X2JS();
            var converted = x2js.xml_str2json(text);
            return jsonToText(converted);
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make xml-prettify tool work
    //
    mkTool('xml-prettify', function (text) {
        var converted = vkbeautify.xml(text);
        return converted;
    });

    // make xml-minify tool work
    //
    mkTool('xml-minify', function (text) {
        var converted = vkbeautify.xmlmin(text);
        return converted;
    });

    // make mysql-password tool work
    //
    mkTool('mysql-password', function (text) {
        var x1 = CryptoJS.SHA1(text);
        var x2 = CryptoJS.SHA1(x1);
        var pass = '*' + x2;
        return pass.toUpperCase();
    });

    // make mariadb-password tool work (same as mysql)
    //
    mkTool('mariadb-password', function (text) {
        var x1 = CryptoJS.SHA1(text);
        var x2 = CryptoJS.SHA1(x1);
        var pass = '*' + x2;
        return pass.toUpperCase();
    });

    // make postgres-password tool work
    //
    mkTool('postgres-password', function (text) {
        var username = $('#postgres-username').val();
        return 'md5' + CryptoJS.MD5(text.toString() + username.toString());
    });

    // make bcrypt tool world
    //
    mkTool(
        'bcrypt',
        function (text, asyncResultFn) {
            var bcrypt = new bCrypt;
            var pass = $('#bcrypt-pass').val();
            var rounds = $('#bcrypt-rounds').val() || 10;
            bcrypt.hashpw(pass, bcrypt.gensalt(rounds), function (hash) {
                asyncResultFn(hash);
            });
        },
        {
            allowEmptyText : true,
            asyncResultFn : function (result) {
                $('#bcrypt-text').val(result);
            },
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err);
            }
        }
    );

    // make bcrypt-check tool world
    //
    mkTool(
        'bcrypt-check',
        function (text, asyncResultFn) {
            var lines = text.split("\n");
            var bcrypt = new bCrypt;
            var pass = $('#bcrypt-check-pass').val();
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (line.length == 0) {
                    continue;
                }
                (function () {
                    var j = i;
                    bcrypt.checkpw(pass, line, function (result) {
                        asyncResultFn(line, j, result);
                    });
                })();
            }
        },
        {
            asyncResultFn : function (line, lineNr, result) {
                var text = $('#bcrypt-check-text').val();
                var lines = text.split("\n");

                var valid = false;
                if (result == 1) {
                    valid = true;
                }
                if (valid) {
                    lines[lineNr] = "Valid: " + lines[lineNr];
                }
                else {
                    lines[lineNr] = "Invalid: " + lines[lineNr];
                }
                $('#bcrypt-check-text').val(lines.join("\n"));
            },
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err);
            }
        }
    );

    // make scrypt tool world
    //
    if (typeof scrypt_module_factory !== 'undefined') {
        scrypt_module_factory(on_scrypt_ready);
        function on_scrypt_ready(scrypt) {
            mkTool(
                'scrypt',
                function (text) {
                    var pass = $('#scrypt-pass').val();
                    var salt = $('#scrypt-salt').val();
                    var outputSize = $('#scrypt-output-size').val();
                    var n = $('#scrypt-n').val();
                    var r = $('#scrypt-r').val();
                    var p = $('#scrypt-p').val();
                    var out = scrypt.crypto_scrypt(
                        scrypt.encode_utf8(pass),
                        scrypt.encode_utf8(salt),
                        n,
                        r,
                        p,
                        outputSize
                    );
                    return scrypt.to_hex(out);
                },
                {
                    allowEmptyText : true,
                    exceptionFn : function (err) {
                        $('#action-error').show();
                        $('#action-error').text(err.message);
                    }
                }
            );
        }
    }

    // make scrypt-check tool world
    //
    if (typeof scrypt_module_factory !== 'undefined') {
        scrypt_module_factory(on_scrypt_ready);
        function on_scrypt_ready(scrypt) {
            mkTool(
                'scrypt-check',
                function (text) {
                    var lines = text.split("\n");
                    var pass = $('#scrypt-check-pass').val();
                    var salt = $('#scrypt-check-salt').val();
                    var outputSize = $('#scrypt-check-output-size').val();
                    var n = $('#scrypt-check-n').val();
                    var r = $('#scrypt-check-r').val();
                    var p = $('#scrypt-check-p').val();
                    var ret = '';
                    for (var i = 0; i < lines.length; i++) {
                        var line = lines[i];
                        if (line.length == 0) {
                            ret += "\n";
                        }
                        else {
                            var actualHash = scrypt.crypto_scrypt(
                                scrypt.encode_utf8(pass),
                                scrypt.encode_utf8(salt),
                                n,
                                r,
                                p,
                                line.length/2
                            );
                            actualHash = scrypt.to_hex(actualHash);
                            if (actualHash == line) {
                                ret += "Valid: " + line + "\n";
                            }
                            else {
                                ret += "Invalid: " + line + "\n";
                            }
                        }
                    }
                    return ret;
                },
                {
                    exceptionFn : function (err) {
                        $('#action-error').show();
                        $('#action-error').text(err);
                    }
                }
            );
        }
    }

    // make rot13-password tool work
    //
    mkTool('rot13', function (text) {
        return rot(text, 13);
    });

    // make rot47-password tool work
    //
    mkTool('rot47', function (text) {
        var rotAlphabet = "!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";
        var ret = '';
        for (var i = 0; i < text.length; i++) {
            var pos = rotAlphabet.indexOf(text[i])
            if (pos >= 0) {
                var c = rotAlphabet[(pos + 47) % 94];
            }
            else {
                var c = text[i];
            }
            ret += c;
        }
        return ret;
    });

    // make xor-encrypt tool work
    //
    mkTool(
        'xor-encrypt',
        function (text) {
            var pass = $('#xor-encrypt-pass').val();
            if (pass.length == 0) {
                throw new Error("empty pass");
            }

            var encrypted = '';
            for (var i = 0; i < text.length; i++) {
                var char = text[i].charCodeAt(0);
                var passChar = pass[i % pass.length].charCodeAt(0);
                var encChar = (char ^ passChar).toString(16);
                if (encChar.length == 1) {
                    encChar = "0" + encChar;
                }
                encrypted += encChar;
                if (i != text.length-1) {
                    encrypted += "-";
                }
            }

            return encrypted;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err);
            }
        }
    );

    // make xor-decrypt tool work
    //
    mkTool(
        'xor-decrypt',
        function (text) {
            var pass = $('#xor-decrypt-pass').val();
            if (pass.length == 0) {
                throw new Error("empty pass");
            }

            var bytes = text.split('-');
            var decrypted = '';
            for (var i = 0; i < bytes.length; i++) {
                var byte = parseInt(bytes[i], 16);
                var passChar = pass[i % pass.length].charCodeAt(0);
                var decChar = String.fromCharCode(byte ^ passChar);
                decrypted += decChar;
            }

            return decrypted;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err);
            }
        }
    );

    // make aes-encrypt tool work
    //
    mkTool('aes-encrypt', function (text) {
        var pass = $('#aes-encrypt-pass').val();
        var encrypted = CryptoJS.AES.encrypt(text, pass);
        return encrypted;
    });

    // make aes-decrypt tool work
    //
    mkTool('aes-decrypt', function (text) {
        var pass = $('#aes-decrypt-pass').val();
        var decrypted = CryptoJS.AES.decrypt(text, pass);
        var utf8 = CryptoJS.enc.Utf8.stringify(decrypted);
        return utf8;
    });

    // make rc4-encrypt tool work
    //
    mkTool('rc4-encrypt', function (text) {
        var pass = $('#rc4-encrypt-pass').val();
        var encrypted = CryptoJS.RC4.encrypt(text, pass);
        return encrypted;
    });

    // make rc4-decrypt tool work
    //
    mkTool('rc4-decrypt', function (text) {
        var pass = $('#rc4-decrypt-pass').val();
        var decrypted = CryptoJS.RC4.decrypt(text, pass);
        var utf8 = CryptoJS.enc.Utf8.stringify(decrypted);
        return utf8;
    });

    // make des-encrypt tool work
    //
    mkTool('des-encrypt', function (text) {
        var pass = $('#des-encrypt-pass').val();
        var encrypted = CryptoJS.DES.encrypt(text, pass);
        return encrypted;
    });

    // make des-decrypt tool work
    //
    mkTool('des-decrypt', function (text) {
        var pass = $('#des-decrypt-pass').val();
        var decrypted = CryptoJS.DES.decrypt(text, pass);
        var utf8 = CryptoJS.enc.Utf8.stringify(decrypted);
        return utf8;
    });

    // make triple-des-encrypt tool work
    //
    mkTool('triple-des-encrypt', function (text) {
        var pass = $('#triple-des-encrypt-pass').val();
        var encrypted = CryptoJS.TripleDES.encrypt(text, pass);
        return encrypted;
    });

    // make triple-des-decrypt tool work
    //
    mkTool('triple-des-decrypt', function (text) {
        var pass = $('#triple-des-decrypt-pass').val();
        var decrypted = CryptoJS.TripleDES.decrypt(text, pass);
        var utf8 = CryptoJS.enc.Utf8.stringify(decrypted);
        return utf8;
    });

    // make rabbit-encrypt tool work
    //
    mkTool('rabbit-encrypt', function (text) {
        var pass = $('#rabbit-encrypt-pass').val();
        var encrypted = CryptoJS.Rabbit.encrypt(text, pass);
        return encrypted;
    });

    // make rabbit-decrypt tool work
    //
    mkTool('rabbit-decrypt', function (text) {
        var pass = $('#rabbit-decrypt-pass').val();
        var decrypted = CryptoJS.Rabbit.decrypt(text, pass);
        var utf8 = CryptoJS.enc.Utf8.stringify(decrypted);
        return utf8;
    });

    // make all-hashes tool work
    //
    mkTool(
        'all-hashes',
        function (text) {
            // ntlm
            var utf16le = text.split('').join('\x00') + '\x00';
            var ntlmHash = md4(utf16le).toUpperCase();
            $('#hash-ntlm').val(ntlmHash);

            // md2
            var md2Hash = md2(text);
            $('#hash-md2').val(md2Hash);

            // md4
            var md4Hash = md4(text);
            $('#hash-md4').val(md4Hash);

            // md5
            var md5Hash = CryptoJS.MD5(text);
            $('#hash-md5').val(md5Hash);

            // md6
            var md6 = new md6hash();
            var md6Hash128 = md6.hex(text, 128);
            $('#hash-md6-128').val(md6Hash128);
            var md6 = new md6hash();
            var md6Hash256 = md6.hex(text, 256);
            $('#hash-md6-256').val(md6Hash256);
            var md6 = new md6hash();
            var md6Hash512 = md6.hex(text, 512);
            $('#hash-md6-512').val(md6Hash512);

            // ripemd
            var ripemdHash128 = CryptoJS.RIPEMD128(text);
            $('#hash-ripemd-128').val(ripemdHash128);
            var ripemdHash160 = CryptoJS.RIPEMD160(text);
            $('#hash-ripemd-160').val(ripemdHash160);
            var ripemdHash256 = CryptoJS.RIPEMD256(text);
            $('#hash-ripemd-256').val(ripemdHash256);
            var ripemdHash320 = CryptoJS.RIPEMD320(text);
            $('#hash-ripemd-320').val(ripemdHash320);

            // sha1
            var sha1Hash = CryptoJS.SHA1(text);
            $('#hash-sha1').val(sha1Hash);

            // sha3
            var sha3Hash224 = sha3_224(text);
            $('#hash-sha3-224').val(sha3Hash224);
            var sha3Hash256 = sha3_256(text);
            $('#hash-sha3-256').val(sha3Hash256);
            var sha3Hash384 = sha3_384(text);
            $('#hash-sha3-384').val(sha3Hash384);
            var sha3Hash512 = sha3_512(text);
            $('#hash-sha3-512').val(sha3Hash512);

            // sha 224
            var sha224Hash = CryptoJS.SHA224(text);
            $('#hash-sha-224').val(sha224Hash);

            // sha 256
            var sha256Hash = CryptoJS.SHA256(text);
            $('#hash-sha-256').val(sha256Hash);

            // sha 384
            var sha384Hash = CryptoJS.SHA384(text);
            $('#hash-sha-384').val(sha384Hash);

            // sha 512
            var sha512Hash = CryptoJS.SHA512(text);
            $('#hash-sha-512').val(sha512Hash);

            // crc16
            var crc16Hash = crc16(text);
            $('#hash-crc-16').val(crc16Hash);

            // crc32
            var crc32Hash = CRC32.str(text);
            var crc32Hash = (crc32Hash>>>0).toString(16);
            $('#hash-crc-32').val(crc32Hash);

            // adler32
            var hash = ADLER32.str(text);
            var hashHex = (hash>>>0).toString(16);
            var paddingLength = 8 - hashHex.length;
            while (paddingLength-- > 0) {
                hashHex = "0" + hashHex;
            }
            var adler32Hash = hashHex;
            $('#hash-adler-32').val(adler32Hash);

            // whirlpool
            var wirlpoolHash = Whirlpool(text).toLowerCase();
            $('#hash-whirlpool').val(wirlpoolHash);

            return text;
        },
        {
            allowEmptyText : true
        }
    );


    // make ntlm tool work
    //
    mkTool(
        'ntlm-hash',
        function (text) {
            var utf16le = text.split('').join('\x00') + '\x00';
            return md4(utf16le).toUpperCase();
        }
    );

    // make md2 tool work
    //
    mkTool(
        'md2-hash',
        function (text) {
            return md2(text);
        },
        {
            allowEmptyText : true
        }
    );

    // make md4 tool work
    //
    mkTool(
        'md4-hash',
        function (text) {
            return md4(text);
        },
        {
            allowEmptyText : true
        }
    );

    // make md5 tool work
    //
    mkTool(
        'md5-hash',
        function (text) {
            var hash = CryptoJS.MD5(text);
            return hash;
        },
        {
            allowEmptyText : true
        }
    );

    // make md6 tool work
    //
    mkTool(
        'md6-hash',
        function (text) {
            var size = parseInt($('#md6-hash-size').val(), 10);
            var md6 = new md6hash();
            return md6.hex(text, size);
        },
        {
            allowEmptyText : true
        }
    );

    // make ripemd128 tool work
    //
    mkTool(
        'ripemd128-hash',
        function (text) {
            return CryptoJS.RIPEMD128(text);
        },
        {
            allowEmptyText : true
        }
    );

    // make ripemd160 tool work
    //
    mkTool(
        'ripemd160-hash',
        function (text) {
            var hash = CryptoJS.RIPEMD160(text);
            return hash;
        },
        {
            allowEmptyText : true
        }
    );

    // make ripemd256 tool work
    //
    mkTool(
        'ripemd256-hash',
        function (text) {
            var hash = CryptoJS.RIPEMD256(text);
            return hash;
        },
        {
            allowEmptyText : true
        }
    );

    // make ripemd320 tool work
    //
    mkTool(
        'ripemd320-hash',
        function (text) {
            var hash = CryptoJS.RIPEMD320(text);
            return hash;
        },
        {
            allowEmptyText : true
        }
    );

    // make sha1 tool work
    //
    mkTool(
        'sha1-hash',
        function (text) {
            var hash = CryptoJS.SHA1(text);
            return hash;
        },
        {
            allowEmptyText : true
        }
    );

    // make sha2 tool work
    //
    mkTool(
        'sha2-hash',
        function (text) {
            var size = parseInt($('#sha2-hash-size').val(), 10);
            if (size == 224) {
                // sha 224
                var sha224Hash = CryptoJS.SHA224(text);
                return sha224Hash;
            }
            else if (size == 256) {
                // sha 256
                var sha256Hash = CryptoJS.SHA256(text);
                return sha256Hash;
            }
            else if (size == 384) {
                // sha 384
                var sha384Hash = CryptoJS.SHA384(text);
                return sha384Hash;
            }
            else if (size == 512) {
                // sha 512
                var sha512Hash = CryptoJS.SHA512(text);
                return sha512Hash;
            }
            return 'unknown hash size';
        },
        {
            allowEmptyText : true
        }
    );

    // make sha3 tool work
    //
    mkTool(
        'sha3-hash',
        function (text) {
            var size = parseInt($('#sha3-hash-size').val(), 10);
            if (size == 224) {
                var hash = sha3_224(text);
            }
            else if (size == 256) {
                var hash = sha3_256(text);
            }
            else if (size == 384) {
                var hash = sha3_384(text);
            }
            else if (size == 512) {
                var hash = sha3_512(text);
            }
            return hash;
        },
        {
            allowEmptyText : true
        }
    );

    // make sha224 tool work
    //
    mkTool(
        'sha224-hash',
        function (text) {
            var hash = CryptoJS.SHA224(text);
            return hash;
        },
        {
            allowEmptyText : true
        }
    );

    // make sha256 tool work
    //
    mkTool(
        'sha256-hash',
        function (text) {
            var hash = CryptoJS.SHA256(text);
            return hash;
        },
        {
            allowEmptyText : true
        }
    );

    // make sha384 tool work
    //
    mkTool(
        'sha384-hash',
        function (text) {
            var hash = CryptoJS.SHA384(text);
            return hash;
        },
        {
            allowEmptyText : true
        }
    );

    // make sha512 tool work
    //
    mkTool(
        'sha512-hash',
        function (text) {
            var hash = CryptoJS.SHA512(text);
            return hash;
        },
        {
            allowEmptyText : true
        }
    );

    // make crc16 tool work
    //
    mkTool(
        'crc16-hash',
        function (text) {
            return crc16(text);
        },
        {
            allowEmptyText : true
        }
    );

    // make crc32 tool work
    //
    mkTool(
        'crc32-hash',
        function (text) {
            var hash = CRC32.str(text);
            return (hash>>>0).toString(16);
        },
        {
            allowEmptyText : true
        }
    );

    // make adler32 tool work
    //
    mkTool(
        'adler32-hash',
        function (text) {
            var hash = ADLER32.str(text);
            var hashHex = (hash>>>0).toString(16);
            var paddingLength = 8 - hashHex.length;
            while (paddingLength-- > 0) {
                hashHex = "0" + hashHex;
            }
            return hashHex;
        },
        {
            allowEmptyText : true
        }
    );

    // make whirlpool hash tool work
    //
    mkTool(
        'whirlpool-hash',
        function (text) {
            var hash = Whirlpool(text);
            return hash;
        },
        {
            allowEmptyText : true
        }
    );

    // make seconds-to-hms work
    //
    mkTool(
        'seconds-to-hms',
        function (text) {
            text = text.replace(/\r\n/g, '\n');
            var lines = text.split('\n');
            var ret = '';
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (/(\d+)/.test(line)) {
                    var seconds = line;

                    var hours = Math.floor(seconds / 3600);
                    var minutes = Math.floor(seconds / 60);
                    var seconds = seconds % 60;

                    ret += hours + ':' + minutes + ':' + seconds;
                }
                else {
                    ret += line;
                }
                ret += '\n';
            }

            return ret;
        }
    );

    // make hms-to-seconds work
    //
    mkTool(
        'hms-to-seconds',
        function (text) {
            text = text.replace(/\r\n/g, '\n');
            var lines = text.split('\n');
            var ret = '';
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (/(\d+)/.test(line)) {
                    var parts = line.split(':');
                    var hours = parseInt(parts[0], 10);
                    var minutes = parseInt(parts[1], 10);
                    var seconds = parseInt(parts[2], 10);
                    ret += (hours*3600 + minutes*60 + seconds).toString();
                }
                else {
                    ret += line;
                }
                ret += '\n';
            }

            return ret;
        }
    );

    // make seconds-to-human work
    //
    mkTool(
        'seconds-to-human',
        function (text) {
            text = text.replace(/\r\n/g, '\n');
            var lines = text.split('\n');
            var ret = '';
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (/(\d+)/.test(line)) {
                    var years = 0
                    var months = 0;
                    var weeks = 0;
                    var days = 0;
                    var hours = 0;
                    var minutes = 0;
                    var seconds = line;

                    var years = Math.floor(seconds / 60 / 60 / 24 / 7 / 30 / 12);
                    seconds %= (60 * 60 * 24 * 7 * 30 * 12);
                    var months = Math.floor(seconds / 60 / 60 / 24 / 7 / 30);
                    seconds %= (60 * 60 * 24 * 7 * 30);
                    var weeks = Math.floor(seconds / 60 / 60 / 24 / 7);
                    seconds %= (60 * 60 * 24 * 7);
                    var days = Math.floor(seconds / 60 / 60 / 24);
                    seconds %= (60 * 60 * 24);
                    var hours = Math.floor(seconds / 60 / 60);
                    seconds %= (60 * 60);
                    var minutes = Math.floor(seconds / 60);
                    seconds %= (60);

                    function plural(count, singular) {
                        var ret = count;
                        if (count == 1) {
                            ret += ' ' + singular;
                        }
                        else {
                            ret += ' ' + singular + 's';
                        }
                        return ret;
                    }

                    if (years > 0) {
                        ret += plural(years, 'year') + " " + plural(months, 'month') + " " +
                            plural(weeks, 'week') + " " + plural(days, 'day') + " " +
                            plural(hours, 'hour') + " " + plural(minutes, 'minute') + " " +
                            plural(seconds, 'second');
                    }
                    else if (months > 0) {
                        ret += plural(months, 'month') + " " +
                            plural(weeks, 'week') + " " + plural(days, 'day') + " " +
                            plural(hours, 'hour') + " " + plural(minutes, 'minute') + " " +
                            plural(seconds, 'second');
                    }
                    else if (weeks > 0) {
                        ret += plural(weeks, 'week') + " " + plural(days, 'day') + " " +
                            plural(hours, 'hour') + " " + plural(minutes, 'minute') + " " +
                            plural(seconds, 'second');
                    }
                    else if (days > 0) {
                        ret += plural(days, 'day') + " " +
                            plural(hours, 'hour') + " " + plural(minutes, 'minute') + " " +
                            plural(seconds, 'second');
                    }
                    else if (hours > 0) {
                        ret += plural(hours, 'hour') + " " + plural(minutes, 'minute') + " " +
                            plural(seconds, 'second');
                    }
                    else if (minutes > 0) {
                        ret += plural(minutes, 'minute') + " " + plural(seconds, 'second');
                    }
                    else {
                        ret += plural(seconds, 'second');
                    }
                }
                else {
                    ret += line;
                }
                ret += '\n';
            }

            return ret;
        }
    );

    // make base-convert tool work
    //
    mkTool(
        'base-convert',
        function (text) {
            var baseFrom = $('#base-convert-from').val();
            var baseTo = $('#base-convert-to').val();

            text = text.replace(/\r\n/g, '\n');
            var lines = text.split('\n');
            var ret = '';

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (/(\w+)/.test(line)) {
                    var num = parseInt(line, baseFrom);
                    ret += num.toString(baseTo);
                }
                else {
                    ret += line;
                }
                ret += '\n';
            }

            return ret;
        }
    );

    // make hex-to-dec tool work
    //
    mkTool(
        'hex-to-dec',
        function (text) {
            text = text.replace(/\r\n/g, '\n');
            var lines = text.split('\n');
            var ret = '';

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (/(\w+)/.test(line)) {
                    var num = parseInt(line, 16);
                    ret += num.toString(10);
                }
                else {
                    ret += line;
                }
                ret += '\n';
            }

            return ret;
        }
    );

    // make dec-to-hex tool work
    //
    mkTool(
        'dec-to-hex',
        function (text) {
            text = text.replace(/\r\n/g, '\n');
            var lines = text.split('\n');
            var ret = '';

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (/(\w+)/.test(line)) {
                    var num = parseInt(line, 10);
                    ret += "0x" + num.toString(16);
                }
                else {
                    ret += line;
                }
                ret += '\n';
            }

            return ret;
        }
    );

    // make bin-to-dec tool work
    //
    mkTool(
        'bin-to-dec',
        function (text) {
            text = text.replace(/\r\n/g, '\n');
            var lines = text.split('\n');
            var ret = '';

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (/(\w+)/.test(line)) {
                    var num = parseInt(line, 2);
                    ret += num.toString(10);
                }
                else {
                    ret += line;
                }
                ret += '\n';
            }

            return ret;
        }
    );

    // make dec-to-bin tool work
    //
    mkTool(
        'dec-to-bin',
        function (text) {
            text = text.replace(/\r\n/g, '\n');
            var lines = text.split('\n');
            var ret = '';

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (/(\w+)/.test(line)) {
                    var num = parseInt(line, 10);
                    var numBin = num.toString(2);
                    while (numBin.length < 8) {
                        numBin = "0" + numBin;
                    }
                    ret += numBin;
                }
                else {
                    ret += line;
                }
                ret += '\n';
            }

            return ret;
        }
    );

    // make bin-to-oct tool work
    //
    mkTool(
        'bin-to-oct',
        function (text) {
            text = text.replace(/\r\n/g, '\n');
            var lines = text.split('\n');
            var ret = '';

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (/(\w+)/.test(line)) {
                    var num = parseInt(line, 2);
                    ret += num.toString(8);
                }
                else {
                    ret += line;
                }
                ret += '\n';
            }

            return ret;
        }
    );

    // make oct-to-bin tool work
    //
    mkTool(
        'oct-to-bin',
        function (text) {
            text = text.replace(/\r\n/g, '\n');
            var lines = text.split('\n');
            var ret = '';

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (/(\w+)/.test(line)) {
                    var num = parseInt(line, 8);
                    var numBin = num.toString(2);
                    while (numBin.length < 8) {
                        numBin = "0" + numBin;
                    }
                    ret += numBin;
                }
                else {
                    ret += line;
                }
                ret += '\n';
            }

            return ret;
        }
    );

    // make bin-to-hex tool work
    //
    mkTool(
        'bin-to-hex',
        function (text) {
            text = text.replace(/\r\n/g, '\n');
            var lines = text.split('\n');
            var ret = '';

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (/(\w+)/.test(line)) {
                    var num = parseInt(line, 2);
                    ret += "0x" + num.toString(16);
                }
                else {
                    ret += line;
                }
                ret += '\n';
            }

            return ret;
        }
    );

    // make hex-to-bin tool work
    //
    mkTool(
        'hex-to-bin',
        function (text) {
            text = text.replace(/\r\n/g, '\n');
            var lines = text.split('\n');
            var ret = '';

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (/(\w+)/.test(line)) {
                    var num = parseInt(line, 16);
                    var numBin = num.toString(2);
                    while (numBin.length < 8) {
                        numBin = "0" + numBin;
                    }
                    ret += numBin;
                }
                else {
                    ret += line;
                }
                ret += '\n';
            }

            return ret;
        }
    );

    // make oct-to-dec tool work
    //
    mkTool(
        'oct-to-dec',
        function (text) {
            text = text.replace(/\r\n/g, '\n');
            var lines = text.split('\n');
            var ret = '';

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (/(\w+)/.test(line)) {
                    var num = parseInt(line, 8);
                    ret += num.toString(10);
                }
                else {
                    ret += line;
                }
                ret += '\n';
            }

            return ret;
        }
    );

    // make dec-to-oct tool work
    //
    mkTool(
        'dec-to-oct',
        function (text) {
            text = text.replace(/\r\n/g, '\n');
            var lines = text.split('\n');
            var ret = '';

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (/(\w+)/.test(line)) {
                    var num = parseInt(line, 10);
                    ret += num.toString(8);
                }
                else {
                    ret += line;
                }
                ret += '\n';
            }

            return ret;
        }
    );

    // make oct-to-hex tool work
    //
    mkTool(
        'oct-to-hex',
        function (text) {
            text = text.replace(/\r\n/g, '\n');
            var lines = text.split('\n');
            var ret = '';

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (/(\w+)/.test(line)) {
                    var num = parseInt(line, 8);
                    ret += "0x" + num.toString(16);
                }
                else {
                    ret += line;
                }
                ret += '\n';
            }

            return ret;
        }
    );

    // make hex-to-oct tool work
    //
    mkTool(
        'hex-to-oct',
        function (text) {
            text = text.replace(/\r\n/g, '\n');
            var lines = text.split('\n');
            var ret = '';

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (/(\w+)/.test(line)) {
                    var num = parseInt(line, 16);
                    ret += num.toString(8);
                }
                else {
                    ret += line;
                }
                ret += '\n';
            }

            return ret;
        }
    );

    // make oct-to-bcd tool work
    //
    mkTool(
        'oct-to-bcd',
        function (text) {
            text = text.replace(/\r\n/g, '\n');
            var lines = text.split('\n');
            var ret = '';

            var lookup = [
                '0000',
                '0001',
                '0010',
                '0011',
                '0100',
                '0101',
                '0110',
                '0111',
                '1000',
                '1001'
            ];

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                line = line.replace(/^\s+/, '');
                line = line.replace(/\s+$/, '');
                if (/([0-7]+)/i.test(line)) {
                    var dec = parseInt(line, 8).toString();
                    var digits = dec.split('');
                    for (var j = 0; j < digits.length; j++) {
                        ret += lookup[digits[j]].toString();
                    }
                }
                else {
                    ret += line;
                }
                ret += '\n';
            }

            return ret;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make bcd-to-oct tool work
    //
    mkTool(
        'bcd-to-oct',
        function (text) {
            text = text.replace(/\r\n/g, '\n');
            var lines = text.split('\n');
            var ret = '';

            var lookup = {
                '0000' : 0,
                '0001' : 1, 
                '0010' : 2,
                '0011' : 3,
                '0100' : 4,
                '0101' : 5, 
                '0110' : 6,
                '0111' : 7,
                '1000' : 8,
                '1001' : 9
            };

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                line = line.replace(/^\s+/, '');
                line = line.replace(/\s+$/, '');
                line = line.replace(/\s+/g, '');
                if (line.length % 4 != 0) {
                    throw new Error("Input binary isn't grouped by 4 bits.");
                }
                if (/[01]+/.test(line)) {
                    var m = line.match(/[01]{4}/g);
                    var num = '';
                    if (m) {
                        for (var j = 0; j < m.length; j++) {
                            num += lookup[m[j]].toString();
                        }
                        var numInt = parseInt(num);
                        ret += numInt.toString(8);
                    }
                    else {
                        ret += line;
                    }
                }
                else {
                    ret += line;
                }
                ret += '\n';
            }

            return ret;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make hex-to-bcd tool work
    //
    mkTool(
        'hex-to-bcd',
        function (text) {
            text = text.replace(/\r\n/g, '\n');
            var lines = text.split('\n');
            var ret = '';

            var lookup = [
                '0000',
                '0001',
                '0010',
                '0011',
                '0100',
                '0101',
                '0110',
                '0111',
                '1000',
                '1001'
            ];

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                line = line.replace(/^\s+/, '');
                line = line.replace(/\s+$/, '');
                if (/([0-9a-f]+)/i.test(line)) {
                    var dec = parseInt(line, 16).toString();
                    var digits = dec.split('');
                    for (var j = 0; j < digits.length; j++) {
                        ret += lookup[digits[j]].toString();
                    }
                }
                else {
                    ret += line;
                }
                ret += '\n';
            }

            return ret;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make bcd-to-hex tool work
    //
    mkTool(
        'bcd-to-hex',
        function (text) {
            text = text.replace(/\r\n/g, '\n');
            var lines = text.split('\n');
            var ret = '';

            var lookup = {
                '0000' : 0,
                '0001' : 1, 
                '0010' : 2,
                '0011' : 3,
                '0100' : 4,
                '0101' : 5, 
                '0110' : 6,
                '0111' : 7,
                '1000' : 8,
                '1001' : 9
            };

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                line = line.replace(/^\s+/, '');
                line = line.replace(/\s+$/, '');
                line = line.replace(/\s+/g, '');
                if (line.length % 4 != 0) {
                    throw new Error("Input binary isn't grouped by 4 bits.");
                }
                if (/[01]+/.test(line)) {
                    var m = line.match(/[01]{4}/g);
                    var num = '';
                    if (m) {
                        for (var j = 0; j < m.length; j++) {
                            num += lookup[m[j]].toString();
                        }
                        var numInt = parseInt(num);
                        ret += numInt.toString(16);
                    }
                    else {
                        ret += line;
                    }
                }
                else {
                    ret += line;
                }
                ret += '\n';
            }

            return ret;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make oct-to-gray tool work
    //
    mkTool(
        'oct-to-gray',
        function (text) {
            text = text.replace(/\r\n/g, '\n');
            var lines = text.split('\n');
            var ret = '';

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                line = line.replace(/^\s+/, '');
                line = line.replace(/\s+$/, '');
                if (/(\d+)/.test(line)) {
                    var num = parseInt(line, 8);
                    var gray = (num ^ (num >> 1)).toString(2);
                    while (gray.length < 8) {
                        gray = "0" + gray;
                    }
                    ret += gray;
                }
                ret += '\n';
            }

            return ret;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make gray-to-oct tool work
    //
    mkTool(
        'gray-to-oct',
        function (text) {
            text = text.replace(/\r\n/g, '\n');
            var lines = text.split('\n');
            var ret = '';

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                line = line.replace(/^\s+/, '');
                line = line.replace(/\s+$/, '');
                if (/[01]+/.test(line)) {
                    var num = parseInt(line, 2);
                    for (var mask = num >> 1; mask != 0; mask = mask >> 1) {
                        num = num ^ mask;
                    }
                    ret += "0" + num.toString(8);
                }
                else {
                    ret += line;
                }
                ret += '\n';
            }

            return ret;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make dec-to-gray tool work
    //
    mkTool(
        'dec-to-gray',
        function (text) {
            text = text.replace(/\r\n/g, '\n');
            var lines = text.split('\n');
            var ret = '';

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                line = line.replace(/^\s+/, '');
                line = line.replace(/\s+$/, '');
                if (/(\d+)/.test(line)) {
                    var num = parseInt(line, 10);
                    var gray = (num ^ (num >> 1)).toString(2);
                    while (gray.length < 8) {
                        gray = "0" + gray;
                    }
                    ret += gray;
                }
                ret += '\n';
            }

            return ret;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make gray-to-dec tool work
    //
    mkTool(
        'gray-to-dec',
        function (text) {
            text = text.replace(/\r\n/g, '\n');
            var lines = text.split('\n');
            var ret = '';

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                line = line.replace(/^\s+/, '');
                line = line.replace(/\s+$/, '');
                if (/[01]+/.test(line)) {
                    var num = parseInt(line, 2);
                    for (var mask = num >> 1; mask != 0; mask = mask >> 1) {
                        num = num ^ mask;
                    }
                    ret += num.toString();
                }
                else {
                    ret += line;
                }
                ret += '\n';
            }

            return ret;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make bin-to-gray tool work
    //
    mkTool(
        'bin-to-gray',
        function (text) {
            text = text.replace(/\r\n/g, '\n');
            var lines = text.split('\n');
            var ret = '';

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                line = line.replace(/^\s+/, '');
                line = line.replace(/\s+$/, '');
                if (/(\d+)/.test(line)) {
                    var num = parseInt(line, 2);
                    var gray = (num ^ (num >> 1)).toString(2);
                    while (gray.length < 8) {
                        gray = "0" + gray;
                    }
                    ret += gray;
                }
                ret += '\n';
            }

            return ret;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make gray-to-bin tool work
    //
    mkTool(
        'gray-to-bin',
        function (text) {
            text = text.replace(/\r\n/g, '\n');
            var lines = text.split('\n');
            var ret = '';

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                line = line.replace(/^\s+/, '');
                line = line.replace(/\s+$/, '');
                if (/[01]+/.test(line)) {
                    var num = parseInt(line, 2);
                    for (var mask = num >> 1; mask != 0; mask = mask >> 1) {
                        num = num ^ mask;
                    }
                    var bin = num.toString(2);
                    while (bin.length < 8) {
                        bin = "0" + bin;
                    }
                    ret += bin;
                }
                else {
                    ret += line;
                }
                ret += '\n';
            }

            return ret;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make hex-to-gray tool work
    //
    mkTool(
        'hex-to-gray',
        function (text) {
            text = text.replace(/\r\n/g, '\n');
            var lines = text.split('\n');
            var ret = '';

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                line = line.replace(/^\s+/, '');
                line = line.replace(/\s+$/, '');
                line = line.replace(/^0x/i, '');
                if (/[0-9a-f]/i.test(line)) {
                    var num = parseInt(line, 16);
                    var gray = (num ^ (num >> 1)).toString(2);
                    while (gray.length < 8) {
                        gray = "0" + gray;
                    }
                    ret += gray;
                }
                ret += '\n';
            }

            return ret;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make gray-to-hex tool work
    //
    mkTool(
        'gray-to-hex',
        function (text) {
            text = text.replace(/\r\n/g, '\n');
            var lines = text.split('\n');
            var ret = '';

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                line = line.replace(/^\s+/, '');
                line = line.replace(/\s+$/, '');
                if (/[01]+/.test(line)) {
                    var num = parseInt(line, 2);
                    for (var mask = num >> 1; mask != 0; mask = mask >> 1) {
                        num = num ^ mask;
                    }
                    ret += "0x" + num.toString(16);
                }
                else {
                    ret += line;
                }
                ret += '\n';
            }

            return ret;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make roman-to-decimal tool work
    //
    mkTool(
        'roman-to-decimal',
        function (text) {
            text = text.replace(/\r\n/g, '\n');
            var lines = text.split('\n');
            var ret = '';

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (/[ivxlcdm]+/i.test(line)) {
                    ret += toArabic(line);
                }
                else {
                    ret += line;
                }
                ret += '\n';
            }

            return ret;
        }
    );

    // make decimal-to-roman tool work
    //
    mkTool(
        'decimal-to-roman',
        function (text) {
            text = text.replace(/\r\n/g, '\n');
            var lines = text.split('\n');
            var ret = '';

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (/[0-9]+/i.test(line)) {
                    ret += toRoman(line);
                }
                else {
                    ret += line;
                }
                ret += '\n';
            }

            return ret;
        }
    );

    // make markdown-to-html tool work
    //
    mkTool('markdown-to-html', function (text) {
        var converter = new showdown.Converter();
        var html = converter.makeHtml(text);
        return html;
    });

    // make text-to-binary tool work
    //
    mkTool('text-to-binary', function (text) {
        var bytes = [];
        for (var i = 0; i < text.length; i++) {
            var realBytes = unescape(encodeURIComponent(text[i]));
            for (var j = 0; j < realBytes.length; j++) {
                bytes.push(realBytes[j].charCodeAt(0));
            }
        }

        var converted = '';
        var textToBinFormat = $('#text-to-binary-format-field input').val();
        for (var i = 0; i < bytes.length; i++) {
            var byte = bytes[i];
            var binByte = byte.toString(2);
            var binBytePadded = binByte;
            while (binBytePadded.length < 8) {
                binBytePadded = '0' + binBytePadded.toString();
            }
            var char = textToBinFormat;

            char = char.replace(/%0b/g, binBytePadded);
            char = char.replace(/%b/g, binByte);
            converted += char;
        }

        return converted;
    });

    // make text-to-binary format work
    $('#text-to-binary-format').click(function (ev) {
        ev.preventDefault();
        $('#text-to-binary-format-field').slideToggle();
    });

    // make binary-to-text tool work
    //
    mkTool(
        'binary-to-text',
        function (text) {
            text = text.replace(/\s+/g, ' ');
            bytes = text.split(' ');
            for (var i = 0; i < bytes.length; i++) {
                if (bytes[i].length < 8) {
                    for (var j = bytes[i].length; j != 8; j++) {
                        bytes[i] = "0" + bytes[i];
                    }
                }
            }
            text = bytes.join('');
            if (text.length % 8 != 0) {
                throw new Error('Input binary doesnt split into groups of 8 bits evenly.');
            }
            var ret = '';
            for (var i = 0; i < text.length; i+=8) {
                ret += String.fromCharCode(parseInt(text.substr(i, 8), 2));
            }
            return ret;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make text-to-octal tool work
    //
    mkTool('text-to-octal', function (text) {
        var bytes = [];
        for (var i = 0; i < text.length; i++) {
            var realBytes = unescape(encodeURIComponent(text[i]));
            for (var j = 0; j < realBytes.length; j++) {
                bytes.push(realBytes[j].charCodeAt(0));
            }
        }

        var converted = '';
        var textToOctFormat = $('#text-to-octal-format-field input').val();
        for (var i = 0; i < bytes.length; i++) {
            var byte = bytes[i];
            var octByte = byte.toString(8);
            var char = textToOctFormat;

            char = char.replace(/%o/g, octByte);
            converted += char;
        }

        return converted;
    });

    // make text-to-octal format work
    $('#text-to-octal-format').click(function (ev) {
        ev.preventDefault();
        $('#text-to-octal-format-field').slideToggle();
    });

    // make octal-to-text tool work
    //
    mkTool(
        'octal-to-text',
        function (text) {
            text = text.replace(/\s+/g, ' ');
            bytes = text.split(' ');
            for (var i = 0; i < bytes.length; i++) {
                if (bytes[i].length < 3) {
                    for (var j = bytes[i].length; j != 3; j++) {
                        bytes[i] = "0" + bytes[i];
                    }
                }
            }
            text = bytes.join('');
            if (text.length % 3 != 0) {
                throw new Error('Input octal doesnt split into groups of 3 digits evenly.');
            }
            var ret = '';
            for (var i = 0; i < text.length; i+=3) {
                ret += String.fromCharCode(parseInt(text.substr(i, 3), 8));
            }
            return ret;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make text-to-ascii tool work
    //
    mkTool('text-to-ascii', function (text) {
        var bytes = [];
        for (var i = 0; i < text.length; i++) {
            var realBytes = unescape(encodeURIComponent(text[i]));
            for (var j = 0; j < realBytes.length; j++) {
                bytes.push(realBytes[j].charCodeAt(0));
            }
        }

        var converted = '';
        var textToDecFormat = "%d ";
        for (var i = 0; i < bytes.length; i++) {
            var byte = bytes[i];
            var decByte = byte.toString(10);
            var char = textToDecFormat;

            char = char.replace(/%d/g, decByte);
            converted += char;
        }

        return converted;
    });

    // make ascii-to-text tool work
    //
    mkTool(
        'ascii-to-text',
        function (text) {
            text = text.replace(/\s+/g, ' ');
            bytes = text.split(' ');
            var ret = '';
            for (var i = 0; i < bytes.length; i++) {
                ret += String.fromCharCode(bytes[i]);
            }
            return ret;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make text-to-decimal format work
    $('#text-to-decimal-format').click(function (ev) {
        ev.preventDefault();
        $('#text-to-decimal-format-field').slideToggle();
    });

    // make text-to-decimal tool work
    //
    mkTool('text-to-decimal', function (text) {
        var bytes = [];
        for (var i = 0; i < text.length; i++) {
            var realBytes = unescape(encodeURIComponent(text[i]));
            for (var j = 0; j < realBytes.length; j++) {
                bytes.push(realBytes[j].charCodeAt(0));
            }
        }

        var converted = '';
        var textToDecFormat = $('#text-to-decimal-format-field input').val();
        for (var i = 0; i < bytes.length; i++) {
            var byte = bytes[i];
            var decByte = byte.toString(10);
            var char = textToDecFormat;

            char = char.replace(/%d/g, decByte);
            converted += char;
        }

        return converted;
    });

    // make decimal-to-text tool work
    //
    mkTool(
        'decimal-to-text',
        function (text) {
            text = text.replace(/\s+/g, ' ');
            bytes = text.split(' ');
            var ret = '';
            for (var i = 0; i < bytes.length; i++) {
                ret += String.fromCharCode(bytes[i]);
            }
            return ret;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make text-to-hex tool work
    //
    mkTool('text-to-hex', function (text) {
        var bytes = [];
        for (var i = 0; i < text.length; i++) {
            var realBytes = unescape(encodeURIComponent(text[i]));
            for (var j = 0; j < realBytes.length; j++) {
                bytes.push(realBytes[j].charCodeAt(0));
            }
        }

        var converted = '';
        var textToHexFormat = $('#text-to-hex-format-field input').val();
        for (var i = 0; i < bytes.length; i++) {
            var byte = bytes[i];
            var hexByte = byte.toString(16);
            if (hexByte.length == 1) {
                hexByte = '0' + hexByte;
            }
            var char = textToHexFormat;
            char = char.replace(/%x/g, hexByte);
            converted += char;
        }

        return converted;
    });

    // make text-to-hex format work
    $('#text-to-hex-format').click(function (ev) {
        ev.preventDefault();
        $('#text-to-hex-format-field').slideToggle();
    });

    // make hex-to-text tool work
    //
    mkTool(
        'hex-to-text',
        function (text) {
            text = text.replace(/0x/g, '');
            text = text.replace(/\s+/g, ' ');
            bytes = text.split(' ');
            for (var i = 0; i < bytes.length; i++) {
                if (bytes[i].length == 1) {
                    bytes[i] = "0" + bytes[i];
                }
            }
            text = bytes.join('');
            if (text.length % 2 != 0) {
                throw new Error('Uneven number of hex characters.');
            }
            var ret = '';
            for (var i = 0; i < text.length; i+=2) {
                ret += String.fromCharCode(parseInt(text.substr(i, 2), 16));
            }
            return ret;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make text-lowercase tool work
    //
    mkTool('text-lowercase', function (text) {
        var ret = '';
        for (var i = 0; i < text.length; i++) {
            ret += text[i].toLowerCase();
        }
        return ret;
    });

    // make text-uppercase tool work
    //
    mkTool('text-uppercase', function (text) {
        var ret = '';
        for (var i = 0; i < text.length; i++) {
            ret += text[i].toUpperCase();
        }
        return ret;
    });

    // make text-titlecase tool work
    //
    mkTool('text-titlecase', function (text) {
        text = text.toLowerCase();
        return titleCase(text);
    });

    // make text-capitalize tool work
    //
    mkTool('text-capitalize', function (text) {
        // todo: handle tabs
        var ret = '';
        text = text.replace(/\r\n/, '\n');
        var lines = text.split('\n');
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var words = line.split(' ');
            for (var j = 0; j < words.length; j++) {
                words[j] = words[j].charAt(0).toUpperCase() + words[j].substring(1);
            }
            lines[i] = words.join(' ');
        }
        return lines.join('\n');
    });

    // make text-invert-case tool work
    //
    mkTool('text-invert-case', function (text) {
        var ret = '';
        for (var i = 0; i < text.length; i++) {
            var isLower = text[i].toLowerCase() == text[i];
            if (isLower) {
                ret += text[i].toUpperCase();
            }
            else {
                ret += text[i].toLowerCase();
            }
        }
        return ret;
    });

    // make text-randomcase tool work
    //
    mkTool('text-randomcase', function (text) {
        var ret = '';
        for (var i = 0; i < text.length; i++) {
            var char = text[i].toLowerCase();
            if (Math.random()<0.5) {
                ret += char;
            }
            else {
                ret += char.toUpperCase();
            }
        }
        return ret;
    });

    // make text-transform tool work
    //
    mkTool('text-transform', function (text) {
        var bytes = [];
        var converted = '';
        var textToHexFormat = $('#text-transform-format-field input').val();

        for (var i = 0; i < text.length; i++) {
            var realBytes = unescape(encodeURIComponent(text[i]));

            if (realBytes.length > 1) {
                var multibyteChar = text[i];
                var hexmbChar = '';
                var octmbChar = '';
                var binmbChar = '';
                var decmbChar = '';

                for (var j = 0; j < realBytes.length; j++) {
                    var byte = realBytes[j].charCodeAt(0);
                    var hexByte = byte.toString(16);
                    var octByte = byte.toString(8);
                    var binByte = byte.toString(2);
                    var decByte = byte.toString();
                    hexmbChar += hexByte;
                    octmbChar += octByte;
                    binmbChar += binByte;
                    decmbChar += decByte;
                }

                var char = textToHexFormat;
                char = char.replace(/%x/g, hexmbChar);
                char = char.replace(/%o/g, octmbChar);
                char = char.replace(/%b/g, binmbChar);
                char = char.replace(/%d/g, decmbChar);
                char = char.replace(/%_/g, multibyteChar);
                char = char.replace(/%c/g, multibyteChar.toLowerCase());
                char = char.replace(/%C/g, multibyteChar.toUpperCase());
                char = char.replace(/%~/g, 
                    multibyteChar.toUpperCase() == multibyteChar ?
                    multibyteChar.toLowerCase() :
                    multibyteChar.toUpperCase()
                );
                char = char.replace(/\\n/g, "\n");

                converted += char;
            }
            else {
                var byte = text[i].charCodeAt(0);
                var hexByte = byte.toString(16);
                var octByte = byte.toString(8);
                var binByte = byte.toString(2);
                var decByte = byte.toString();
                var char = textToHexFormat;
                char = char.replace(/%x/g, hexByte);
                char = char.replace(/%o/g, octByte);
                char = char.replace(/%b/g, binByte);
                char = char.replace(/%d/g, decByte);
                char = char.replace(/%_/g, text[i]);
                char = char.replace(/%c/g, text[i].toLowerCase());
                char = char.replace(/%C/g, text[i].toUpperCase());
                char = char.replace(/%~/g, 
                    text[i].toUpperCase() == text[i] ?
                    text[i].toLowerCase() :
                    text[i].toUpperCase()
                );
                char = char.replace(/\\n/g, "\n");
                converted += char;
            }
        }

        return converted;
    });

    // make spaces-to-tabs work
    //
    mkTool('spaces-to-tabs', function (text) {
        var spaceCount = $('#spaces-to-tabs-count').val();
        var rx = new RegExp(" {" + spaceCount + "}", "g");
        return text.replace(rx, "\t");
    });

    // make tabs-to-spaces work
    //
    mkTool('tabs-to-spaces', function (text) {
        var spaceCount = $('#tabs-to-spaces-count').val();
        var spaceStr = '';
        for (var i = 1; i <= spaceCount; i++) {
            spaceStr += ' ';
        }
        return text.replace(/\t/g, spaceStr);
    });

    // make spaces-to-newlines work
    //
    mkTool('spaces-to-newlines', function (text) {
        return text.replace(/\s+/g, "\n");
    });

    // make newlines-to-spaces work
    //
    mkTool('newlines-to-spaces', function (text) {
        text = text.replace(/\r\n/g, '\n');
        var lines = text.split('\n');
        var retLines = [];
        for (var i = 0; i < lines.length; i++) {
            if (/\w/.test(lines[i])) {
                retLines.push(lines[i]);
            }
        }
        return retLines.join(' ');
    });

    // make add-slashes work
    //
    mkTool('add-slashes', function (text) {
        text = text.replace(/\\/g, '\\\\');
        text = text.replace(/\t/g, '\\t');
        text = text.replace(/\n/g, '\\n');
        text = text.replace(/'/g, "\\'");
        text = text.replace(/"/g, '\\"');
        return text;
    });

    // make strip-slashes work
    //
    mkTool('strip-slashes', function (text) {
        return text.replace(/\\(.?)/g, function (match, char) {
            if (char == '\\') return '\\';
            if (char == 't') return '\t';
            if (char == 'n') return '\n';
            if (char == '') return '';
            return char;
        });
    });

    // make remove-accents work
    //
    mkTool('remove-accents', function (text) {
        text = removeAccents(text);
        return text;
    });

    // make remove-whitespace work
    //
    mkTool('remove-whitespace', function (text) {
        text = text.replace(/ +/g, ' ');
        text = text.replace(/\t+/g, ' ');
        text = text.replace(/^\s+/g, '');
        text = text.replace(/\s+$/g, '');
        return text;
    });

    // make remove-all-whitespace work
    //
    mkTool('remove-all-whitespace', function (text) {
        text = text.replace(/\s+/g, '');
        return text;
    });

    // make remove-punctuation work
    //
    mkTool('remove-punctuation', function (text) {
        var puntuationRe = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/g;
        text = text.replace(puntuationRe, '');
        return text;
    });

    // make text-repeat tool work
    //
    mkTool('text-repeat', function (text) {
        var count = $('#text-repeat-count').val();
        var ret = '';
        for (var i = 1; i <= count; i++) {
            ret += text;
        }
        return ret;
    });

    // make text-right-align tool work
    //
    mkTool('text-right-align', function (text) {
        var lines = text.split("\n");
        var longestLine = 0;
        for (var i = 0; i < lines.length; i++) {
            if (lines[i].length > longestLine) {
                longestLine = lines[i].length;
            }
        }

        ret = '';
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var padLength = longestLine - line.length;

            var newLine = line;
            for (var j = 0; j < padLength; j++) {
                newLine = ' ' + newLine.toString();
            }
            ret += newLine + "\n";
        }
        return ret;
    });

    // make text-left-pad tool work
    //
    mkTool('text-left-pad', function (text) {
        var width = $('#text-left-pad-width').val();
        var symbol = $('#text-left-pad-symbol').val();
        var lines = text.split("\n");
        ret = '';
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (line.length >= width) {
                ret += line;
            }
            else {
                var padLength = width - line.length;

                var newLine = line;
                for (var j = 0; j < padLength; j++) {
                    newLine = symbol.toString() + newLine.toString();
                }
                ret += newLine;
            }
            ret += "\n";
        }
        return ret;
    });

    // make text-right-pad tool work
    //
    mkTool('text-right-pad', function (text) {
        var width = $('#text-right-pad-width').val();
        var symbol = $('#text-right-pad-symbol').val();
        var lines = text.split("\n");
        ret = '';
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (line.length >= width) {
                ret += line;
            }
            else {
                var padLength = width - line.length;

                var newLine = line;
                for (var j = 0; j < padLength; j++) {
                    newLine += symbol.toString();
                }
                ret += newLine;
            }
            ret += "\n";
        }
        return ret;
    });

    // make text-justify tool work
    //
    mkTool('text-justify', function (text) {
        var lines = text.split("\n");
        var maxLineLen = 0;
        for (var i = 0; i < lines.length; i++) {
            if (lines[i].length > maxLineLen) {
                maxLineLen = lines[i].length;
            }
        }

        ret = '';
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (line.length == 0) {
                ret += "\n";
            }
            else if (line.length == maxLineLen) {
                ret += line + "\n";
            }
            else {
                var words = line.split(/\s+/g);
                if (words[0] == '') {
                    words.shift();
                }
                if (words[words.length-1] == '') {
                    words.pop();
                }

                if (words.length == 0) {
                    ret += "\n";
                }
                else if (words.length == 1) {
                    ret += words[0] + "\n";
                }
                else {
                    var spaces = words.length-1;
                    var joinedLineLen = words.join(' ').length;
                    var padLen = maxLineLen - joinedLineLen;
                    var padLenLeft = padLen;
                    
                    var justifiedLine = '';
                    for (var j = 0; j < words.length; j++) {
                        justifiedLine += words[j];
                        if (j != words.length-1) {
                            if (words.length-2 >= 0 && j == words.length-2) {
                                var extraSpaces = padLenLeft;
                            }
                            else {
                                var extraSpaces = parseInt(Math.random() * (padLenLeft + 1), 10)
                            }
                            padLenLeft -= extraSpaces;
                            justifiedLine += ' ';
                            for (var k = 1; k <= extraSpaces; k++) {
                                justifiedLine += ' ';
                            }
                        }
                    }
                    ret += justifiedLine + "\n";
                }
            }
        }
        return ret;
    });

    // make text-format-columns tool work
    //
    mkTool(
        'text-format-columns',
        function (text) {
            text = text.replace("\r\n", "\n");
            var lines = text.split("\n");
            var ret = '';
            var maxColLens = [];
            for (var row = 0; row < lines.length; row++) {
                var cols = lines[row].split(/\s+/g);
                for (var col = 0; col < cols.length; col++) {
                    if (maxColLens[col] === undefined) {
                        maxColLens[col] = 0;
                    }
                    if (cols[col].length > maxColLens[col]) {
                        maxColLens[col] = cols[col].length;
                    }
                }
            }
            for (var row = 0; row < lines.length; row++) {
                var cols = lines[row].split(/\s+/g);
                for (var col = 0; col < cols.length; col++) {
                    if (cols[col].length < maxColLens[col]) {
                        var extraSpaceCount = maxColLens[col] - cols[col].length;
                        for (var i = 0; i < extraSpaceCount; i++) {
                            cols[col] += ' ';
                        }
                    }
                    ret += cols[col] + ' ';
                }
                ret += "\n";
            }
            return ret;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );

    // make text-replace tool work
    //
    mkTool('text-replace', function (text) {
        var replaceFrom = $('#text-replace-from').val();
        var replaceTo = $('#text-replace-to').val();
        if (replaceTo == "\\n") {
            replaceTo = "\n";
        }
        else if (replaceTo == "\\t") {
            replaceTo = "\t";
        }
        return text.split(replaceFrom).join(replaceTo);
    });

    // make text-reverse tool work
    //
    mkTool('text-reverse', function (text) {
        return text.split('').reverse().join('');
    });

    // make text-length tool work
    //
    mkTool('text-length', function (text) {
        return text.length;
    });

    // make text-truncate tool work
    //
    mkTool('text-truncate', function (text) {
        var lines = text.split("\n");
        var truncateLength = $('#text-truncate-length').val();
        ret = '';
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (line.length > truncateLength) {
                line = line.substr(0, truncateLength);
            }
            ret += line + '\n';
        }
        return ret;
    });

    // make text-trim tool work
    //
    mkTool('text-trim', function (text) {
        var lines = text.split("\n");
        ret = '';
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            line = line.replace(/^\s+/g, '');
            line = line.replace(/\s+$/g, '');
            ret += line + '\n';
        }
        return ret;
    });

    // make merge-lists tool work
    //
    mkTool('merge-lists', function (text) {
        var list1 = text.split('\n');
        var list2 = $('#merge-lists-text2').val().split('\n');
        var delim = $('#merge-lists-delimiter').val();

        var ret = '';
        for (var i = 0; i < list1.length; i++) {
            var el1 = list1[i];
            var el2 = list2[i];
            if (el2 === undefined) {
                break;
            }
            ret += el1 + '' + delim + '' + el2 + '\n';
        }

        return ret;
    });

    // make zip-lists tool work
    //
    mkTool('zip-lists', function (text) {
        var list1 = text.split('\n');
        var list2 = $('#zip-lists-text2').val().split('\n');

        var ret = '';
        for (var i = 0; i < list1.length; i++) {
            var el1 = list1[i];
            var el2 = list2[i];
            if (el2 === undefined) {
                break;
            }
            ret += el1 + '\n';
            ret += el2 + '\n';
        }

        return ret;
    });

    // make common-elements tool work
    //
    mkTool('common-elements', function (text) {
        var list1 = text.split('\n');
        var list2 = $('#common-elements-text2').val().split('\n');

        var list1Hash = {};
        for (var i = 0; i < list1.length; i++) {
            var el1 = list1[i];
            list1Hash[el1] = 1;
        }

        var ret = '';
        for (var i = 0; i < list2.length; i++) {
            var el2 = list2[i];
            if (list1Hash[el2] !== undefined) {
                ret += el2 + '\n';
            }
        }

        $('#common-elements-text2').val('')

        return ret;
    });

    // make distinct-elements tool work
    //
    mkTool('distinct-elements', function (text) {
        var list1 = text.split('\n');
        var list2 = $('#distinct-elements-text2').val().split('\n');

        var list1Hash = {};
        for (var i = 0; i < list1.length; i++) {
            var el1 = list1[i];
            list1Hash[el1] = 1;
        }

        var list2Hash = {};
        for (var i = 0; i < list2.length; i++) {
            var el2 = list2[i];
            list2Hash[el2] = 1;
        }

        var ret = '';
        for (var i = 0; i < list1.length; i++) {
            var el1 = list1[i];
            if (list1Hash[el1] === undefined && list2Hash[el1] !== undefined) {
                ret += el1 + '\n';
            }
            else if (list1Hash[el1] !== undefined && list2Hash[el1] === undefined) {
                ret += el1 + '\n';
            }
        }
        for (var i = 0; i < list2.length; i++) {
            var el2 = list2[i];
            if (list1Hash[el2] === undefined && list2Hash[el2] !== undefined) {
                ret += el2 + '\n';
            }
            else if (list1Hash[el2] !== undefined && list2Hash[el2] === undefined) {
                ret += el2 + '\n';
            }
        }

        $('#distinct-elements-text2').val('')

        return ret;
    });

    // make grep tool work
    //
    mkTool('grep', function (text) {
        var regex = $('#grep-regex').val();
        var invertMatches = $('#grep-invert').is(':checked');
        var regexParts = regex.match(/^\/(.*?)\/([gimuy]*)$/);
        if (regexParts) {
            var r = new RegExp(regexParts[1], regexParts[2]);
        } else {
            var r = new RegExp(regex);
        }
        text = text.replace(/\r\n/g, '\n');
        var lines = text.split('\n');
        var ret = '';
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (invertMatches) {
                if (!r.test(line)) {
                    ret += line + "\n";
                }
            }
            else {
                if (r.test(line)) {
                    ret += line + "\n";
                }
            }
        }
        return ret;
    });

    // make printf tool work
    //
    mkTool(
        'printf',
        function (text) {
            var format = $('#printf-format').val();
            text = text.replace(/\r\n/g, '\n');
            var lines = text.split('\n');
            var ret = '';
            for (var i = 0; i < lines.length; i++) {
                if (lines[i].length) {
                    var lineArgs = lines[i].split(/\s+/);
                    var fmtArgs = lineArgs;
                    fmtArgs.unshift(format);
                    try {
                        var formattedLine = sprintf.apply(null, fmtArgs);
                        ret += formattedLine + '\n';
                    }
                    catch (e) {
                        throw new Error(e.toString() + " (line " + (i+1) + ")");
                    }
                }
                else {
                    ret += '\n';
                }
            }
            return ret;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err);
            }
        }
    );

    // make head tool work
    //
    mkTool('head', function (text) {
        var howMany = $('#head-how-many').val();
        text = text.replace(/\r\n/g, '\n');
        var lines = text.split('\n');
        var ret = '';
        for (var i = 0; i < howMany; i++) {
            if (i >= lines.length) {
                break;
            }
            ret += lines[i] + "\n";
        }
        return ret;
    });

    // make tail tool work
    //
    mkTool('tail', function (text) {
        var howMany = $('#tail-how-many').val();
        text = text.replace(/\r\n/g, '\n');
        var lines = text.split('\n');
        lines = lines.reverse();
        var ret = [];
        for (var i = 0; i < howMany; i++) {
            if (i >= lines.length) {
                break;
            }
            ret.push(lines[i]);
        }
        ret = ret.reverse();
        return ret.join('\n');
    });

    // make extract-lines tool work
    //
    mkTool('extract-lines', function (text) {
        var start = $('#extract-lines-start').val();
        var end = $('#extract-lines-end').val();
        text = text.replace(/\r\n/g, '\n');
        var lines = text.split('\n');
        var ret = '';
        for (var i = start-1; i <= end-1; i++) {
            if (i >= lines.length) {
                break;
            }
            ret += lines[i] + "\n";
        }
        return ret;
    });

    // make letter-count tool work
    //
    mkTool('letter-count', function (text) {
        return text.length;
    });

    // make number-lines format work
    $('#number-lines-format').click(function (ev) {
        ev.preventDefault();
        $('#number-lines-field').slideToggle();
    });

    // make number-lines tool work
    //
    mkTool('number-lines', function (text) {
        text = text.replace(/\r\n/g, '\n');
        var lines = text.split('\n');
        var ret = '';

        var format = $('#number-lines-field input[name="format"]').val();
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var formatStr = format.replace("NR", i+1);
            ret += (formatStr + line) + '\n';
        }
        return ret;
    });

    // make prefix-lines tool work
    //
    mkTool('prefix-lines', function (text) {
        text = text.replace(/\r\n/g, '\n');
        var lines = text.split('\n');
        var ret = '';

        var prefix = $('#prefix-lines-field input[name="prefix"]').val();
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            ret += (prefix + line) + '\n';
        }
        return ret;
    });

    // make suffix-lines tool work
    //
    mkTool('suffix-lines', function (text) {
        text = text.replace(/\r\n/g, '\n');
        var lines = text.split('\n');
        var ret = '';

        var suffix = $('#suffix-lines-field input[name="suffix"]').val();
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            ret += (line + suffix) + '\n';
        }
        return ret;
    });

    // make prefix-suffix-lines tool work
    //
    mkTool('prefix-suffix-lines', function (text) {
        text = text.replace(/\r\n/g, '\n');
        var lines = text.split('\n');
        var ret = '';

        var prefix = $('#prefix-suffix-lines-field input[name="prefix"]').val();
        var suffix = $('#prefix-suffix-lines-field input[name="suffix"]').val();
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            ret += (prefix + line + suffix) + '\n';
        }
        return ret;
    });

    // make longest-line tool work
    //
    mkTool('longest-line', function (text) {
        text = text.replace(/\r\n/g, '\n');
        var lines = text.split('\n');
        var ret = '';
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (line.length > ret.length) {
                ret = line;
            }
        }
        return ret;
    });

    // make shortest-line tool work
    //
    mkTool('shortest-line', function (text) {
        text = text.replace(/\r\n/g, '\n');
        var lines = text.split('\n');
        var ret = '';
        var currLen = -1;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (line.length) {
                if (currLen == -1 || line.length < ret.length) {
                    ret = line;
                    currLen = line.length;
                }
            }
        }
        return ret;
    });

    // make duplicate-lines tool work
    //
    mkTool('duplicate-lines', function (text) {
        text = text.replace(/\r\n/g, '\n');
        var lines = text.split('\n');
        var seen = {};
        var ret = '';

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (seen[line]) {
                continue;
            }
            seen[line] = 1;
            ret += line + '\n';
        }
        return ret;
    });

    // make empty-lines tool work
    //
    mkTool('empty-lines', function (text) {
        text = text.replace(/\r\n/g, '\n');
        var lines = text.split('\n');
        var ret = '';

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (/^[\s\t]*$/.test(line)) {
                continue;
            }
            ret += line + '\n';
        }
        return ret;
    });

    // make random-lines tool work
    //
    mkTool('random-lines', function (text) {
        text = text.replace(/\r\n/g, '\n');
        var lines = text.split('\n');

        function KnuthShuffle (array) {
            var currentIndex = array.length;
            var temporaryValue;
            var randomIndex;

            while (0 !== currentIndex) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }

            return array;
        }

        lines = KnuthShuffle(lines);

        return lines.join('\n');
    });

    // make random-letters tool work
    //
    mkTool('random-letters', function (text) {
        text = text.replace(/\r\n/g, '\n');

        function KnuthShuffle (array) {
            var currentIndex = array.length;
            var temporaryValue;
            var randomIndex;

            while (0 !== currentIndex) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }

            return array;
        }

        var letters = text.split('');
        letters = KnuthShuffle(letters);

        return letters.join('');
    });

    // make join-lines tool work
    //
    mkTool('join-lines', function (text) {
        text = text.replace(/\r\n/g, '\n');
        var lines = text.split('\n');
        var retLines = [];
        var symbol = $('#join-lines-symbol').val();
        for (var i = 0; i < lines.length; i++) {
            if (/\w/.test(lines[i])) {
                retLines.push(lines[i]);
            }
        }
        return retLines.join(symbol);
    });

    // make filter-lines tool work
    //
    mkTool('filter-lines', function (text) {
        text = text.replace(/\r\n/g, '\n');
        var lines = text.split('\n');
        var ret = '';
        var pattern = $('#filter-lines-pattern').val();
        var invertMatches = $('#filter-lines-invert').is(':checked');
        for (var i = 0; i < lines.length; i++) {
            if (invertMatches) {
                if (!(lines[i].indexOf(pattern) >= 0)) {
                    ret += lines[i] + "\n";
                }
            }
            else {
                if (lines[i].indexOf(pattern) >= 0) {
                    ret += lines[i] + "\n";
                }
            }
        }
        return ret;
    });

    // make text-split tool work
    //
    mkTool('text-split', function (text) {
        var symbol = $('#text-split-symbol').val();
        var parts = text.split(symbol);
        return parts.join("\n");
    });

    // make reverse-lines tool work
    //
    mkTool('reverse-lines', function (text) {
        text = text.replace(/\r\n/g, '\n');
        var lines = text.split('\n');
        lines.reverse();
        return lines.join('\n');
    });

    // make text-sort tool work
    //
    mkTool('text-sort', function (text) {
        text = text.replace(/\r\n/g, '\n');
        var lines = text.split('\n');
        lines.sort();
        return lines.join('\n');
    });

    // make numeric-sort tool work
    //
    mkTool('numeric-sort', function (text) {
        text = text.replace(/\r\n/g, '\n');
        var lines = text.split('\n');
        lines.sort(function (a, b) {
            return parseInt(a, 10) - parseInt(b, 10);
        });
        return lines.join('\n');
    });

    // make word-sort tool work
    //
    mkTool('word-sort', function (text) {
        text = text.replace(/[?.,!"]/g, ' ');
        text = text.replace(/\s+$/g, '');
        text = text.replace(/^\s+/g, '');
        var words = text.split(/\s+/);
        words.sort(function (a, b) {
            if (a.toLowerCase() < b.toLowerCase()) return -1;
            if (a.toLowerCase() > b.toLowerCase()) return 1;
            return 0;
        });
        return words.join(' ');
    });

    // make line-length-sort tool work
    //
    mkTool('line-length-sort', function (text) {
        text = text.replace(/\r\n/g, '\n');
        var lines = text.split('\n');
        var format = $('#line-length-sort-format').val();
        lines.sort(function(a, b){
            if (format == "s2l") {
                return a.length - b.length;
            }
            else {
                return b.length - a.length;
            }
        });
        return lines.join('\n');
    });

    // make ip-sort tool work
    //
    mkTool('ip-sort', function (text) {
        text = text.replace(/\r\n/g, '\n');
        var ips = text.split('\n');
        ips.sort(function (a, b) {
            var ip1 = a.split('.');
            var ip2 = b.split('.');
	
            var compa = parseInt(ip1[0],10) * 256 * 256 * 256 + parseInt(ip1[1],10) * 256 * 256 + parseInt(ip1[2],10) * 256 + parseInt(ip1[3],10);
            var compb = parseInt(ip2[0],10) * 256 * 256 * 256 + parseInt(ip2[1],10) * 256 * 256 + parseInt(ip2[2],10) * 256 + parseInt(ip2[3],10);
	
        	return compa-compb;
        });
        return ips.join("\n");
    });

    // make word-wrap tool work
    //
    mkTool('word-wrap', function (text) {
        var len = $('#word-wrap-length').val();
        var ww = wordwrap(len);
        return ww(text);
    });

    // make word-split tool work
    //
    mkTool('word-split', function (text) {
        var parts = text.split(/\s+/g);
        return parts.join("\n");
    });

    // make word-count tool work
    //
    mkTool('word-count', function (text) {
        return text.match(/\S+/g).length;
    });

    // make line-count tool work
    //
    mkTool('line-count', function (text) {
        return text.split('\n').length;
    });

    // make paragraph-count tool work
    //
    mkTool('paragraph-count', function (text) {
        var paragraphs = text.split(/\n\n+/g);
        var paragraphCount = 0;
        for (var i = 0; i < paragraphs.length; i++) {
            if (paragraphs[i].length != 0) {
                paragraphCount++;
            }
        }
        return paragraphCount;
    });

    // make word-frequency tool work
    //
    mkTool('word-frequency', function (text) {
        // copy paste from text-info
        var wordStats = {};
        var words = text.split(/\s+/g);
        for (var i = 0; i < words.length; i++) {
            var word = words[i].toLowerCase();
            word = word.replace(/[,.?!]+/, '');
            if (!word.length) {
                continue;
            }
            if (wordStats[word] === undefined) {
                wordStats[word] = 1;
            }
            else {
                wordStats[word]++;
            }
        }
        var sortedWordStatsKeys = Object.keys(wordStats).sort(function (a, b) {
            return wordStats[b] - wordStats[a];
        });
        var retText = '';
        for (var i = 0; i < sortedWordStatsKeys.length; i++) {
            var key = sortedWordStatsKeys[i];
            retText += key + ": " + wordStats[key] + "\n";
        }
        return retText;
    });

    // make phrase-frequency tool work
    //
    mkTool('phrase-frequency', function (text) {
        var textSentences = text.split(/[.?!]+/);
        var sentences = [];
        for (var i = 0; i < textSentences.length; i++) {
            if (/\w/.test(textSentences[i])) {
                var sentence = textSentences[i].toLowerCase();
                sentence = sentence.replace(/\s+/g, ' ');
                sentence = sentence.replace(/\s+$/g, '');
                sentence = sentence.replace(/^\s+/g, '');
                sentences.push(sentence);
            }
        }

        function generateAllPhrases(sentence) {
            var words = sentence.split(/\s+/g);

            var phrases = [];
            for (k = 2; k <= words.length; k++) {
                for (l = 0; l < words.length; l++) {
                    if (k+l > words.length) {
                        continue;
                    }
                    var phrase = words.slice(l, l+k);
                    phrases.push(phrase);
                }
            }
            return phrases;
        }

        function filterUniquePhrases(phrases) {
            var unique = [];
            var seen = {};
            for (var i = 0; i < phrases.length; i++) {
                var phrase = phrases[i];
                var phraseStr = phrase.join(' ');
                if (seen[phraseStr] === undefined) {
                    unique.push(phrase);
                    seen[phraseStr] = 1;
                }
            }
            return unique;
        }

        var phrasesCache = []; // todo

        var phraseStats = {};
        var countedPhrases = {};

        for (var i = 0; i < sentences.length; i++) {
            var sentence = sentences[i];

            if (phrasesCache[i] != undefined) {
                var phrasesi = phrasesCache[i];
            }
            else {
                var phrasesi = generateAllPhrases(sentence);
                phrasesCache[i] = phrasesi;
            }
            var uniquePhrasesi = filterUniquePhrases(phrasesi);

            for (var j = i; j < sentences.length; j++) {
                var sentence = sentences[j];
                if (phrasesCache[j] != undefined) {
                    var phrasesj = phrasesCache[j];
                }
                else {
                    var phrasesj = generateAllPhrases(sentence);
                    phrasesCache[j] = phrasesj;
                }

                for (var k = 0; k < uniquePhrasesi.length; k++) {
                    var phrasei = uniquePhrasesi[k];

                    for (var l = 0; l < phrasesj.length; l++) {
                        var phrasej = phrasesj[l];
                        if (phrasei.length != phrasej.length) {
                            continue;
                        }

                        var phraseiStr = phrasei.join(' ');
                        var phrasejStr = phrasej.join(' ');

                        if (phraseiStr == phrasejStr && countedPhrases[phraseiStr] === undefined) {
                            if (phraseStats[phraseiStr] == undefined) {
                                phraseStats[phraseiStr] = 1;
                            }
                            else {
                                phraseStats[phraseiStr]++;
                            }
                        }
                    }
                }
            }
            for (var k = 0; k < uniquePhrasesi.length; k++) {
                var phraseStr = uniquePhrasesi[k].join(' ');
                countedPhrases[phraseStr] = 1;
            }
        }

        var sortedPhraseStatsKeys = Object.keys(phraseStats).sort(function (a, b) {
            return phraseStats[b] - phraseStats[a];
        });
        var retText = '';
        for (var i = 0; i < sortedPhraseStatsKeys.length; i++) {
            var key = sortedPhraseStatsKeys[i];
            var count = phraseStats[key];
            if (count > 1) {
                retText += key + ": " + count + "\n";
            }
        }
        return retText;
    });

    // make text-from-regex tool work
    //
    mkTool(
        'text-from-regex',
        function (text) {
            var howMany = parseInt($('#text-from-regex-how-many').val(), 10);
            var regex = $('#text-from-regex-regex').val();
            var ret = '';
            for (var i = 1; i <= howMany; i++) {
                var r = new RandExp(regex);
                ret += r.gen();
                ret += "\n";
            }
            return ret;
        },
        {
            allowEmptyText : true,
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err);
            }
        }
    );

    // make regex-replace tool work
    //
    mkTool(
        'regex-replace',
        function (text) {
            var regex = $('#regex-replace-regex').val();
            var regexParts = regex.match(/^\/(.*?)\/([gimuy]*)$/);
            if (regexParts) {
                var r = new RegExp(regexParts[1], regexParts[2]);
            } else {
                var r = new RegExp(regex);
            }
            var replaceTo = $('#regex-replace-to').val();
            text = text.replace(r, replaceTo);
            return text;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err);
            }
        }
    );

    // make regex-extract-matches tool work
    //
    mkTool(
        'regex-extract-matches',
        function (text) {
            var regex = $('#regex-extract-matches-regex').val();

            var regexParts = regex.match(/^\/(.*?)\/([gimuy]*)$/);
            if (regexParts) {
                var r = new RegExp(regexParts[1], regexParts[2]);
            } else {
                var r = new RegExp(regex);
            }
            var matches = text.match(r);
            var ret = '';
            if (matches) {
                for (var i = 0; i < matches.length; i++) {
                    ret += matches[i];
                    ret += "\n";
                }
            }
            return ret;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err);
            }
        }
    );

    // make extract-emails tool work
    //
    mkTool(
        'extract-emails',
        function (text) {
            var matches = text.match(/[a-z0-9._%+-]+@[a-z0-9-]+\.([a-z0-9]+)/gi);
            var ret = '';
            if (matches) {
                for (var i = 0; i < matches.length; i++) {
                    ret += matches[i];
                    ret += "\n";
                }
            }
            return ret;
        }
    );

    // make extract-urls tool work
    //
    mkTool(
        'extract-urls',
        function (text) {
            // https://gist.github.com/dperini/729294
            var urlRegex = new RegExp(
                // protocol identifier
                "(?:(?:https?|ftp)://)" +
                // user:pass authentication
                "(?:\\S+(?::\\S*)?@)?" +
                "(?:" +
                  // IP address exclusion
                  // private & local networks
                  "(?!(?:10|127)(?:\\.\\d{1,3}){3})" +
                  "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +
                  "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
                  // IP address dotted notation octets
                  // excludes loopback network 0.0.0.0
                  // excludes reserved space >= 224.0.0.0
                  // excludes network & broacast addresses
                  // (first & last IP address of each class)
                  "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
                  "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
                  "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
                "|" +
                  // host name
                  "(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" +
                  // domain name
                  "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" +
                  // TLD identifier
                  "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))" +
                  // TLD may end with dot
                  "\\.?" +
                ")" +
                // port number
                "(?::\\d{2,5})?" +
                // resource path
                "(?:[/?#]\\S*)?",
              "gi"
            );
            var matches = text.match(urlRegex);
            var ret = '';
            if (matches) {
                for (var i = 0; i < matches.length; i++) {
                    ret += matches[i];
                    ret += "\n";
                }
            }
            return ret;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err);
            }
        }
    );

    // make extract-numbers tool work
    //
    mkTool(
        'extract-numbers',
        function (text) {
            var matches = text.match(/-?[0-9](\.[0-9]+)?/gi);
            var ret = '';
            if (matches) {
                for (var i = 0; i < matches.length; i++) {
                    ret += matches[i];
                    ret += "\n";
                }
            }
            return ret;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err);
            }
        }
    );

    // make text-info tool work
    //
    mkTool('text-info', function (text) {
        var length = text.length;
        var wordCount = text.match(/\S+/g).length;
        var lineCount = text.split('\n').length;

        var paragraphs = text.split(/\n\n+/g);
        var paragraphCount = 0;
        for (var i = 0; i < paragraphs.length; i++) {
            if (paragraphs[i].length != 0) {
                paragraphCount++;
            }
        }

        var textSentences = text.split(/[.?!]+/);
        var sentenceCount = 0;
        for (var i = 0; i < textSentences.length; i++) {
            if (/\w/.test(textSentences[i])) {
                sentenceCount++;
            }
        }

        var charStats = {};
        var wordStats = {};

        var asciiCount = 0;
        var extendedAsciiCount = 0;
        var unicodeCount = 0;

        var chars = text.split('');
        for (var i = 0; i < chars.length; i++) {
            var char = chars[i];
            if (charStats[char] === undefined) {
                charStats[char] = 1;
            }
            else {
                charStats[char]++;
            }

            var charCode = char.charCodeAt(0);
            if (charCode >= 0 && charCode <= 127) {
                asciiCount++;
            }
            else if (charCode > 127 && charCode <= 255) {
                extendedAsciiCount++;
            }
            else {
                unicodeCount++;
            }
        }

        var words = text.split(/\s+/g);
        for (var i = 0; i < words.length; i++) {
            var word = words[i].toLowerCase();
            word = word.replace(/[,.?!]+/, '');
            if (!word.length) {
                continue;
            }
            if (wordStats[word] === undefined) {
                wordStats[word] = 1;
            }
            else {
                wordStats[word]++;
            }
        }

        var retText = 
            "Text statistics:\n" + 
            "Length:      " + length + "\n" +
            "Words:       " + wordCount + "\n" +
            "Sentences:   " + sentenceCount + "\n" +
            "Lines:       " + lineCount + "\n" +
            "Paragraphs:  " + paragraphCount + "\n" +
            "\n" +
            "Ascii Characters (0-127):            " + asciiCount + "\n" +
            "Extended Ascii Characters (127-255): " + extendedAsciiCount + "\n" +
            "All Ascii Characters (0-255):        " + (extendedAsciiCount + asciiCount) + "\n" +
            "Unicode Characters (255+):           " + unicodeCount + "\n" +
            "\n" +
            "Word statistics:\n";

        var sortedWordStatsKeys = Object.keys(wordStats).sort(function (a, b) {
            return wordStats[b] - wordStats[a];
        });
        for (var i = 0; i < sortedWordStatsKeys.length; i++) {
            var key = sortedWordStatsKeys[i];
            retText += key + ": " + wordStats[key] + "\n";
        }   

        retText +=
            "\n" + 
            "Character statistics:\n";

        var sortedCharStatsKeys = Object.keys(charStats).sort(function (a, b) {
            return charStats[b] - charStats[a];
        });
        for (var i = 0; i < sortedCharStatsKeys.length; i++) {
            var key = sortedCharStatsKeys[i];
            var strKey = key;
            if (key.charCodeAt(0) == "10") {
                strKey = "↵"; 
            }
            else if (key.charCodeAt(0) == "32") {
                strKey = "⎵";
            }

            retText += strKey + ": " + charStats[key] + "\n";
        }   

        return retText;
    });

    // make random-pick tool work
    //
    mkTool(
        'random-pick',
        function (text) {
            var lines = text.split('\n');
            var howMany = parseInt($('#random-pick-how-many').val(), 10);

            var ret = [];
            for (var i = 0; i < howMany; i++) {
                var itemIndex = parseInt(Math.random() * lines.length, 10);
                ret.push(lines[itemIndex]);
                lines.splice(itemIndex, 1);
            }
            return ret.join('\n');
        }
    );

    // make random-string tool work
    //
    $('#random-string-format').change(function () {
        var format = $('#random-string-format').val();
        if (format == "custom") {
            $('#random-string-custom-format').slideDown();
        }
        else {
            $('#random-string-custom-format').slideUp();
        }
    })
    mkTool(
        'random-string',
        function () {
            var len = $('#random-string-length').val();
            var format = $('#random-string-format').val();

            var possibleAlphaLc = 'abcdefghijklmnopqrstuvwxyz';
            var possibleAlphaUc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            var possibleAlphaMix = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

            var possibleAlphaLcNum = 'abcdefghijklmnopqrstuvwxyz0123456789';
            var possibleAlphaUcNum = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            var possibleAlphaMixNum = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

            var possibleNum = '0123456789';

            if (format == "custom") {
                var customFormat = $('#random-string-custom-format input').val();
                if (customFormat.length == 0) {
                    return '';
                }
            }
            
            var str = '';
            for (var i = 0; i < len; i++) {
                if (format == "alphalc") {
                    var char = possibleAlphaLc.charAt(Math.random() * possibleAlphaLc.length);
                    str += char;
                }
                else if (format == "alphauc") {
                    var char = possibleAlphaUc.charAt(Math.random() * possibleAlphaUc.length);
                    str += char;
                }
                else if (format == "alphamix") {
                    var char = possibleAlphaMix.charAt(Math.random() * possibleAlphaMix.length);
                    str += char;
                }
                else if (format == "alphalcnum") {
                    var char = possibleAlphaLcNum.charAt(Math.random() * possibleAlphaLcNum.length);
                    str += char;
                }
                else if (format == "alphaucnum") {
                    var char = possibleAlphaUcNum.charAt(Math.random() * possibleAlphaUcNum.length);
                    str += char;
                }
                else if (format == "alphamixnum") {
                    var char = possibleAlphaMixNum.charAt(Math.random() * possibleAlphaMixNum.length);
                    str += char;
                }
                else if (format == "num") {
                    var char = possibleNum.charAt(Math.random() * possibleNum.length);
                    str += char;
                }
                else if (format == "custom") {
                    var char = customFormat.charAt(Math.random() * customFormat.length);
                    str += char;
                }
            }

            return str;
        },
        {
            allowEmptyText : true
        }
    );

    // make random-password tool work (copy of random-string tool);
    //
    $('#random-password-format').change(function () {
        var format = $('#random-password-format').val();
        if (format == "custom") {
            $('#random-password-custom-format').slideDown();
        }
        else {
            $('#random-password-custom-format').slideUp();
        }
    })
    mkTool(
        'random-password',
        function () {
            var len = $('#random-password-length').val();
            var format = $('#random-password-format').val();

            var possibleAlphaLc = 'abcdefghijklmnopqrstuvwxyz';
            var possibleAlphaUc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            var possibleAlphaMix = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

            var possibleAlphaLcNum = 'abcdefghijklmnopqrstuvwxyz0123456789';
            var possibleAlphaUcNum = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            var possibleAlphaMixNum = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

            var possibleNum = '0123456789';

            if (format == "custom") {
                var customFormat = $('#random-password-custom-format input').val();
                if (customFormat.length == 0) {
                    return '';
                }
            }
            
            var str = '';
            for (var i = 0; i < len; i++) {
                if (format == "alphalc") {
                    var char = possibleAlphaLc.charAt(Math.random() * possibleAlphaLc.length);
                    str += char;
                }
                else if (format == "alphauc") {
                    var char = possibleAlphaUc.charAt(Math.random() * possibleAlphaUc.length);
                    str += char;
                }
                else if (format == "alphamix") {
                    var char = possibleAlphaMix.charAt(Math.random() * possibleAlphaMix.length);
                    str += char;
                }
                else if (format == "alphalcnum") {
                    var char = possibleAlphaLcNum.charAt(Math.random() * possibleAlphaLcNum.length);
                    str += char;
                }
                else if (format == "alphaucnum") {
                    var char = possibleAlphaUcNum.charAt(Math.random() * possibleAlphaUcNum.length);
                    str += char;
                }
                else if (format == "alphamixnum") {
                    var char = possibleAlphaMixNum.charAt(Math.random() * possibleAlphaMixNum.length);
                    str += char;
                }
                else if (format == "num") {
                    var char = possibleNum.charAt(Math.random() * possibleNum.length);
                    str += char;
                }
                else if (format == "custom") {
                    var char = customFormat.charAt(Math.random() * customFormat.length);
                    str += char;
                }
            }

            return str;
        },
        {
            allowEmptyText : true
        }
    );

    // make random-number tool work
    //
    mkTool(
        'random-number',
        function () {
            var start = parseInt($('#random-number-start').val(), 10);
            var end = parseInt($('#random-number-end').val(), 10);
            var howMany = parseInt($('#random-number-how-many').val(), 10);

            var str = '';
            for (var i = 0; i < howMany; i++) {
                str += parseInt(Math.random() * (end - start + 1) + start, 10).toString();
                if (i != howMany-1) str += "\n";
            }
            return str;
        },
        {
            allowEmptyText : true
        }
    );

    // make random-bytes tool work
    //
    mkTool(
        'random-bytes',
        function () {
            var howMany = parseInt($('#random-bytes-how-many').val(), 10);
            var format = $('#random-bytes-format').val();

            var str = '';
            for (var i = 0; i < howMany; i++) {
                var randByte = parseInt(Math.random() * 256, 10);

                if (format == "hex") {
                    randByte = randByte.toString(16);
                    if (randByte.length == 1) {
                        randByte = "0" + randByte;
                    }
                }
                else if (format == "bin") {
                    randByte = randByte.toString(2);
                    while (randByte.length < 8) {
                        randByte = "0" + randByte;
                    }
                }
                else if (format == "oct") {
                    randByte = randByte.toString(8);
                    while (randByte.length < 3) {
                        randByte = "0" + randByte;
                    }
                }
                else if (format == "dec") {
                    randByte = randByte.toString(10);
                }
                str += randByte;
                str += " ";
            }
            str += "\n";
            return str;
        },
        {
            allowEmptyText : true
        }
    );

    // make random-bin tool work
    //
    mkTool(
        'random-bin',
        function () {
            var howManyDigits = parseInt($('#random-bin-how-many-digits').val(), 10);
            var howManyResuls = parseInt($('#random-bin-how-many-results').val(), 10);

            var str = '';
            for (var i = 0; i < howManyResuls; i++) {
                var res = '';
                for (var j = 0; j < howManyDigits; j++) {
                    var randByte = parseInt(Math.random() * 2, 10);
                    res += randByte;
                }
                str += res;
                str += "\n";
            }
            return str;
        },
        {
            allowEmptyText : true
        }
    );

    // make random-oct tool work
    //
    mkTool(
        'random-oct',
        function () {
            var howManyDigits = parseInt($('#random-oct-how-many-digits').val(), 10);
            var howManyResuls = parseInt($('#random-oct-how-many-results').val(), 10);

            var str = '';
            for (var i = 0; i < howManyResuls; i++) {
                var res = '';
                for (var j = 0; j < howManyDigits; j++) {
                    var randByte = parseInt(Math.random() * 8, 10);
                    res += randByte;
                }
                str += res;
                str += "\n";
            }
            return str;
        },
        {
            allowEmptyText : true
        }
    );

    // make random-dec tool work
    //
    mkTool(
        'random-dec',
        function () {
            var howManyDigits = parseInt($('#random-dec-how-many-digits').val(), 10);
            var howManyResuls = parseInt($('#random-dec-how-many-results').val(), 10);

            var str = '';
            for (var i = 0; i < howManyResuls; i++) {
                var res = '';
                for (var j = 0; j < howManyDigits; j++) {
                    var randByte = parseInt(Math.random() * 10, 10);
                    res += randByte;
                }
                str += res;
                str += "\n";
            }
            return str;
        },
        {
            allowEmptyText : true
        }
    );

    // make random-hex tool work
    //
    mkTool(
        'random-hex',
        function () {
            var howManyDigits = parseInt($('#random-hex-how-many-digits').val(), 10);
            var howManyResuls = parseInt($('#random-hex-how-many-results').val(), 10);

            var str = '';
            for (var i = 0; i < howManyResuls; i++) {
                var res = '';
                for (var j = 0; j < howManyDigits; j++) {
                    var randByte = parseInt(Math.random() * 16, 10).toString(16);
                    res += randByte;
                }
                str += res;
                str += "\n";
            }
            return str;
        },
        {
            allowEmptyText : true
        }
    );

    // make random-fractions tool work
    //
    mkTool(
        'random-fractions',
        function () {
            var start = parseInt($('#random-fractions-start').val(), 10);
            var end = parseInt($('#random-fractions-end').val(), 10);
            var howMany = parseInt($('#random-fractions-how-many').val(), 10);
            var precision = parseInt($('#random-fractions-precision').val(), 10);

            var str = '';
            for (var i = 0; i < howMany; i++) {
                str += (Math.random() * (end - start) + start).toFixed(precision).toString();
                if (i != howMany-1) str += "\n";
            }
            return str;
        },
        {
            allowEmptyText : true
        }
    );

    // make random-ip ip range work
    $('#random-ip-range').click(function (ev) {
        ev.preventDefault();
        $('#random-ip-range-field').slideToggle();
    });

    // make random-ip tool work
    //
    mkTool(
        'random-ip',
        function () {
            var howMany = parseInt($('#random-ip-how-many').val(), 10);
            var startIp = $('#random-ip-range-field input[name="start"]').val();
            var endIp = $('#random-ip-range-field input[name="end"]').val();

            function randRange (low, high) {
                return parseInt(parseInt(low,10) + Math.random() * (parseInt(high,10)-parseInt(low,10)+1), 10).toString();
            }

            var str = '';
            for (var i = 0; i < howMany; i++) {
                var r1 = randRange(startIp.split('.')[0], endIp.split('.')[0]);
                var r2 = randRange(startIp.split('.')[1], endIp.split('.')[1]);
                var r3 = randRange(startIp.split('.')[2], endIp.split('.')[2]);
                var r4 = randRange(startIp.split('.')[3], endIp.split('.')[3]);
                str += r1 + '.' + r2 + '.' + r3 + '.' + r4;
                if (i != howMany-1) str += "\n";
            }
            return str;
        },
        {
            allowEmptyText : true
        }
    );

    // make random-mac mac range work
    $('#random-mac-range').click(function (ev) {
        ev.preventDefault();
        $('#random-mac-range-field').slideToggle();
    });

    // make random-mac tool work
    //
    mkTool(
        'random-mac',
        function () {
            var howMany = parseInt($('#random-mac-how-many').val(), 10);
            var startIp = $('#random-mac-range-field input[name="start"]').val();
            var endIp = $('#random-mac-range-field input[name="end"]').val();

            function randRange (low, high) {
                return parseInt(parseInt(low,16) + Math.random() * (parseInt(high,16)-parseInt(low,16)), 16);
            }

            var str = '';
            for (var i = 0; i < howMany; i++) {
                var r1 = randRange(startIp.split(':')[0], endIp.split(':')[0]).toString(16);
                r1 = parseInt(r1, 10).toString(16);
                if (r1.length == 1) {
                    r1 = "0" + r1;
                }
                var r2 = randRange(startIp.split(':')[1], endIp.split(':')[1]).toString(16);
                r2 = parseInt(r2, 10).toString(16);
                if (r2.length == 1) {
                    r2 = "0" + r2;
                }
                var r3 = randRange(startIp.split(':')[2], endIp.split(':')[2]).toString(16);
                r3 = parseInt(r3, 10).toString(16);
                if (r3.length == 1) {
                    r3 = "0" + r3;
                }
                var r4 = randRange(startIp.split(':')[3], endIp.split(':')[3]).toString(16);
                r4 = parseInt(r4, 10).toString(16);
                if (r4.length == 1) {
                    r4 = "0" + r4;
                }
                var r5 = randRange(startIp.split(':')[4], endIp.split(':')[4]).toString(16);
                r5 = parseInt(r5, 10).toString(16);
                if (r5.length == 1) {
                    r5 = "0" + r5;
                }
                var r6 = randRange(startIp.split(':')[5], endIp.split(':')[5]).toString(16);
                r6 = parseInt(r6, 10).toString(16);
                if (r6.length == 1) {
                    r6 = "0" + r6;
                }
                str += r1 + ':' + r2 + ':' + r3 + ':' + r4 + ':' + r5 + ':' + r6;
                if (i != howMany-1) str += "\n";
            }
            return str;
        },
        {
            allowEmptyText : true
        }
    );

    // make random-date custom format work
    $('#random-date-format').change(function () {
        var format = $('#random-date-format').val();
        if (format == "custom") {
            $('#random-date-custom-format').slideDown();
        }
        else {
            $('#random-date-custom-format').slideUp();
        }
    })
    // make random-date change date range work
    $('#random-date-range').click(function (ev) {
        ev.preventDefault();
        $('#random-date-range-field').slideToggle();
    });

    // make random-date tool work
    //
    mkTool(
        'random-date',
        function () {
            var howMany = parseInt($('#random-date-how-many').val(), 10);
            var format = $('#random-date-format').val();
            var startDateStr = $('#random-date-range-field input[name="start"]').val();
            var endDateStr = $('#random-date-range-field input[name="end"]').val();

            var startDate = new Date(startDateStr).getTime();
            var endDate = new Date(endDateStr).getTime();
            if (isNaN(startDate)) {
                var startDate = new Date(1900, 0, 1).getTime();
            }
            if (isNaN(endDate)) {
                var endDate = new Date(2099, 0, 31).getTime();
            }

            var str = '';
            for (var i = 0; i < howMany; i++) {
                var date = new Date(startDate + Math.random() * (endDate - startDate + 1000));

                var months_long = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
                var months_short = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug',
                    'Sep', 'Oct', 'Nov', 'Dec'];

                var yyyy = date.getFullYear();
                var yy = date.getFullYear().toString().substr(2,2);
                var month_long = months_long[date.getMonth()];
                var month_short = months_short[date.getMonth()];

                var mmonth = date.getMonth() + 1;
                if (mmonth < 10) { mmonth = "0" + mmonth.toString(); }

                var d = date.getDate();
                var dd = date.getDate();
                if (dd < 10) { dd = "0" + dd.toString(); }

                var h = date.getHours();
                var hh = date.getHours();
                if (hh < 10) { hh = "0" + hh.toString(); }

                var m = date.getMinutes();
                var mminute = date.getMinutes();
                if (mminute < 10) { mminute = "0" + mminute.toString(); }

                var s = date.getSeconds();
                var ss = date.getSeconds();
                if (ss < 10) { ss = "0" + ss.toString(); }

                if (format == "yyyy-mm-dd-hh-mm-ss") {
                    str += [yyyy,mmonth,dd].join('-') + ' ' + [hh,mminute,ss].join(':');
                }
                else if (format == "yyyy-dd-mm-hh-mm-ss") {
                    str += [yyyy,dd,mmonth].join('-') + ' ' + [hh,mminute,ss].join(':');
                }
                else if (format == "mm-dd-yyyy-hh-mm-ss") {
                    str += [mmonth,dd,yyyy].join('-') + ' ' + [hh,mminute,ss].join(':');
                }
                else if (format == "iso8601") {
                    var isoStr = date.toISOString();
                    isoStr = isoStr.replace(/\.\d+Z/, 'Z');
                    str += isoStr;
                }
                else if (format == "year-month-date-hh-mm-ss") {
                    str += [yyyy,month_long,dd].join(' ') + ' ' + [hh,mminute,ss].join(':');
                }
                else if (format == "year-date-month-hh-mm-ss") {
                    str += [yyyy,month_long,dd].join(' ') + ' ' + [hh,mminute,ss].join(':');
                }
                else if (format == "month-date-year-hh-mm-ss") {
                    str += [month_long,dd,yyyy].join(' ') + ' ' + [hh,mminute,ss].join(':');
                }
                else if (format == "custom") {
                    var customFormat = $('#random-date-custom-format input').val();
                    var customStr = customFormat;
                    customStr = customStr.replace("YYYY", yyyy);
                    customStr = customStr.replace("YY", yy);
                    customStr = customStr.replace("MM", mmonth);
                    customStr = customStr.replace("month", month_long);
                    customStr = customStr.replace("mon", month_short);
                    customStr = customStr.replace("DD", dd);
                    customStr = customStr.replace("d", d);
                    customStr = customStr.replace("hh", hh);
                    customStr = customStr.replace("h", h);
                    customStr = customStr.replace("mm", mminute);
                    customStr = customStr.replace("m", m);
                    customStr = customStr.replace("ss", ss);
                    customStr = customStr.replace("s", s);
                    str += customStr;
                }
                if (i != howMany-1) str += "\n";
            }
            return str;
        },
        {
            allowEmptyText : true
        }
    );

    // make random-time custom format work
    $('#random-time-format').change(function () {
        var format = $('#random-time-format').val();
        if (format == "custom") {
            $('#random-time-custom-format').slideDown();
        }
        else {
            $('#random-time-custom-format').slideUp();
        }
    })
    // make random-time change date range work
    $('#random-time-range').click(function (ev) {
        ev.preventDefault();
        $('#random-time-range-field').slideToggle();
    });

    // make random-time tool work
    //
    mkTool(
        'random-time',
        function () {
            var howMany = parseInt($('#random-time-how-many').val(), 10);
            var format = $('#random-time-format').val();
            var startTimeStr = $('#random-time-range-field input[name="start"]').val();
            var endTimeStr = $('#random-time-range-field input[name="end"]').val();

            if (!/\d+:\d+:\d+/.test(startTimeStr)) {
                throw new Error("Invalid start time, doesn't match h:m:s");
            }
            if (!/\d+:\d+:\d+/.test(endTimeStr)) {
                throw new Error("Invalid end time, doesn't match h:m:s");
            }

            var startTimeH = parseInt(startTimeStr.split(':')[0], 10);
            var startTimeM = parseInt(startTimeStr.split(':')[1], 10);
            var startTimeS = parseInt(startTimeStr.split(':')[2], 10);

            var endTimeH = parseInt(endTimeStr.split(':')[0], 10);
            var endTimeM = parseInt(endTimeStr.split(':')[1], 10);
            var endTimeS = parseInt(endTimeStr.split(':')[2], 10);

            if (isNaN(startTimeH)) {
                throw new Error("Start time hour isn't a valid number");
            }
            if (isNaN(startTimeM)) {
                throw new Error("Start time minute isn't a valid number");
            }
            if (isNaN(startTimeS)) {
                throw new Error("Start time second isn't a valid number");
            }

            if (isNaN(endTimeH)) {
                throw new Error("End time hour isn't a valid number");
            }
            if (isNaN(endTimeM)) {
                throw new Error("End time minute isn't a valid number");
            }
            if (isNaN(endTimeS)) {
                throw new Error("End time second isn't a valid number");
            }

            if (startTimeH > 24) {
                throw new Error("Start time hour bigger than 24");
            }
            if (startTimeM > 60) {
                throw new Error("Start time minute bigger than 60");
            }
            if (startTimeS > 60) {
                throw new Error("Start time second bigger than 60");
            }

            if (endTimeH > 24) {
                throw new Error("End time hour bigger than 24");
            }
            if (endTimeM > 60) {
                throw new Error("End time minute bigger than 60");
            }
            if (endTimeS > 60) {
                throw new Error("End time second bigger than 60");
            }

            function randIntRange(start, end) {
                return parseInt(Math.random() * (end - start + 1) + start, 10).toString();
            }

            var startSecond = startTimeH*3600 + startTimeM*60 + startTimeS;
            var endSecond = endTimeH*3600 + endTimeM*60 + endTimeS;

            if (startSecond > endSecond) {
                throw new Error("Start time is bigger than end time");
            }

            var str = '';
            for (var i = 0; i < howMany; i++) {
                var randSec = randIntRange(startSecond, endSecond);

                var h = parseInt(randSec / 3600, 10);
                var hh = h;
                if (hh.toString().length == 1) {
                    hh = "0" + hh;
                }
                var m = parseInt((randSec % 3600) / 60, 10);
                var mm = m;
                if (mm.toString().length == 1) {
                    mm = "0" + mm;
                }
                var s = parseInt(randSec % 60, 10);
                var ss = s;
                if (ss.toString().length == 1) {
                    ss = "0" + ss;
                }
                
                var ampm = 'am';
                if (h >= 12) {
                    h -= 12;
                    ampm = 'pm';
                }

                if (format == "hh-mm-ss") {
                    str += hh + ":" + mm + ":" + ss;
                }
                else if (format == "h-m-s") {
                    str += h + ":" + m + ":" + s;
                }
                else if (format == "h-m-s-am-pm") {
                    str += h + ":" + m + ":" + s + ' ' + ampm;
                }
                else if (format == "custom") {
                    var customFormat = $('#random-time-custom-format input').val();
                    var customStr = customFormat;

                    customStr = customStr.replace("hh", hh);
                    customStr = customStr.replace("h", h);
                    customStr = customStr.replace("mm", mm);
                    customStr = customStr.replace("m", m);
                    customStr = customStr.replace("ss", ss);
                    customStr = customStr.replace("s", s);

                    customStr = customStr.replace("ampm", ampm);
                    str += customStr;
                }
                str += "\n";
            }
            return str;
        },
        {
            allowEmptyText : true,
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err);
            }
        }
    );

    // make random-uuid tool work
    //
    mkTool(
        'random-uuid',
        function () {
            var howMany = parseInt($('#random-uuid-how-many').val(), 10);

            var str = '';
            for (var i = 0; i < howMany; i++) {
                var format = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
                format = format.replace(/x/g, function (char) {
                    var randInt = parseInt(Math.random()*16, 10);
                    return randInt.toString(16);
                });
                format = format.replace(/y/g, function(char) {
                    var yRange = ['8', '9', 'a', 'b'];
                    var randInt = parseInt(Math.random()*4, 10);
                    var y = yRange[randInt];
                    return y;
                });
                str += format;
                if (i != howMany-1) str += "\n";
            }
            return str;
        },
        {
            allowEmptyText : true
        }
    );

    // make random-guid tool work (copy/paste random-uuid code as it's the same thing)
    //
    mkTool(
        'random-guid',
        function () {
            var howMany = parseInt($('#random-guid-how-many').val(), 10);

            var str = '';
            for (var i = 0; i < howMany; i++) {
                var format = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
                format = format.replace(/x/g, function (char) {
                    var randInt = parseInt(Math.random()*16, 10);
                    return randInt.toString(16);
                });
                format = format.replace(/y/g, function(char) {
                    var yRange = ['8', '9', 'a', 'b'];
                    var randInt = parseInt(Math.random()*4, 10);
                    var y = yRange[randInt];
                    return y;
                });
                str += format;
                if (i != howMany-1) str += "\n";
            }
            return str;
        },
        {
            allowEmptyText : true
        }
    );

    // make prime-numbers tool work
    //
    mkTool(
        'prime-numbers',
        function () {
            var howMany = parseInt($('#prime-numbers-how-many').val(), 10);
            var start = parseInt($('#prime-numbers-start').val(), 10);
            var primes = [];
            var sieve = [];
            for (var i = start; ; i++) {
                isPrime = true;
                upTo = Math.floor(Math.sqrt(i));
                for (var j = 2; j <= upTo; j++) {
                    if (i % j == 0) {
                        isPrime = false;
                        break;
                    }
                }
                if (isPrime) {
                    primes.push(i);
                    if (primes.length >= howMany) {
                        break;
                    }
                }
            }
            return primes.join('\n');
        },
        {
            allowEmptyText : true
        }
    );

    // make fibonacci-numbers tool work
    //
    mkTool(
        'fibonacci-numbers',
        function () {
            var howMany = parseInt($('#fibonacci-numbers-how-many').val(), 10);
            var start = parseInt($('#fibonacci-numbers-start').val(), 10);
            var fibs = [];
            var fprev = 1;
            var fcur = 1;
            var fib = 1;
            if (howMany > 1 && start == 1) {
                fibs.push(fprev);
            }
            if (howMany > 2 && start == 1) {
                fibs.push(fcur);
            }
            while (1) {
                if (fibs.length >= howMany) {
                    break;
                }
                fib = fprev + fcur;
                fprev = fcur;
                if (fib >= start) {
                    fibs.push(fib);
                }
                fcur = fib;
            }
            return fibs.join('\n');
        },
        {
            allowEmptyText : true
        }
    );

    // make pi-digits tool work
    //
    mkTool(
        'pi-digits',
        function () {
            var howMany = parseInt($('#pi-digits-how-many').val(), 10);
            if (howMany == 0) {
                return "3";
            }

            // https://github.com/josdejong/mathjs/blob/master/test/pi_bailey-borwein-plouffe.html
            Decimal.config({
                precision: howMany + 2
            });

            var zero = new Decimal(0);
            var one = new Decimal(1);
            var two = new Decimal(2);
            var four = new Decimal(4);
            var p16 = one;
            var pi = zero;
            var precision = howMany + 2;
            var k8 = zero;
            for (var k = zero; k.lte(precision); k = k.plus(one)) {
                // pi += 1/p16 * (4/(8*k + 1) - 2/(8*k + 4) - 1/(8*k + 5) - 1/(8*k+6));
                // p16 *= 16;
                //
                // a little simpler:
                // pi += p16 * (4/(8*k + 1) - 2/(8*k + 4) - 1/(8*k + 5) - 1/(8*k+6));
                // p16 /= 16;
                var f = four.div(k8.plus(1))
                    .minus(two.div(k8.plus(4)))
                    .minus(one.div(k8.plus(5)))
                    .minus(one.div(k8.plus(6)));
                pi = pi.plus(p16.times(f));
                p16 = p16.div(16);
                k8 = k8.plus(8);
            }
            return pi.toString().substr(0, pi.toString().length-1);
        },
        {
            allowEmptyText : true
        }
    );

    // make e-digits tool work
    //
    mkTool(
        'e-digits',
        function () {
            var howMany = parseInt($('#e-digits-how-many').val(), 10);
            if (howMany == 0) {
                return "2";
            }

            Decimal.config({
                precision: howMany + 100
            });

            function factorial (n) {
                if (n == 0) return new Decimal(1);
                var result = new Decimal(1);
                for (var i = new Decimal(1); i.lte(n); i = i.plus(new Decimal(1))) {
                    result = result.mul(i);
                }
                return result;
            }

            var e = new Decimal(1);
            var precision = howMany + 100;
            for (var i = new Decimal(1); i.lte(precision); i = i.plus(new Decimal(1))) {
                var ithTerm = new Decimal(1);
                ithTerm = ithTerm.div(factorial(i.toFixed()));
                e = e.plus(ithTerm);
            }
            return e.toString().substr(0, howMany+2);
        },
        {
            allowEmptyText : true
        }
    );

    // make decimal-to-scientific tool work
    //
    mkTool('decimal-to-scientific', function (text) {
        var lines = text.split("\n");
        var ret = '';
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            line = line.replace(/\s+/g, '');
            if (line.length && /^[+-]?(\d+|\.\d+|\d+\.\d+)$/.test(line)) {
                var negative = false;
                if (/^-/.test(line)) {
                    negative = true;
                    line = line.substr(1);
                }
                if (/^\+/.test(line)) {
                    line = line.substr(1);
                }

                if (/^\d+$/.test(line)) {
                    var firstDigit = line[0];
                    var otherDigits = line.substr(1);
                    if (negative) {
                        ret += "-";
                    }
                    if (otherDigits.length) {
                        ret += firstDigit + '.' + otherDigits + '*10^' + otherDigits.length;
                    }
                    else {
                        ret += firstDigit;
                    }
                    ret += "\n";
                    continue;
                }
                else if (/^(0*)?\.\d+$/.test(line)) {
                    var firstPart = line.split('.')[0];
                    var secondPart = line.split('.')[1];

                    var firstDigit = '0';
                    var otherDigits = secondPart;
                    if (/^0+$/.test(otherDigits)) {
                        // case 0.0000000000 etc
                        ret += '0' + "\n";
                        continue;
                    }

                    // drop trailing zeroes from end
                    otherDigits = otherDigits.replace(/0+$/, '');

                    var m = otherDigits.match(/^(0+)(\d+)$/);
                    if (m) {
                        // case 0.0xxxxx
                        var zeroes = m[1];
                        var digitsAfterZeroes = m[2];
                        var firstDigitAfterZeroes = digitsAfterZeroes[0];
                        var otherDigitsAfterZeroes = digitsAfterZeroes.substr(1);

                        if (otherDigitsAfterZeroes.length) {
                            // case 0.0000000xxxxxxx
                            ret += firstDigitAfterZeroes + '.' + otherDigitsAfterZeroes + '*10^-' + (zeroes.length + 1);
                        }
                        else {
                            // case 0.0000000x
                            ret += firstDigitAfterZeroes + '*10^-' + (zeroes.length+1);
                        }
                        ret += "\n";
                        continue;
                    }

                    // case 0.xxxxx
                    var realFirstDigit = otherDigits[0];
                    var realOtherDigits = otherDigits.substr(1);
                    if (negative) {
                        ret += "-";
                    }
                    if (realOtherDigits.length) {
                        ret += realFirstDigit + '.' + realOtherDigits + '*10^-1';
                    }
                    else {
                        ret += realFirstDigit + '*10^-1';
                    }
                    ret += "\n";
                }
                else if (/^\d+\.\d+$/.test(line)) {
                    var firstPart = line.split('.')[0];
                    var secondPart = line.split('.')[1];

                    if (firstPart.length == 1) {
                        // case a.bbbbbbbbbb
                        if (negative) {
                            ret += "-";
                        }
                        ret += line + "\n";
                        continue;
                    }

                    var firstDigit = firstPart[0];
                    var otherDigits = firstPart.substr(1);

                    if (negative) {
                        ret += "-";
                    }
                    ret += firstDigit + '.' + otherDigits + '' + secondPart + '*10^' + otherDigits.length + "\n";
                }
            }
            else {
                ret += line + "\n";
            }
        }
        return ret;
    });

    // make miles-to-km tool work
    //
    mkTool('miles-to-km', function (text) {
        var lines = text.split("\n");
        var ret = '';
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var miles = parseFloat(line);
            if (miles == NaN) {
                ret += line + "\n";
            }
            else {
                var km = miles * 1.609344;
                ret += km.toFixed(4) + "\n";
            }
        }
        return ret;
    });

    // make km-to-miles tool work
    //
    mkTool('km-to-miles', function (text) {
        var lines = text.split("\n");
        var ret = '';
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var km = parseFloat(line);
            if (km == NaN) {
                ret += line + "\n";
            }
            else {
                var miles = km / 1.609344;
                ret += miles.toFixed(4) + "\n";
            }
        }
        return ret;
    });

    // make c-to-f tool work
    //
    mkTool('c-to-f', function (text) {
        var lines = text.split("\n");
        var ret = '';
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var c = parseFloat(line);
            if (c == NaN) {
                ret += line + "\n";
            }
            else {
                var f = c * 1.8 + 32;
                ret += f.toFixed(4) + "\n";
            }
        }
        return ret;
    });

    // make f-to-c tool work
    //
    mkTool('f-to-c', function (text) {
        var lines = text.split("\n");
        var ret = '';
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var f = parseFloat(line);
            if (f == NaN) {
                ret += line + "\n";
            }
            else {
                var c = (f - 32)/1.8;
                ret += c.toFixed(4) + "\n";
            }
        }
        return ret;
    });

    // make deg-to-rad tool work
    //
    mkTool('deg-to-rad', function (text) {
        var lines = text.split("\n");
        var ret = '';
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var deg = parseFloat(line);
            if (deg == NaN) {
                ret += line + "\n";
            }
            else {
                var rad = deg * Math.PI / 180;
                ret += rad.toFixed(4) + "\n";
            }
        }
        return ret;
    });

    // make rad-to-deg tool work
    //
    mkTool('rad-to-deg', function (text) {
        var lines = text.split("\n");
        var ret = '';
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var rad = parseFloat(line);
            if (rad == NaN) {
                ret += line + "\n";
            }
            else {
                var deg = rad * 180 / Math.PI;
                ret += deg.toFixed(4) + "\n";
            }
        }
        return ret;
    });

    // make kg-to-lbs tool work
    //
    mkTool('kg-to-lbs', function (text) {
        var lines = text.split("\n");
        var ret = '';
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var kg = parseFloat(line);
            if (kg == NaN) {
                ret += line + "\n";
            }
            else {
                var lbs = kg * 2.2046226218;
                ret += lbs.toFixed(4) + "\n";
            }
        }
        return ret;
    });

    // make lbs-to-kg tool work
    //
    mkTool('lbs-to-kg', function (text) {
        var lines = text.split("\n");
        var ret = '';
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var lbs = parseFloat(line);
            if (lbs == NaN) {
                lbs += line + "\n";
            }
            else {
                var kg = lbs / 2.2046226218;
                ret += kg.toFixed(4) + "\n";
            }
        }
        return ret;
    });

    // make scientific-to-decimal tool work
    //
    mkTool('scientific-to-decimal', function (text) {
        var lines = text.split("\n");
        var ret = '';
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            line = line.replace(/\s+/g, '');
            line = line.replace("*10^", "e");
            ret += scientificToDecimal(line) + "\n";
        }
        return ret;
    });

    // make numbers-to-words tool work
    //
    mkTool('numbers-to-words', function (text) {
        var lines = text.split("\n");
        var ret = '';
        for (var i = 0; i < lines.length; i++) {
            if (lines[i].length) {
                ret += numberToWords.toWords(lines[i]) + "\n";
            }
            else {
                ret += "\n";
            }
        }
        return ret;
    });

    // make words-to-numbers tool work
    //
    mkTool(
        'words-to-numbers',
        function (text) {
            text = text.replace(/,/g, ' ');
            var lines = text.split("\n");
            var ret = '';
            for (var i = 0; i < lines.length; i++) {
                if (lines[i].length) {
                    ret += text2num(lines[i]) + "\n";
                }
                else {
                    ret += "\n";
                }
            }
            return ret;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err);
            }
        }
    );

    mkTool(
        'hex-to-rgb',
        function (text) {
            $('#action-error').hide();

            var lines = text.split('\n');
            var ret = '';
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (line.length == 0) {
                    ret += '\n';
                    continue;
                }
                line = line.replace(/\s+/g, "");
                line = line.replace(/^#/, "");
                if (line.length == 3) {
                    var r = line[0].toString() + line[0].toString();
                    var g = line[1].toString() + line[1].toString();
                    var b = line[2].toString() + line[2].toString();
                }
                else if (line.length == 6) {
                    var r = line[0].toString() + line[1].toString();
                    var g = line[2].toString() + line[3].toString();
                    var b = line[4].toString() + line[5].toString();
                }
                else {
                    $('#action-error').show();
                    $('#action-error').text("Invalid Hex value. Should be #RRGGBB or #RGB");
                    return text;
                }

                var rDec = parseInt(r,16);
                var gDec = parseInt(g,16);
                var bDec = parseInt(b,16);

                if (isNaN(rDec)) {
                    $('#action-error').show();
                    $('#action-error').text("Invalid RED value");
                    return text;
                }
                else if (isNaN(gDec)) {
                    $('#action-error').show();
                    $('#action-error').text("Invalid GREEN value");
                    return text;
                }
                else if (isNaN(bDec)) {
                    $('#action-error').show();
                    $('#action-error').text("Invalid BLUE value");
                    return text;
                }

                ret += lines[i] + ' rgb(' + rDec + ', ' + gDec + ', ' + bDec + ')\n';
            }
            return ret;
        }
    );

    mkTool(
        'rgb-to-hex',
        function (text) {
            $('#action-error').hide();

            var lines = text.split('\n');
            var ret = '';
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (line.length == 0) {
                    ret += '\n';
                    continue;
                }
                line = line.replace(/,/g, " ");
                line = line.replace(/\./g, " ");
                var m = line.match(/(\d+)\s+(\d+)\s+(\d+)/);
                if (m) {
                    var r = parseInt(m[1],10);
                    var g = parseInt(m[2],10);
                    var b = parseInt(m[3],10);

                    var rHex = r.toString(16);
                    if (rHex.length == 1) {
                        rHex = "0" + rHex;
                    }
                    var gHex = g.toString(16);
                    if (gHex.length == 1) {
                        gHex = "0" + gHex;
                    }
                    var bHex = b.toString(16);
                    if (bHex.length == 1) {
                        bHex = "0" + bHex;
                    }

                    ret += lines[i] + ' #' + rHex + gHex + bHex + "\n";
                    continue;
                }
                else {
                    $('#action-error').show();
                    $('#action-error').text("Invalid color on line " + (i+1));
                    return text;
                }
            }
            return ret;
        }
    );

    mkImageConvertTool(
        'jpg-to-png', 
        {
            inputMime : 'image/jpeg',
            inputHumanFormat : 'JPEG'
        },
        {
            outputMime : 'image/png',
            outputExt : 'png'
        },
        function () {
            
        }
    );

    mkImageConvertTool(
        'png-to-jpg', 
        {
            inputMime : 'image/png',
            inputHumanFormat : 'PNG'
        },
        {
            outputMime : 'image/jpeg',
            outputExt : 'jpg'
        },
        function () {
            
        }
    );

    mkImageConvertTool(
        'gif-to-png', 
        {
            inputMime : 'image/gif',
            inputHumanFormat : 'GIF'
        },
        {
            outputMime : 'image/png',
            outputExt : 'png'
        },
        function () {
            
        }
    );

    mkImageConvertTool(
        'gif-to-jpg', 
        {
            inputMime : 'image/gif',
            inputHumanFormat : 'GIF'
        },
        {
            outputMime : 'image/jpeg',
            outputExt : 'jpg'
        },
        function () {
            
        }
    );

    mkImageConvertTool(
        'bmp-to-png', 
        {
            inputMime : 'image/bmp',
            inputHumanFormat : 'BMP'
        },
        {
            outputMime : 'image/png',
            outputExt : 'png'
        },
        function () {
            
        }
    );

    mkImageConvertTool(
        'bmp-to-jpg', 
        {
            inputMime : 'image/bmp',
            inputHumanFormat : 'BMP'
        },
        {
            outputMime : 'image/jpeg',
            outputExt : 'jpg'
        },
        function () {
            
        }
    );

    // image to base64
    if ($('#tool-image-to-base64').length) {
        var fileSelector = '#file-select';
        var submitSelector = '#submit';
        var selectedFile;

        // make file selector work
        $(fileSelector).on('change', function (ev) {
            $('#action-error').hide();
            var file = ev.target.files[0];
            selectedFile = file;
            $(submitSelector).attr('disabled', false);
        });

        // make drag & drop work
        $('#drag-and-drop').on('dragover', function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            $('#drag-and-drop').addClass('hover');
        });
        $('#drag-and-drop').on('dragenter', function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            $('#drag-and-drop').addClass('hover');
        });
        $('#drag-and-drop').on('dragleave', function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            $('#drag-and-drop').removeClass('hover');
        });
        $('#drag-and-drop').on('dragend', function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            $('#drag-and-drop').removeClass('hover');
        });
        $('#drag-and-drop').on('drop', function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            $('#drag-and-drop').removeClass('hover');
            $('#action-error').hide();
            ev.dataTransfer = ev.originalEvent.dataTransfer;
            var file = ev.dataTransfer.files[0];
            $('#drag-and-drop-selected').text("Selected " + file.name);
            selectedFile = file;
            $(submitSelector).attr('disabled', false);
        });

        // make convert button work
        //
        $(submitSelector).click(function () {
            var reader = new FileReader();
            reader.onload = function () {
                // reader result
                var comma = reader.result.indexOf(',');
                var base64 = reader.result.substr(comma+1);

                $('#image-to-base64-output textarea').val(base64);
                $('#image-to-base64-output').slideDown();
            }
            reader.readAsDataURL(selectedFile);
        });
    }

    // file to base64 (copy-paste image-to-base64)
    if ($('#tool-file-to-base64').length) {
        var fileSelector = '#file-select';
        var submitSelector = '#submit';
        var selectedFile;

        // make file selector work
        $(fileSelector).on('change', function (ev) {
            $('#action-error').hide();
            var file = ev.target.files[0];
            selectedFile = file;
            $(submitSelector).attr('disabled', false);
        });

        // make drag & drop work
        $('#drag-and-drop').on('dragover', function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            $('#drag-and-drop').addClass('hover');
        });
        $('#drag-and-drop').on('dragenter', function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            $('#drag-and-drop').addClass('hover');
        });
        $('#drag-and-drop').on('dragleave', function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            $('#drag-and-drop').removeClass('hover');
        });
        $('#drag-and-drop').on('dragend', function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            $('#drag-and-drop').removeClass('hover');
        });
        $('#drag-and-drop').on('drop', function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            $('#drag-and-drop').removeClass('hover');
            $('#action-error').hide();
            ev.dataTransfer = ev.originalEvent.dataTransfer;
            var file = ev.dataTransfer.files[0];
            $('#drag-and-drop-selected').text("Selected " + file.name);
            selectedFile = file;
            $(submitSelector).attr('disabled', false);
        });

        // make convert button work
        //
        $(submitSelector).click(function () {
            var reader = new FileReader();
            reader.onload = function () {
                // reader result
                var comma = reader.result.indexOf(',');
                var base64 = reader.result.substr(comma+1);

                $('#file-to-base64-output textarea').val(base64);
                $('#file-to-base64-output').slideDown();
            }
            reader.readAsDataURL(selectedFile);
        });
    }
});
