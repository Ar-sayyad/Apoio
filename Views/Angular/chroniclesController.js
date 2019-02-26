app.controller('chroniclesController', function($scope) {
    $scope.pagename = "Chronicles";
    $(".tabDiv").hide();
    var now = new Date();
    $(function() {
        var emonth = '';
        var yr = '';
        var month = (now.getMonth() + 1);
        if (month === 1) {
            emonth = 12;
            yr = (now.getFullYear() - 1);
        } else {
            emonth = now.getMonth();
            yr = now.getFullYear();
        }
        var day = now.getDate();
        if (month < 10)
            month = "0" + month;
        if (day < 10)
            day = "0" + day;
        var start = yr + '-' + emonth + '-' + day;
        var end = now.getFullYear() + '-' + month + '-' + day;
        $("#startDate").val(start);
        $("#startDate").datepicker({
            dateFormat: 'yy-mm-dd',
            maxDate: '0'
        });
        $("#endDate").val(end);
        $("#endDate").datepicker({
            dateFormat: 'yy-mm-dd',
            maxDate: '0'
        });
    });
    $(function() {
        var h = now.getHours(),
            m = now.getMinutes(),
            s = now.getSeconds();
        if (h < 10) h = '0' + h;
        if (m < 10) m = '0' + m;
        if (s < 10) s = '0' + s;
        $('input[type="time"][name="starttime"]').attr({
            'value': '00:00:00'
        });
        $('input[type="time"][name="endtime"]').attr({
            'value': h + ':' + m + ':' + s
        });
    });
    $("#chartView").click(function() {
        $("#tableViewData").hide();
        $("#chartViewData").show();
    });
    $("#tableView").click(function() {
        $("#tableViewData").show();
        $("#chartViewData").hide();
    });
    var url = baseServiceUrl + 'assetdatabases?path=\\\\' + afServerName + '\\' + afDatabaseName;
    var ajaxEF = processJsonContent(url, 'GET', null);
    $.when(ajaxEF).fail(function() {
        warningmsg("Cannot Find the WebId.");
    });
    $.when(ajaxEF).done(function() {
        var WebId = (ajaxEF.responseJSON.WebId);
        var url = baseServiceUrl + 'assetdatabases/' + WebId + '/elementtemplates?field=Categories&query=' + filterCategoryName + '&sortField=Name&selectedFields=items.name;items.webid;&searchFullHierarchy=true';
        var parentTemplateList = processJsonContent(url, 'GET', null);
        $.when(parentTemplateList).fail(function() {
            warningmsg("Cannot Find the Element Templates.");
        });
        $.when(parentTemplateList).done(function() {
            var parentTemplateListItems = (parentTemplateList.responseJSON.Items);
            var sr = 1;
            $.each(parentTemplateListItems, function(key) {
                $("#parentTemplateList").append("<option  data-id=" + WebId + " value=" + parentTemplateListItems[key].Name + ">" + parentTemplateListItems[key].Name + "</option>");
                sr++;
            });
        });
    });
    $("#parentTemplateList").change(function() {
        var parentTemplateID = $("#parentTemplateList option:selected").attr("data-id");
        $("#containern").empty();
        $("#elementList").empty();
        $("#attributesListLeft").empty();
        $("#parentList").empty();
        $("#parentList").append("<option value='' selected disabled>---Select Parent---</option>");
        var parentTemplateName = $("#parentTemplateList").val();
        var url = baseServiceUrl + 'assetdatabases/' + parentTemplateID + '/elements?templateName=' + parentTemplateName + '&sortField=Name&selectedFields=items.name;items.webid;&searchFullHierarchy=true';
        var parentList = processJsonContent(url, 'GET', null);
        $.when(parentList).fail(function() {
            warningmsg("Cannot Find the Element Templates.");
        });
        $.when(parentList).done(function() {
            var parentListItems = (parentList.responseJSON.Items);
            var sr = 1;
            $.each(parentListItems, function(key) {
                $("#parentList").append("<option  data-name=" + parentListItems[key].Name + " value=" + parentListItems[key].WebId + ">" + parentListItems[key].Name + "</option>");
                sr++;
            });
        });
    });
    $("#parentList").change(function() {
        var parentname = $("#parentList option:selected").attr("data-name");
        $("#containern").empty();
        $("#elementList").empty();
        $("#attributesListLeft").empty();
        var parentWebId = $("#parentList").val();
        var url = baseServiceUrl + 'elements/' + parentWebId + '/attributes';
        var attributesList = processJsonContent(url, 'GET', null);
        $.when(attributesList).fail(function() {
            warningmsg("Cannot Find the Attributes.");
        });
        $.when(attributesList).done(function() {
            var attributesItems = (attributesList.responseJSON.Items);
            var cat = 1;
            $("#elementList").append("<optgroup label=" + parentname + " data-name=" + parentname + " value=" + parentWebId + ">");
            var url = baseServiceUrl + 'elements/' + parentWebId + '/elements?sortField=Name&selectedFields=items.name;items.webid;';
            var secondElementList = processJsonContent(url, 'GET', null);
            $.when(secondElementList).fail(function() {
                warningmsg("Cannot Find the Element On Change.");
                console.log("Cannot Find the Element.");
            });
            $.when(secondElementList).done(function() {
                var elementsChildListItems = (secondElementList.responseJSON.Items);
                $.each(elementsChildListItems, function(key) {
                    var url = baseServiceUrl + 'elements/' + elementsChildListItems[key].WebId + '/elements?sortField=Name&selectedFields=items.name;items.webid;';
                    var thirdElementList = processJsonContent(url, 'GET', null);
                    $.when(thirdElementList).fail(function() {
                        warningmsg("Cannot Find the Element On Change.");
                        console.log("Cannot Find the Element.");
                    });
                    $.when(thirdElementList).done(function() {
                        var thirdElementsChildListItems = (thirdElementList.responseJSON.Items);
                        $("#elementList").append("<optgroup style='margin-left:7px;' label=" + elementsChildListItems[key].Name + " data-name=" + elementsChildListItems[key].Name + " value=" + elementsChildListItems[key].WebId + ">");
                        $.each(thirdElementsChildListItems, function(key) {
                            $("#elementList").append("<option style='margin-left:15px;'   data-name=" + thirdElementsChildListItems[key].Name + " value=" + thirdElementsChildListItems[key].WebId + ">" + thirdElementsChildListItems[key].Name + "</option>");
                        });
                        $("#elementList").append("</optgroup>");
                    });
                });
            });
            $("#elementList").append("</optgroup>");
            $.each(attributesItems, function(key) {
                var category = attributesItems[key].CategoryNames;
                $.each(category, function(key1) {
                    if (trendCat === category[key1]) {
                        $.each(eventsColorsData, function(key1) {
                            if (attributesItems[key].Name === eventsColorsData[key1].name) {
                                $("#attributesListLeft").append('<li class="elListChild paramterList' + cat + '">\n\<input type="checkbox" id="elemList' + cat + '" data-id="' + cat + '"  data-name="' + attributesItems[key].Name + '" onchange="getChartts(' + cat + ');" class="paraList" value="' + attributesItems[key].WebId + '" name="selectorLeft">\n\
                            <label class="labelListChild leftLabel" for="elemList' + cat + '">' + attributesItems[key].Name + '</label>\n\
                            <div class="ScaleDiv">\n\
                                <input type="text" class="scales min" placeholder="Min" value="' + eventsColorsData[key1].min + '" name="min" onchange="getChartts(' + cat + ');" id="min' + cat + '">\n\
                                <input type="text" class="scales max" placeholder="Max" value="' + eventsColorsData[key1].max + '" name="max" onchange="getChartts(' + cat + ');" id="max' + cat + '">\n\
                            </div>\n\
                           </li>');
                            }
                        });
                    }
                });
                cat++;
            });
        });
    });
});

function getChartts() {
    loadEventFrames();
}

function loadEventFrames() {
    var charts;
    $("#table-responsive").empty();
    $("#table-responsive").append('<table id="example" class="table" width="100%"></table>');
    CreateTableFromJSON();
    var data = [];
    var yAxisData = [];
    var chkArray = [];
    var sr = 0;
    var startDate = $('#startDate').val();
    var startTime = $("#startTime").val();
    var startDateTime = (startDate + 'T' + startTime + 'Z');
    var endDate = $('#endDate').val();
    var endTime = $("#endTime").val();
    var endDateTime = (endDate + 'T' + endTime + 'Z');
    var vdate = '';
    var vtime = '';
    startDate = startDate.split('-');
    endDate = endDate.split('-');
    startTime = startTime.split(':');
    endTime = endTime.split(':');
    $(document).ready(function() {
        var srt = 1;
        $.each($("input[name='selectorLeft']:checked"), function() {
            var data1 = [];
            var WebId = $(this).val();
            var name = $(this).attr("data-name");
            var cat = $(this).attr("data-id");
            var min = $("#min" + cat).val();
            var max = $("#max" + cat).val();
            chkArray.push(WebId);
            var url = baseServiceUrl + 'streams/' + WebId + '/interpolated?startTime=' + startDateTime + '&endTime=' + endDateTime + '&interval=1d&selectedFields=items.Timestamp;items.Value;items.UnitsAbbreviation;&searchFullHierarchy=true';
            var attributesData = processJsonContent(url, 'GET', null);
            $.when(attributesData).fail(function() {
                console.log("Cannot Find the Attributes.");
            });
            $.when(attributesData).done(function() {
                var attributesDataItems = (attributesData.responseJSON.Items);
                var unit = '';
                $.each(attributesDataItems, function(key) {
                    var Timestamp = attributesDataItems[key].Timestamp;
                    var val = (Math.round((attributesDataItems[key].Value) * 100) / 100);
                    if (isNaN(val)) {} else {
                        vdate = (Timestamp).substring(0, 10);
                        vtime = (Timestamp).substring(11, 19);
                        vdate = vdate.split('-');
                        vtime = vtime.split(':');
                        var dt = Date.UTC(vdate[0], (vdate[1] - 1), vdate[2], vtime[0], vtime[1], vtime[2]);
                        data1.push([dt, val]);
                        unit = attributesDataItems[key].UnitsAbbreviation;
                        var t = $('#example').DataTable();
                        t.row.add([srt, name, val + '(' + unit + ')', (vdate[2] + '/' + (vdate[1]) + '/' + vdate[0])]).draw(!1);
                    }
                    srt++;
                });
                $.each(eventsColorsData, function(key) {
                    if (name === eventsColorsData[key].name) {
                        data.push({
                            name: name,
                            type: 'spline',
                            yAxis: sr,
                            color: eventsColorsData[key].color,
                            data: data1,
                            tooltip: {
                                valueSuffix: unit
                            }
                        });
                        if (min === '') {
                            min = eventsColorsData[key].min;
                        }
                        if (max === '' || max === 0) {
                            max = eventsColorsData[key].max
                        }
                        yAxisData.push({
                            min: min,
                            max: max,
                            title: {
                                text: ''
                            },
                            labels: {
                                format: '{value}' + unit,
                                style: {
                                    color: eventsColorsData[key].color
                                },
                                enabled: !1
                            }
                        });
                    }
                });
                charts = Highcharts.chart('containern', {
                    chart: {
                        zoomType: 'xy',
                        type: 'spline'
                    },
                    title: {
                        text: ''
                    },
                    subtitle: {
                        text: ''
                    },
                    xAxis: {
                        type: 'datetime'
                    },
                    yAxis: yAxisData,
                    tooltip: {
                        shared: !0
                    },
                    plotOptions: {
                        spline: {
                            lineWidth: 1,
                            states: {
                                hover: {
                                    lineWidth: 2
                                }
                            }
                        }
                    },
                    legend: {
                        layout: 'horizontal',
                        align: 'center',
                        x: 0,
                        verticalAlign: 'top',
                        y: 0,
                        floating: !0,
                        enabled: !0
                    },
                    series: data
                });
                charts.xAxis[0].setExtremes(Date.UTC(startDate[0], (startDate[1] - 1), startDate[2]), Date.UTC(endDate[0], (endDate[1] - 1), endDate[2]),true,false);
                sr++;
            });
        });
        if (chkArray.length === 0) {
            $("#containern").empty();
        } else {}
    });
}

function CreateTableFromJSON() {
    $('#example').DataTable({
        dom: 'Bfrtip',
        buttons: ['pageLength', 'copy', 'csv', 'excel', 'print'],
        columns: [{
            title: "Sr.No."
        }, {
            title: "Name"
        }, {
            title: "Value(Unit)"
        }, {
            title: "Date"
        }]
    });
}