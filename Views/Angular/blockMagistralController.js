app.controller('blockMagistralController', function($scope) {
    $scope.pagename="Block Magistral";
    var url = baseServiceUrl + 'assetdatabases?path=\\\\' + afServerName + '\\' + afDatabaseName;
    var ajaxEF = processJsonContent(url, 'GET', null);
    $.when(ajaxEF).fail(function() {
        warningmsg("Cannot Find the Assetdatabases.");
        console.log("Cannot Find the Assetdatabases.")
    });
    $.when(ajaxEF).done(function() {
        var WebId = (ajaxEF.responseJSON.WebId);
        
        /****Get Element List by Template Name START***/
            var url = baseServiceUrl + 'assetdatabases/' + WebId + '/elements?templateName=' + newtemplateName + '&searchFullHierarchy=true';
            var elementdata = processJsonContent(url, 'GET', null);
            $.when(elementdata).fail(function() {
                warningmsg("Cannot Find the Element.");
                console.log("Cannot Find the Element.")
            });
        $.when(elementdata).done(function() {
            var elementsItems = (elementdata.responseJSON.Items);
            var sr = 1;
            $.each(elementsItems, function(key) {
                $("#loadedDiv").append('<div class="col-12 col-lg-6 col-xl-2" style="">\n\
                                            <div class="card cardpadding">\n\
                                                <div class="card-body" style="text-align: center;margin-top: 15px;">\n\
                                                    <input type="hidden" id="elements' + sr + '" data-id="' + elementsItems[key].Name + '" value="' + elementsItems[key].WebId + '" class="elements form-control">\n\
                                                    <h4 class="blockname">' + elementsItems[key].Name + '</h4>\n\
                                                </div>\n\
                                            </div>\n\
                                        </div>\n\
                                        <div class="col-12 col-lg-6 col-xl-5">\n\
                                            <div class="row card">\n\
                                                <div class="col-12 col-lg-6 col-xl-6">\n\
                                                    <div class="card-body" style="margin-top: 20px;">\n\
                                                        <select id="connection' + sr + '" name="' + sr + '" class="connection form-control">\n\
                                                        <option value="" selected="" disabled="">---Select Connection---</option>\n\
                                                        <option data-name="' + sr + '" value="0">Not Connected</option>\n\
                                                        <option data-name="' + sr + '" value="1">Recirculation</option>\n\
                                                        <option data-name="' + sr + '" value="k">Connected</option>\n\
                                                        </select>\n\
                                                    </div>\n\
                                                </div>\n\
                                                <div class="col-12 col-lg-6 col-xl-6">\n\
                                                    <div class="card-body">\n\
\n\<div class="col-12 col-lg-6 col-xl-6">\n\
                                                        <select id="prValues' + sr + '" name="' + sr + '" class="prValues form-control">\n\
                                                        <option value="">---Plant for PR---</option>\n\
                                                        <option value="2">PR - TKD </option>\n\
                                                        <option value="4">PR - MKM_old</option>\n\
                                                        <option value="8">PR - MKM_new</option>\n\
                                                        </select>\n\
\n\</div>\n\
\n\<div class="col-12 col-lg-6 col-xl-6">\n\
                                                        <select id="vrValues' + sr + '" name="' + sr + '" class="vrValues form-control">\n\
                                                        <option value="">---Plant for VR---</option>\n\
                                                        <option value="16">VR - TKD </option>\n\
                                                        <option value="32">VR - MKM_old</option>\n\
                                                        <option value="64">VR - MKM_new</option>\n\
                                                        </select>\n\
\n\</div>\n\
                                                    </div>\n\
                                                </div>\n\
                                            </div>\n\
                                        </div>\n\
                                        <div class="col-12 col-lg-6 col-xl-3">\n\
                                            <div class="card cardpadding">\n\
                                                <div class="card-body">\n\
                                                    <span  style="text-align: center;width: 50%;float: left">\n\
                                                    <input type="text" class="dateTime form-control" style="width:95%;"  id="dateTime' + sr + '"  placeholder="Date Time">\n\
                                                    </span>\n\
                                                    <span  style="text-align: center;width: 50%;float: left">\n\
                                                    <input type="time" name="time' + sr + '" id="time' + sr + '" style="width:95%;" class="time form-control">\n\
                                                    </span>\n\
                                                </div>\n\
                                            </div>\n\
                                        </div>\n\
                                        <div class="col-12 col-lg-6 col-xl-2">\n\
                                            <div class="card cardpadding">\n\
                                                <div class="card-body"  style="text-align: center">\n\
                                                    <button type="button" id="saveAllocation' + sr + '" value="' + sr + '" class="saveAllocation btn btn-primary"><i class="ti-save"></i> Save</button>\n\
                                                </div>\n\
                                            </div>\n\
                                        </div>');
                $(function() {
                    var now = new Date();
                    var month = (now.getMonth() + 1);
                    var day = now.getDate();
                    if (month < 10)
                        month = "0" + month;
                    if (day < 10)
                        day = "0" + day;
                    var today = month + '/' + day + '/' + now.getFullYear();
                    $("#dateTime" + sr).val(today);
                    $("#dateTime" + sr).datepicker()
                });
                $(function() {
                    var d = new Date(),
                        h = d.getHours(),
                        m = d.getMinutes();
                    if (h < 10) h = '0' + h;
                    if (m < 10) m = '0' + m;
                    $('input[type="time"][name="time' + sr + '"]').each(function() {
                        $(this).attr({
                            'value': h + ':' + m
                        })
                    })
                });
                $('#connection' + sr).change(function() {
                    var conn = $(this).val();
                    var srn = $(this).attr("name");
                    if (conn === '0' || conn === '1') {
                        $('#vrValues' + srn).val('');
                        $('#prValues' + srn).val('');
                        $("#prValues" + srn).attr("disabled", "disabled");
                        $('#vrValues' + srn).attr('disabled', 'disabled')
                    } else {
                        $('#prValues' + srn).removeAttr('disabled');
                        $('#vrValues' + srn).removeAttr('disabled')
                    }
                });
                $('#saveAllocation' + sr).click(function() {
                    var srn = $(this).val();
                    var date = $("#dateTime" + srn).val();
                    var time = $("#time" + srn).val();
                    var dateTime = (date + ' ' + time);
                    var dataValues = '';
                    var conn = $('#connection' + srn).val();
                    if (conn === '0' || conn === '1') {
                        dataValues = parseInt(conn);
                        saveAllocation(srn, dataValues, dateTime)
                    } else if (conn === 'k') {
                        var prValue = $("#prValues" + srn).val();
                        var vrValue = $("#vrValues" + srn).val();
                        if (prValue !== '' && vrValue !== '') {
                            dataValues = parseInt(prValue) + parseInt(vrValue);
                            saveAllocation(srn, dataValues, dateTime)
                        } else if (prValue !== '' && vrValue === '') {
                            warningmsg("Select The Both Values..!")
                        } else if (prValue === '' && vrValue !== '') {
                            warningmsg("Select The Both Values..!")
                        } else if (prValue === '' && vrValue === '') {
                            warningmsg("Select The Plant Values..!");
                            dataValues = ''
                        }
                    } else {
                        warningmsg("Select The Connection..!")
                    }
                });
                sr++
            });
            /****Get Element List by Template Name END***/
        })
    });

 /****Each Save Button START***/
    function saveAllocation(srn, dataValues, dateTime) {
        var elementWebId = $("#elements" + srn).val();
        var url = baseServiceUrl + 'elements/' + elementWebId + '/attributes';
        var attributesElements = processJsonContent(url, 'GET', null);
        $.when(attributesElements).fail(function() {
            warningmsg("Cannot Find the Attributes.");
            console.log("Cannot Find the Attributes.")
        });
        $.when(attributesElements).done(function() {
            var attributesItems = (attributesElements.responseJSON.Items);
            $.each(attributesItems, function(key) {
                if (attributesItems[key].Name === allocationAttributeName) {
                    var url = baseServiceUrl + 'streams/' + attributesItems[key].WebId + '/recorded';
                    var data = [{
                        "Timestamp": dateTime,
                        "UnitsAbbreviation": "m",
                        "Good": !0,
                        "Questionable": !1,
                        "Value": dataValues
                    }];
                    var postData = JSON.stringify(data);
                    var postAjaxEF = processJsonContent(url, 'POST', postData, null, null);
                    $.when(postAjaxEF).fail(function() {
                        errormsg("Cannot Post The Data.")
                    });
                    $.when(postAjaxEF).done(function() {
                        var response = (JSON.stringify(postAjaxEF.responseText));
                        if (response == '""') {
                            successmsg("Data Saved successfully.")
                        } else {
                            var failure = postAjaxEF.responseJSON.Items;
                            $.each(failure, function(key) {
                                warningmsg("Status: " + failure[key].Substatus + " <br> Message: " + failure[key].Message)
                            })
                        }
                    })
                } else {}
            })
        })
    }
     /****Each Save Button END***/
});