$(function () {
    mkTool(
        'utf8-decode',
        function (text) {
            text = text.replace(/^\s+/, '');
            text = text.replace(/\s+$/, '');
            var bytes = [];
            if (/^(\\x[0-9a-f]{1,2})/i.test(text)) {
                bytes = text.match(/(\\x[0-9a-f]{1,2})/gi);
            }
            else {
                var chars = text.split('');
                for (var i = 0; i < chars.length; i++) {
                    bytes.push(chars[i].charCodeAt(0).toString(16));
                }
            }
            
            for (var i = 0; i < bytes.length; i++) {
                bytes[i] = bytes[i].replace("\\x", '');
                bytes[i] = bytes[i].replace("\\X", '');
            }

            var utf8Text = '';
            for (var i = 0; i < bytes.length; i++) {
                utf8Text += String.fromCharCode(parseInt(bytes[i], 16));
            }

            return utf8.decode(utf8Text);
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err.message);
            }
        }
    );
});
