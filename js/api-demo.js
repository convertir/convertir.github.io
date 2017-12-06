$(function () {
    function showInviteError(str) {
        $('#invite-form-error').text(str);
        $('#invite-form-error').show();
    }

    function hideInviteError() {
        $('#invite-form-error').hide();
    }

    $('input[name="validate"]').click(function () {
        var inviteKey = $('input[name="invite-key"]').val();
        if (inviteKey.length == 0) {
            $('#invite-form-error').text('You didn\'t enter the invite key!');
            $('#invite-form-error').show();
            return;
        }

        var button = this;
        var oldVal = $(this).val();
        $(this).val("Validating...");
        $(this).prop('disabled', true);

        $.post('/api/api-demo-invite', {
            inviteKey : inviteKey
        }, function (data) {
            if (/^error/i.test(data)) {
                $('#invite-form-error').text(data);
                $('#invite-form-error').show();
                $(button).val(oldVal);
                $(button).prop('disabled', false);
            }
            else {
                $(button).val('Valid key!');
                $('input[name="invite-key"]').prop('disabled', true);
                $('#invite-form-error').hide();
                $('#invite-form-success').text('Hooray! This is a valid invite key. Scroll down to try the demo.');
                $('#invite-form-success').show();
                $('#please-enter-invite-key').hide();
                $('input[name="run"]').prop('disabled', false);
            }
        });
    });

    $('input[name="run"]').click(function () {
        var inviteKey = $('input[name="invite-key"]').val();
        var button = this;
        var oldVal = $(this).val();
        $(this).val("Running the demo! (Click to restart!)");

        $.post('/api/api-demo-invite-api-key', {
            inviteKey : inviteKey
        }, function (data) {
            if (/^error/i.test(data)) {
                $('#run-form-error').text(data);
                $('#run-form-error').show();
                $(button).val(oldVal);
            }
            else {
                $('#run-form-error').hide();

                $('#demo').show();
                $('#browserling').remove();

                $('#demo').append($('<div id="browserling"></div>'));

                var browserling = new Browserling(data);
                browserling.configure({
                  browser : 'ie',
                  version : '9',
                  url : 'http://www.catonmat.net'
                });
                var iframe = browserling.iframe();
                var div = $('#browserling');
                div.append(iframe);
                browserling
                  .delay(5000)                         // wait 5 seconds
                  .mouseMove(80, 100)                  // move mouse to 80, 100 on the screen
                  .leftClick(80, 100)                  // left click at 80, 100
                  .delay(2000)                         // wait 2 seconds
                  .mouseMove(140, 100)
                  .leftClick(140, 100)
                  .delay(2000)
                  .mouseMove(200, 100)
                  .leftClick(200, 100)
                  .delay(2000)
                  .mouseMove(280, 100)
                  .leftClick(280, 100)
                  .delay(2000)
                  .mouseMove(360, 100)
                  .leftClick(360, 100)
                  .delay(1000)                         // wait 1 second
                  .mouseMove(450, 180)
                  .delay(100)                          // wait 100ms
                  .mouseMove(600, 280)
                  .delay(100)
                  .mouseMove(740, 335)
                  .leftClick(740, 335)
                  .delay(1000)
                  .typeText("browserling")             // type text "browserling"
                  .delay(500)
                  .keyPress(Browserling.Keys.Enter);   // press Enter

                browserling.delay(2000);               // wait another two seconds
                browserling.mouseMove(77, 448);

                browserling.leftClick(77, 448);        // perform tripple click
                browserling.delay(50);
                browserling.leftClick(77, 448);
                browserling.delay(50);
                browserling.leftClick(77, 448);

            }
        });

    });
});
