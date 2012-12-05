(function() {
  /*global calcentral*/
  'use strict';

  /**
   * Notifications controller
   */
  calcentral.controller('NotificationsController', ['$http', '$scope', function($http, $scope) {

    var notifications = {
      "sections": [
        {
          "title": "Alerts",
          "notifications": []
        },
        {
          "title": "Today",
          "notifications": []
        }
      ]
    };
    $scope.notifications = notifications;

    var notificationsIds = [];

    function ISODateString(d) {
        function pad(n){
            return n<10 ? '0'+n : n;
        }
        return d.getUTCFullYear()+'-'
        + pad(d.getUTCMonth()+1)+'-'
        + pad(d.getUTCDate())+'T'
        + pad(d.getUTCHours())+':'
        + pad(d.getUTCMinutes())+':'
        + pad(d.getUTCSeconds())+'Z'
    }

    function ignoreCaseSort(a, b) {
        var ret = 0;
        a = a.toLowerCase();
        b = b.toLowerCase();
        if(a > b) ret = 1;
        if(a < b) ret = -1;
        return ret;
    }

    function getStringToSign(url) {

        var stringToSign = "";
        var query = url.split("?")[1];

        var params = query.split("&");
        params.sort(ignoreCaseSort);
        for (var i = 0; i < params.length; i++) {
            var param = params[i].split("=");
            var name =   param[0];
            var value =  param[1];
            if (name == 'Signature' || undefined  == value) continue;
                stringToSign += name;
                stringToSign += decodeURIComponent(value);
             }

        return stringToSign;
    }



    var generateV1Signature = function(url, key) {
      var stringToSign = getStringToSign(url);
      var signed = b64_hmac_sha1(key, stringToSign);
      return signed;
    };

    var getNowTimeStamp = function() {
      var time = new Date();
      var gmtTime = new Date(time.getTime() + (time.getTimezoneOffset() * 60000));
      return ISODateString(gmtTime);
    };

    var aws_signature;
    var generateSignedURL = function(aws_action, aws_queue_url,aws_timestamp, aws_key_id, aws_secret_access_key, aws_endpoint, aws_version, aws_extra) {

      var url = aws_endpoint + "?SignatureVersion=1&Action=" + aws_action + "&Version=" + encodeURIComponent(aws_version) + '&';
      url += 'QueueUrl=' + encodeURIComponent(aws_queue_url) + '&';

      if (aws_extra) {
        url += 'ReceiptHandle=' + encodeURIComponent(aws_extra) + '&';
      }

      url += "Timestamp=" + encodeURIComponent(aws_timestamp);


      url += "&AWSAccessKeyId=" + encodeURIComponent(aws_key_id);
      var signature = generateV1Signature(url, aws_secret_access_key);
      url += "&Signature=" + encodeURIComponent(signature);

      aws_signature = encodeURIComponent(signature);

      return url;

    };


    var aws_action = 'ReceiveMessage';
    var aws_queue_url = 'https://sqs.us-west-1.amazonaws.com/440690255399/calcentral';
    var aws_timestamp = getNowTimeStamp();
    var aws_secret_access_key = 'BKxCsvXkk13NrUJn9Py1TRXiUODvan7ok9A3NWEU';
    var aws_key_id = 'AKIAIKXDEIHFQGOJ6UBQ';
    var aws_version = '2009-02-01';
    var aws_endpoint = 'https://queue.amazonaws.com';
    var url = generateSignedURL(aws_action, aws_queue_url,aws_timestamp, aws_key_id, aws_secret_access_key, aws_endpoint, aws_version);


    var createYqlUrl = function(query) {
        return ("https://query.yahooapis.com/v1/public/yql?q=__QUERY__&env=" +
        "store://datatables.org/alltableswithkeys&format=json")
          .replace("__QUERY__" , encodeURIComponent(query));
    };

    var getNotifications = function() {
      var amazon_url = aws_queue_url + url.replace(aws_endpoint, '');
      $.ajax({
        'url': createYqlUrl('select * from xml where url="' + amazon_url + '"'),
        'success': function(data) {
          addNotifications(data);
        }
      });
    };

    var interval = window.setInterval(getNotifications, 1000);

    var deleteMessage = function(messageId) {
      var aws_now_timestamp = getNowTimeStamp();

      var delete_url = generateSignedURL('DeleteMessage', aws_queue_url,aws_now_timestamp, aws_key_id, aws_secret_access_key, aws_endpoint, aws_version, messageId);

      var amazon_url = aws_queue_url + delete_url.replace(aws_endpoint, '');

      $.ajax({
        'url': createYqlUrl('select * from xml where url="' + amazon_url + '"'),
        'success': function(data) {
          console.log(data.query.results);
        }
      });

    };

    var addNotification = function(message, body) {

      if (!body.systemID || body.systemID !== 'BearFacts') {
        return;
      }

      if (body.eventCode === 'RegBlock') {
        notifications.sections[0].notifications.push({
          "id": body.eventID,
          "title": 'Registration block has been updated',
          "summary": 'Your registration block has been updated',
          "source": "Bear Facts",
          "type": "alert",
          "epoch": new Date().getTime(),
          "url": "https://bearfacts.berkeley.edu/",
          "source_url": "https://bearfacts.berkeley.edu/"
        });
      }

      if (body.eventCode === 'RegStatus') {
        notifications.sections[0].notifications.push({
          "id": body.eventID,
          "title": 'Registration status has been updated',
          "summary": 'Your registration status has been updated',
          "source": "Bear Facts",
          "type": "alert",
          "epoch": new Date().getTime(),
          "url": "https://bearfacts.berkeley.edu/",
          "source_url": "https://bearfacts.berkeley.edu/"
        });
      }

      if (body.eventCode === "EndOfTermGrades") {
        notifications.sections[1].notifications.push({
          "id": body.eventID,
          "title": 'End of term grades have been posted for ' + body.payload.name + ' ' + body.payload.year,
          "summary": 'Your end of term grades have been posted for ' + body.payload.name + ' ' + body.payload.year,
          "source": "Bear Facts",
          "type": "classes",
          "epoch": new Date().getTime(),
          "url": "https://bearfacts.berkeley.edu/",
          "source_url": "https://bearfacts.berkeley.edu/"
        });
      }

    };

    var addNotifications = function(data) {
      var message = {};
      if (data
          && data.query
          && data.query.results
          && data.query.results.ReceiveMessageResponse
          && data.query.results.ReceiveMessageResponse.ReceiveMessageResult) {
        message = data.query.results.ReceiveMessageResponse.ReceiveMessageResult;

        if (notificationsIds.indexOf(message.Message.MessageId) === -1) {

          var body = JSON.parse(message.Message.Body);

          if (body && body.event) {
            addNotification(message, body.event);
          }

          notificationsIds.push(message.Message.MessageId);
          deleteMessage(message.Message.ReceiptHandle);

        }

        $scope.$apply();
      }

    };

  }]);

})();
