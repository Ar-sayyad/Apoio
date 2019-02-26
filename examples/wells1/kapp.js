
var kApp =  (function() {

    var self = {};

    self.params = {};

    self.list_locale = {
        en: 'English'
        ,fr: 'Français'
        ,ru: 'Русский'
        //,kk: 'Қазақша'
    };
    
    self.locale = {
        langdesc: { en: 'Change language', fr: 'Changer la langue' }
    };

    self.localize = function() {

        if (!self.params.l) self.setParam('l', (navigator.language || navigator.userLanguage).substring(0, 2), true);

        $('[locale-id]').each(function() { $(this).html(_($(this).attr('locale-id'))); });
        $('[locale-title-id]').each(function() { $(this).attr('title', _($(this).attr('locale-title-id'))); });

        $('#kLangIcon').removeClass().addClass('kLang').addClass(this.params.l);

        if (self.localizeCallback) self.localizeCallback();

        return;

    }

    self.getLocale = function(key) {
        
        if (self.params.l) {
            if (self.locale[key]) {
                if (self.locale[key][self.params.l]) {
                    return self.locale[key][self.params.l];
                }
            }
        }

        return '\'' + key + ':' + self.params.l + '\'';

    }
    
    window._ = self.getLocale;
      
    self.setParam = function(key, value, iscookie) {

        self.params[key.toString().trim()] = value.toString();
        
        if (iscookie) self.setCookie(key, value);

        return;

      }
      
    self.setCookie = function(key, value) {
        
        var d = new Date();
        
        d.setFullYear(d.getFullYear() + 1);
        
        document.cookie = key.toString().trim() + '=' + value.toString() + ';expires=' + d.toGMTString() + ';path=/';

        return;

    }
      
    self.deleteCookie = function(key) {
        
        var d = new Date();
        
        d.setFullYear(d.getFullYear() - 1);

        document.cookie = key.toString().trim() + '=;expires=' + d.toGMTString() + ';path=/';

        return;

    }

    self.genLanguageList = function(id) {
        
        var $ul = $('<ul />').addClass('dropdown-menu').appendTo(
            $('<li />').addClass('dropdown').attr('id', 'kLanguages').attr('locale-title-id', 'langdesc').append(
                $('<a />').addClass('dropdown-toggle').attr('data-toggle', 'dropdown').attr('href', 'javascript:void(0);').append(
                    $('<span />').attr('id', 'kLangIcon').addClass('kLang').addClass(self.params.l)
                ).append(
                    $('<span />').addClass('caret')
                )
            ).appendTo(
                $('#' + id)
            )
        );

        Object.keys(self.list_locale).forEach(function(i) {
            $ul.append(
                $('<li />').append(
                    $('<a />').attr('href', 'javascript:void(0);').click(function() {
                        self.setParam('l', i, true);
                        self.localize();
                    }).append(
                        $('<span />').addClass('kLang').addClass(i)
                    ).append(self.list_locale[i])
                )
            );
        });

        return;

    }

    self.stringify = function(obj) {

        var seen = [];

        return JSON.stringify(obj, function(key, val) {

          if (val != null && typeof val === "object") {

            if (seen.indexOf(val) >= 0) { return; }
            
            seen.push(val);

          }

          return val;

        });

    }

    self.$alertContainer = $('body');

    self.setAlertContainer = function(id) {

        self.$alertContainer = $('#' + id);

        return;

    }

    self.showAlert = function(type, msg, msg2, display) {

        if (!display) display = 10000;

        self.$alertContainer.prepend(
          $('<div />').addClass('alert').addClass('alert-' + type).append(
            (msg2 === undefined) ? null : $('<strong />').html(msg2)
          ).append('&nbsp;' + msg).fadeTo(display, 500).slideUp(500, function() {
            $(this).remove();
          })
        );

        return;

    }
    
    self.queryJSON = function kApp_queryJSON(url, requestData, mode, successCallback, processResponse) {
      $.ajax({
        type: mode
        ,headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
        ,url: url
        ,data: JSON.stringify(requestData)
        ,crossDomain: true
        ,xhrFields: { withCredentials: true }
        ,dataType: 'json'
        ,success: successCallback
        ,converters: {'* text': window.String, 'text html': processResponse ? true : window.String, 'text json': processResponse ? jQuery.parseJSON : window.String, "text xml": processResponse ? jQuery.parseXML: window.String}
        ,error: function kApp_queryJSON_error(xhr, exception) { console.log(exception); console.log(xhr); return; }
      });
    }

    self.localizeCallback = null;

    location.search.substr(1).split('&').forEach(function (item) {
        self.params[item.split('=')[0]] = item.split('=')[1];
    });
    
    document.cookie.split(';').forEach(function (item) {
        if (!self.params[item.trim().split('=')[0]]) {
            self.params[item.trim().split('=')[0]] = item.trim().split('=')[1];
        }
    });
    
    $(document).ajaxStart(function() { $('.kLoader').show(); }).ajaxStop(function() { $('.kLoader').hide(); });
    
    $(window).on('beforeunload', function() { $('.kLoader').show(); });

    return self;

}());

