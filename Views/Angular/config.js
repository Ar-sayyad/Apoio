/***CONFIGURATION SETTING***/

var baseServiceUrl = ""; /***PI WEBAPI URL***/
var user = "";/***USERNAME***/
var pass = "";/***PASSWORD***/
var afServerName = "";/***AF SERVER NAME***/
var afDatabaseName = "";/***DATABASE NAME***/
var EnumerationSets = "CONNECTED_TO_PLANT";/***ENUMERATION SET NAME***/
var templateName = "";/***DEFAULT TEMPLATE NAME***/
var catNameGenrate = "asset_design_";/***CATEGORY NAME GENRATION IN CODING NOT REMOVE THIS***/
var trendCat = "masterdashboard_trend";/***TREND DATA CATEGORY NAME***/
var valueCat = "masterdashboard_value";/***CATEGORY FOR VALUE***/
var timestampCat = "masterdashboard_timestamp";/***CATEGORY FOR TIMESTAMP***/
var filterCategoryName = "asset_design";/****CATEGORY NAME FOR FILTER ELEMENT TEMPLATE****/
var allocationAttributeName = "PLANT";/****The Plant Attributes Name for save the allocation page data***/
var iframeConfigUrl = "http://www.google.com"; //IFRAME URL 
var eventsColorsData = [
    {
        "name":"BALANCE","color":"#058DC7","min":0,"max":150 
    },
    {
        "name":"U","color":"#50B432","min":0,"max":130 
    },
    { 
        "name":"KU","color":"#ED561B","min":0,"max":170 
    },
    { 
        "name":"PH","color":"#DDDF00", "min":0, "max":200 
    },
    { 
        "name":"PR","color":"#24CBE5",  "min":0, "max":210
    },
    {
        "name":"VR","color":"#64E572","min":0,"max":220 
    },
    { 
        "name":"ACIDIFICATION","color":"#FF9655","min":0,"max":200
    },
    { 
        "name":"PLANT","color":"#FFF263","min":0,"max":200
    },
    { 
        "name":"STATUS","color":"#6AF9C4","min":0,"max":200
    }
]; ///CHART ELEMENT ATTRIBUTES JSON ARRAY KEEP MIN=0 AND ALL ATTRIBUTES SHOULD IN PROPER FORMAT

var EFData = [
    {
        "efName":"EFT1","color":"#058DC7"
    },
    {
        "efName":"EFT2","color":"#50B432"
    },
    { 
        "efName":"EFT3","color":"#ED561B"
    },
    { 
        "efName":"EFT4","color":"#DDDF00"
    },
    { 
        "efName":"EFT5","color":"#24CBE5"
    }
]; ///EVENT FRAME DATA JSON ARRAY 

/***CONFIGURATION SETTING***/
