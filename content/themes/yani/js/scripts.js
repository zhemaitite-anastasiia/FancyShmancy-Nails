var Nanobar = (function () {

    'use strict';
    var addCss, Bar, Nanobar, move, place, init,
      // container styles
      cssCont = {
        width: '100%',
        height: '2px',
        zIndex: 9999,
        top : '0'
      },
      // bar styles
      cssBar = {
        width:0,
        height: '100%',
        clear: 'both',
        transition: 'height .3s'
      };
  
  
    // add `css` to `el` element
    addCss = function (el, css ) {
      var i;
      for (i in css) {
        el.style[i] = css[i];
      }
      el.style.float = 'left';
    };
  
    // animation loop
    move = function () {
      var self = this,
        dist = this.width - this.here;
  
      if (dist < 0.1 && dist > -0.1) {
        place.call( this, this.here );
        this.moving = false;
        if (this.width == 100) {
          this.el.style.height = 0;
          setTimeout( function () {
            self.cont.el.removeChild( self.el );
          }, 300);
        }
      } else {
        place.call( this, this.width - (dist/4) );
        setTimeout( function () {
          self.go();
        }, 16);
      }
    };
  
    // set bar width
    place = function (num) {
      this.width = num;
      this.el.style.width = this.width + '%';
    };
  
    // create and insert bar in DOM and this.bars array
    init = function () {
      var bar = new Bar( this );
      this.bars.unshift( bar );
    };
  
    Bar = function ( cont ) {
      // create progress element
      this.el = document.createElement( 'div' );
      this.el.style.backgroundColor = cont.opts.bg;
      this.width = 0;
      this.here = 0;
      this.moving = false;
      this.cont = cont;
      addCss( this.el, cssBar);
      cont.el.appendChild( this.el );
    };
  
    Bar.prototype.go = function (num) {
      if (num) {
        this.here = num;
        if (!this.moving) {
          this.moving = true;
          move.call( this );
        }
      } else if (this.moving) {
        move.call( this );
      }
    };
  
  
    Nanobar = function (opt) {
  
      var opts = this.opts = opt || {},
        el;
  
      // set options
      opts.bg = opts.bg || '#000';
      this.bars = [];
  
  
      // create bar container
      el = this.el = document.createElement( 'div' );
      // append style
      addCss( this.el, cssCont);
      if (opts.id) {
        el.id = opts.id;
      }
      // set CSS position
      el.style.position = !opts.target ? 'fixed' : 'relative';
  
      // insert container
      if (!opts.target) {
        document.getElementsByTagName( 'body' )[0].appendChild( el );
      } else {
        opts.target.insertBefore( el, opts.target.firstChild);
      }
  
      init.call( this );
    };
  
  
    Nanobar.prototype.go = function (p) {
      // expand bar
      this.bars[0].go( p );
  
      // create new bar at progress end
      if (p == 100) {
        init.call( this );
      }
    };
  
    return Nanobar;
  })();
  
  
  (function($) {
    var nanobar = new Nanobar( {
      bg: '#000',
      id: 'mynano'
    });
  
    var $themesOptions = '';
    var trackedName = "";
  
  
    /**
     * Determine the mobile operating system.
     * This function either returns 'iOS', 'Android' or 'unknown'
     *
     * @returns {String}
     */
    function getMobileOperatingSystem() {
      var userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
      if( userAgent.match( /iPad/i ) || userAgent.match( /iPhone/i ) || userAgent.match( /iPod/i ) ) {
        return 'iOS';
      }
      else if( userAgent.match( /Android/i ) ) {
        return 'Android';
      }
      else {
        return 'unknown';
      }
    }
  
  
    /**
    * Create AJAX request to get All Links
    **/
    function getTheme(themeName, option) {
  
      themeName = themeName || false;
      option = option || false;
  
      var themeIsAvailable = theme !== null && theme != 'null';
  
        if (themeIsAvailable) {
          var themeData = jQuery('.theme-data').html();
          var theme = $.parseJSON(themeData);
          prepareTheme(theme);
  
        } else {
          console.error('Incorect Theme Name');
        }
    }
  
    /**
    * Parse URL to get paramsObj with Theme Name
    **/
    function parseURL(url) {
      var parser = document.createElement('a'),
          searchObject = {},
          queries, split, i;
  
      // Let the browser do the work
      parser.href = url;
  
      // Convert query string to object
      queries = parser.search.replace(/^\?/, '').split('&');
  
      for( i = 0; i < queries.length; i++ ) {
          split = queries[i].split('=');
          searchObject[split[0]] = split[1];
      }
  
      return {
          params: parser.search,
          paramsObj: searchObject,
          hash: parser.hash
      };
    }
  
    /**
    * Prepare Theme to render
    **/
    function prepareTheme(theme) {
  
      var themeIsMultiversion = theme.version_type == 'multiversion';
  
      if (themeIsMultiversion) {
        renderThemeOptions(theme.site_links);
  
        if(currentOption) {
          for (var i = 0; i < theme.site_links.length; i++) {
            if(theme.site_links[i].name == currentOption) {
              theme.site_link = theme.site_links[i].link;
              break;
  
            } else {
              theme.site_link = theme.site_links[0].link;
            }
          }
        } else {
          theme.site_link = theme.site_links[0].link;
        }
      }
  
      trackedName = theme.title;
  
      if (getMobileOperatingSystem() != 'unknown' ) {
        document.location.href = theme.site_link;
      }
  
      renderTheme(theme.site_link, theme.title);
  
      $('header #logo').attr('href', 'https://themestash.com/products/' + trackedName);
      $('.theme-nav a.more').attr('href', theme.site_shop_link.replace('&amp;', '&'));
      $('.theme-nav a.more').attr('data-theme', theme.title);
      $('.theme-name').text(theme.title);
      $('.theme-desc').text(theme.desc);
    }
  
    /**
    * Render theme Option Select checkbox
    **/
    function renderTheme(link, title) {
      var $iFrame = $('#demo'),
          $layout = $('.layout');
  
      var currentTitle = $('title').html();
  
      var nanobarPos = 0;
  
      var nanobarInterval = setInterval(function() {
  
          if (nanobarPos != 90) {
            nanobarPos = nanobarPos + 0.4;
            nanobar.go(nanobarPos);
          }
  
      }, 10);
  
      // Chage page title on title with Theme Name
      $('title').html(currentTitle + ' -> ' + title);
  
      var iflayoutIsActive = $layout.hasClass('active');
  
      if (iflayoutIsActive) {
        $layout.removeClass('active');
      }
  
      // Load Iframe
      $iFrame.attr('src', link);
  
      $('a.close-btn').attr('href', link);
  
      $iFrame.load(function() {
  
        $layout.addClass('active');
  
        clearTimeout(nanobarInterval);
        nanobar.go( 100 );
  
        var themeNavIsActive = $('.navigation').hasClass('active');
  
        if (! themeNavIsActive) {
          $('.navigation').addClass('active');
        }
      });
    }
  
    /**
    * Render theme Option Select checkbox
    **/
    function renderThemeOptions(links) {
      var thereIsNoActiveOptions = true;
  
      for (var i = 0; i < links.length; i++) {
  
        var $option = $('<a>');
  
        $option.attr('href', links[i].link)
               .attr('data-number', i + 1)
               .attr('data-name', links[i].name)
               .attr('data-color', links[i].style_kit_color)
               .attr('style','--var-color:'+links[i].style_kit_color)
               .html(links[i].name)
               .addClass('option');
  
        if (currentOption) {
          if (currentOption == links[i].name) {
            $option.addClass('active');
  
            thereIsNoActiveOptions = false;
          }
        } else if (i === 0) {
  
          $option.addClass('active');
  
          thereIsNoActiveOptions = false;
        }
  
        $themesOptions.append($option);
      }
  
      if (thereIsNoActiveOptions) {
        $themesOptions.find('.option:first-child').addClass('active');
      }
  
      $themesOptions.find('.option').click(function(event) {
        event.preventDefault();
  
        var thisOptionIsActive = $(this).hasClass('active');
  
        if (! thisOptionIsActive) {
  
          $themesOptions.find('.active').removeClass('active');
  
          $(this).addClass('active');
  
          var themeLink = $(this).attr('href');
          var themeName = $(this).html();
  
          window.location.hash = themeName;
  
          // ga('send', 'event', currentTheme, 'Demo Switch', currentTheme + ' - ' +themeName );
  
          renderTheme(themeLink, themeName);
        }
      });
  
      jQuery('.thm-lst a').click(function(event) {
        event.preventDefault();
  
        var thisOptionIsActive = $(this).hasClass('active');
  
        if (! thisOptionIsActive) {
  
          $themesOptions.find('.active').removeClass('active');
  
          $(this).addClass('active');
  
          var themeLink = $(this).attr('href');
          var themeName = $(this).attr('data-name');
  
          window.location = window.location.origin + window.location.pathname + '?theme='+ themeName.toLowerCase();
  
          // ga('send', 'event', themeName, 'Theme Switch', currentTheme + ' - ' + themeName );
  
          renderTheme(themeLink, themeName);
        }
      });
  
      $(document).mouseup(function(e)
      {
          var container = $('.thm-lst');
  
          // if the target of the click isn't the container nor a descendant of the container
          if (!container.is(e.target) && container.has(e.target).length === 0)
          {
              container.hide();
          }
      });
    }
  
    function reloadIframe() {
      var iframe = document.getElementById('demo');
      iframe.src = iframe.src;
    }
  
  
  
    var currentUrl = parseURL(window.location.href);
  
    var currentTheme = currentUrl.paramsObj.theme || false;
  
    var currentOption  = currentUrl.hash || false;
  
    if(currentOption) {
      currentOption = currentOption.replace('#', '');
    } else {
      currentOption = 'Overview';
    }
  
  
   $(document).ready(function() {
  
     $('#logo').on('click', function(){
       // ga('send', 'event', currentTheme, 'Back to TouchSize', 'From ' + currentTheme + ' - ' + currentOption );
     });
     $('.btn.more').on('click', function(){
       // ga('send', 'event', currentTheme, 'Buy Now', currentTheme + ' - ' + currentOption );
     });
  
     $('.theme-dts').on('click', function(){
       jQuery(this).find('.thm-lst').toggle();
     });
  
      $themesOptions = $('.theme-nav .options');
  
      getTheme(currentTheme, currentOption);
  
      $('.screen-select').each(function() {
        var screenOption = $(this).data('screen');
  
        $(this).click(function() {
  
          // ga('send', 'event', currentTheme, 'Device Resize', 'Switched to ' + screenOption);
  
          reloadIframe();
  
          $('.screen-selecter').find('.active').removeClass('active');
  
          $(this).addClass('active');
  
          $('.layout').attr('data-screen', screenOption);
        });
      });
  
  
    });
  
  })(jQuery);
  
  
  (function($){'use strict';if(typeof wpcf7==='undefined'||wpcf7===null){return;}
  wpcf7=$.extend({cached:0,inputs:[]},wpcf7);$(function(){wpcf7.supportHtml5=(function(){var features={};var input=document.createElement('input');features.placeholder='placeholder'in input;var inputTypes=['email','url','tel','number','range','date'];$.each(inputTypes,function(index,value){input.setAttribute('type',value);features[value]=input.type!=='text';});return features;})();$('div.wpcf7 > form').each(function(){var $form=$(this);wpcf7.initForm($form);if(wpcf7.cached){wpcf7.refill($form);}});});wpcf7.getId=function(form){return parseInt($('input[name="_wpcf7"]',form).val(),10);};wpcf7.initForm=function(form){var $form=$(form);$form.submit(function(event){if(!wpcf7.supportHtml5.placeholder){$('[placeholder].placeheld',$form).each(function(i,n){$(n).val('').removeClass('placeheld');});}
  if(typeof window.FormData==='function'){wpcf7.submit($form);event.preventDefault();}});$('.wpcf7-submit',$form).after('<span class="ajax-loader"></span>');wpcf7.toggleSubmit($form);$form.on('click','.wpcf7-acceptance',function(){wpcf7.toggleSubmit($form);});$('.wpcf7-exclusive-checkbox',$form).on('click','input:checkbox',function(){var name=$(this).attr('name');$form.find('input:checkbox[name="'+name+'"]').not(this).prop('checked',false);});$('.wpcf7-list-item.has-free-text',$form).each(function(){var $freetext=$(':input.wpcf7-free-text',this);var $wrap=$(this).closest('.wpcf7-form-control');if($(':checkbox, :radio',this).is(':checked')){$freetext.prop('disabled',false);}else{$freetext.prop('disabled',true);}
  $wrap.on('change',':checkbox, :radio',function(){var $cb=$('.has-free-text',$wrap).find(':checkbox, :radio');if($cb.is(':checked')){$freetext.prop('disabled',false).focus();}else{$freetext.prop('disabled',true);}});});if(!wpcf7.supportHtml5.placeholder){$('[placeholder]',$form).each(function(){$(this).val($(this).attr('placeholder'));$(this).addClass('placeheld');$(this).focus(function(){if($(this).hasClass('placeheld')){$(this).val('').removeClass('placeheld');}});$(this).blur(function(){if(''===$(this).val()){$(this).val($(this).attr('placeholder'));$(this).addClass('placeheld');}});});}
  if(wpcf7.jqueryUi&&!wpcf7.supportHtml5.date){$form.find('input.wpcf7-date[type="date"]').each(function(){$(this).datepicker({dateFormat:'yy-mm-dd',minDate:new Date($(this).attr('min')),maxDate:new Date($(this).attr('max'))});});}
  if(wpcf7.jqueryUi&&!wpcf7.supportHtml5.number){$form.find('input.wpcf7-number[type="number"]').each(function(){$(this).spinner({min:$(this).attr('min'),max:$(this).attr('max'),step:$(this).attr('step')});});}
  $('.wpcf7-character-count',$form).each(function(){var $count=$(this);var name=$count.attr('data-target-name');var down=$count.hasClass('down');var starting=parseInt($count.attr('data-starting-value'),10);var maximum=parseInt($count.attr('data-maximum-value'),10);var minimum=parseInt($count.attr('data-minimum-value'),10);var updateCount=function(target){var $target=$(target);var length=$target.val().length;var count=down?starting-length:length;$count.attr('data-current-value',count);$count.text(count);if(maximum&&maximum<length){$count.addClass('too-long');}else{$count.removeClass('too-long');}
  if(minimum&&length<minimum){$count.addClass('too-short');}else{$count.removeClass('too-short');}};$(':input[name="'+name+'"]',$form).each(function(){updateCount(this);$(this).keyup(function(){updateCount(this);});});});$form.on('change','.wpcf7-validates-as-url',function(){var val=$.trim($(this).val());if(val&&!val.match(/^[a-z][a-z0-9.+-]*:/i)&&-1!==val.indexOf('.')){val=val.replace(/^\/+/,'');val='https://'+val;}
  $(this).val(val);});};wpcf7.submit=function(form){if(typeof window.FormData!=='function'){return;}
  var $form=$(form);$('.ajax-loader',$form).addClass('is-active');wpcf7.clearResponse($form);var formData=new FormData($form.get(0));var detail={id:$form.closest('div.wpcf7').attr('id'),status:'init',inputs:[],formData:formData};$.each($form.serializeArray(),function(i,field){if('_wpcf7'==field.name){detail.contactFormId=field.value;}else if('_wpcf7_version'==field.name){detail.pluginVersion=field.value;}else if('_wpcf7_locale'==field.name){detail.contactFormLocale=field.value;}else if('_wpcf7_unit_tag'==field.name){detail.unitTag=field.value;}else if('_wpcf7_container_post'==field.name){detail.containerPostId=field.value;}else if(field.name.match(/^_wpcf7_\w+_free_text_/)){var owner=field.name.replace(/^_wpcf7_\w+_free_text_/,'');detail.inputs.push({name:owner+'-free-text',value:field.value});}else if(field.name.match(/^_/)){}else{detail.inputs.push(field);}});wpcf7.triggerEvent($form.closest('div.wpcf7'),'beforesubmit',detail);var ajaxSuccess=function(data,status,xhr,$form){detail.id=$(data.into).attr('id');detail.status=data.status;detail.apiResponse=data;var $message=$('.wpcf7-response-output',$form);switch(data.status){case'validation_failed':$.each(data.invalidFields,function(i,n){$(n.into,$form).each(function(){wpcf7.notValidTip(this,n.message);$('.wpcf7-form-control',this).addClass('wpcf7-not-valid');$('[aria-invalid]',this).attr('aria-invalid','true');});});$message.addClass('wpcf7-validation-errors');$form.addClass('invalid');wpcf7.triggerEvent(data.into,'invalid',detail);break;case'acceptance_missing':$message.addClass('wpcf7-acceptance-missing');$form.addClass('unaccepted');wpcf7.triggerEvent(data.into,'unaccepted',detail);break;case'spam':$message.addClass('wpcf7-spam-blocked');$form.addClass('spam');wpcf7.triggerEvent(data.into,'spam',detail);break;case'aborted':$message.addClass('wpcf7-aborted');$form.addClass('aborted');wpcf7.triggerEvent(data.into,'aborted',detail);break;case'mail_sent':$message.addClass('wpcf7-mail-sent-ok');$form.addClass('sent');wpcf7.triggerEvent(data.into,'mailsent',detail);break;case'mail_failed':$message.addClass('wpcf7-mail-sent-ng');$form.addClass('failed');wpcf7.triggerEvent(data.into,'mailfailed',detail);break;default:var customStatusClass='custom-'
  +data.status.replace(/[^0-9a-z]+/i,'-');$message.addClass('wpcf7-'+customStatusClass);$form.addClass(customStatusClass);}
  wpcf7.refill($form,data);wpcf7.triggerEvent(data.into,'submit',detail);if('mail_sent'==data.status){$form.each(function(){this.reset();});wpcf7.toggleSubmit($form);}
  if(!wpcf7.supportHtml5.placeholder){$form.find('[placeholder].placeheld').each(function(i,n){$(n).val($(n).attr('placeholder'));});}
  $message.html('').append(data.message).slideDown('fast');$message.attr('role','alert');$('.screen-reader-response',$form.closest('.wpcf7')).each(function(){var $response=$(this);$response.html('').attr('role','').append(data.message);if(data.invalidFields){var $invalids=$('<ul></ul>');$.each(data.invalidFields,function(i,n){if(n.idref){var $li=$('<li></li>').append($('<a></a>').attr('href','#'+n.idref).append(n.message));}else{var $li=$('<li></li>').append(n.message);}
  $invalids.append($li);});$response.append($invalids);}
  $response.attr('role','alert').focus();});};$.ajax({type:'POST',url:wpcf7.apiSettings.getRoute('/contact-forms/'+wpcf7.getId($form)+'/feedback'),data:formData,dataType:'json',processData:false,contentType:false}).done(function(data,status,xhr){ajaxSuccess(data,status,xhr,$form);$('.ajax-loader',$form).removeClass('is-active');}).fail(function(xhr,status,error){var $e=$('<div class="ajax-error"></div>').text(error.message);$form.after($e);});};wpcf7.triggerEvent=function(target,name,detail){var $target=$(target);var event=new CustomEvent('wpcf7'+name,{bubbles:true,detail:detail});$target.get(0).dispatchEvent(event);$target.trigger('wpcf7:'+name,detail);$target.trigger(name+'.wpcf7',detail);};wpcf7.toggleSubmit=function(form,state){var $form=$(form);var $submit=$('input:submit',$form);if(typeof state!=='undefined'){$submit.prop('disabled',!state);return;}
  if($form.hasClass('wpcf7-acceptance-as-validation')){return;}
  $submit.prop('disabled',false);$('.wpcf7-acceptance',$form).each(function(){var $span=$(this);var $input=$('input:checkbox',$span);if(!$span.hasClass('optional')){if($span.hasClass('invert')&&$input.is(':checked')||!$span.hasClass('invert')&&!$input.is(':checked')){$submit.prop('disabled',true);return false;}}});};wpcf7.notValidTip=function(target,message){var $target=$(target);$('.wpcf7-not-valid-tip',$target).remove();$('<span role="alert" class="wpcf7-not-valid-tip"></span>').text(message).appendTo($target);if($target.is('.use-floating-validation-tip *')){var fadeOut=function(target){$(target).not(':hidden').animate({opacity:0},'fast',function(){$(this).css({'z-index':-100});});};$target.on('mouseover','.wpcf7-not-valid-tip',function(){fadeOut(this);});$target.on('focus',':input',function(){fadeOut($('.wpcf7-not-valid-tip',$target));});}};wpcf7.refill=function(form,data){var $form=$(form);var refillCaptcha=function($form,items){$.each(items,function(i,n){$form.find(':input[name="'+i+'"]').val('');$form.find('img.wpcf7-captcha-'+i).attr('src',n);var match=/([0-9]+)\.(png|gif|jpeg)$/.exec(n);$form.find('input:hidden[name="_wpcf7_captcha_challenge_'+i+'"]').attr('value',match[1]);});};var refillQuiz=function($form,items){$.each(items,function(i,n){$form.find(':input[name="'+i+'"]').val('');$form.find(':input[name="'+i+'"]').siblings('span.wpcf7-quiz-label').text(n[0]);$form.find('input:hidden[name="_wpcf7_quiz_answer_'+i+'"]').attr('value',n[1]);});};if(typeof data==='undefined'){$.ajax({type:'GET',url:wpcf7.apiSettings.getRoute('/contact-forms/'+wpcf7.getId($form)+'/refill'),beforeSend:function(xhr){var nonce=$form.find(':input[name="_wpnonce"]').val();if(nonce){xhr.setRequestHeader('X-WP-Nonce',nonce);}},dataType:'json'}).done(function(data,status,xhr){if(data.captcha){refillCaptcha($form,data.captcha);}
  if(data.quiz){refillQuiz($form,data.quiz);}});}else{if(data.captcha){refillCaptcha($form,data.captcha);}
  if(data.quiz){refillQuiz($form,data.quiz);}}};wpcf7.clearResponse=function(form){var $form=$(form);$form.removeClass('invalid spam sent failed');$form.siblings('.screen-reader-response').html('').attr('role','');$('.wpcf7-not-valid-tip',$form).remove();$('[aria-invalid]',$form).attr('aria-invalid','false');$('.wpcf7-form-control',$form).removeClass('wpcf7-not-valid');$('.wpcf7-response-output',$form).hide().empty().removeAttr('role').removeClass('wpcf7-mail-sent-ok wpcf7-mail-sent-ng wpcf7-validation-errors wpcf7-spam-blocked');};wpcf7.apiSettings.getRoute=function(path){var url=wpcf7.apiSettings.root;url=url.replace(wpcf7.apiSettings.namespace,wpcf7.apiSettings.namespace+path);return url;};})(jQuery);(function(){if(typeof window.CustomEvent==="function")return false;function CustomEvent(event,params){params=params||{bubbles:false,cancelable:false,detail:undefined};var evt=document.createEvent('CustomEvent');evt.initCustomEvent(event,params.bubbles,params.cancelable,params.detail);return evt;}
  CustomEvent.prototype=window.Event.prototype;window.CustomEvent=CustomEvent;})();;
  /*!
   * Bootstrap v3.1.1 (https://getbootstrap.com)
   * Copyright 2011-2014 Twitter, Inc.
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
   */
  if("undefined"==typeof jQuery)throw new Error("Bootstrap's JavaScript requires jQuery");+function(a){"use strict";function b(){var a=document.createElement("bootstrap"),b={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"};for(var c in b)if(void 0!==a.style[c])return{end:b[c]};return!1}a.fn.emulateTransitionEnd=function(b){var c=!1,d=this;a(this).one(a.support.transition.end,function(){c=!0});var e=function(){c||a(d).trigger(a.support.transition.end)};return setTimeout(e,b),this},a(function(){a.support.transition=b()})}(jQuery),+function(a){"use strict";var b='[data-dismiss="alert"]',c=function(c){a(c).on("click",b,this.close)};c.prototype.close=function(b){function c(){f.trigger("closed.bs.alert").remove()}var d=a(this),e=d.attr("data-target");e||(e=d.attr("href"),e=e&&e.replace(/.*(?=#[^\s]*$)/,""));var f=a(e);b&&b.preventDefault(),f.length||(f=d.hasClass("alert")?d:d.parent()),f.trigger(b=a.Event("close.bs.alert")),b.isDefaultPrevented()||(f.removeClass("in"),a.support.transition&&f.hasClass("fade")?f.one(a.support.transition.end,c).emulateTransitionEnd(150):c())};var d=a.fn.alert;a.fn.alert=function(b){return this.each(function(){var d=a(this),e=d.data("bs.alert");e||d.data("bs.alert",e=new c(this)),"string"==typeof b&&e[b].call(d)})},a.fn.alert.Constructor=c,a.fn.alert.noConflict=function(){return a.fn.alert=d,this},a(document).on("click.bs.alert.data-api",b,c.prototype.close)}(jQuery),+function(a){"use strict";var b=function(c,d){this.$element=a(c),this.options=a.extend({},b.DEFAULTS,d),this.isLoading=!1};b.DEFAULTS={loadingText:"loading..."},b.prototype.setState=function(b){var c="disabled",d=this.$element,e=d.is("input")?"val":"html",f=d.data();b+="Text",f.resetText||d.data("resetText",d[e]()),d[e](f[b]||this.options[b]),setTimeout(a.proxy(function(){"loadingText"==b?(this.isLoading=!0,d.addClass(c).attr(c,c)):this.isLoading&&(this.isLoading=!1,d.removeClass(c).removeAttr(c))},this),0)},b.prototype.toggle=function(){var a=!0,b=this.$element.closest('[data-toggle="buttons"]');if(b.length){var c=this.$element.find("input");"radio"==c.prop("type")&&(c.prop("checked")&&this.$element.hasClass("active")?a=!1:b.find(".active").removeClass("active")),a&&c.prop("checked",!this.$element.hasClass("active")).trigger("change")}a&&this.$element.toggleClass("active")};var c=a.fn.button;a.fn.button=function(c){return this.each(function(){var d=a(this),e=d.data("bs.button"),f="object"==typeof c&&c;e||d.data("bs.button",e=new b(this,f)),"toggle"==c?e.toggle():c&&e.setState(c)})},a.fn.button.Constructor=b,a.fn.button.noConflict=function(){return a.fn.button=c,this},a(document).on("click.bs.button.data-api","[data-toggle^=button]",function(b){var c=a(b.target);c.hasClass("btn")||(c=c.closest(".btn")),c.button("toggle"),b.preventDefault()})}(jQuery),+function(a){"use strict";var b=function(b,c){this.$element=a(b),this.$indicators=this.$element.find(".carousel-indicators"),this.options=c,this.paused=this.sliding=this.interval=this.$active=this.$items=null,"hover"==this.options.pause&&this.$element.on("mouseenter",a.proxy(this.pause,this)).on("mouseleave",a.proxy(this.cycle,this))};b.DEFAULTS={interval:5e3,pause:"hover",wrap:!0},b.prototype.cycle=function(b){return b||(this.paused=!1),this.interval&&clearInterval(this.interval),this.options.interval&&!this.paused&&(this.interval=setInterval(a.proxy(this.next,this),this.options.interval)),this},b.prototype.getActiveIndex=function(){return this.$active=this.$element.find(".item.active"),this.$items=this.$active.parent().children(),this.$items.index(this.$active)},b.prototype.to=function(b){var c=this,d=this.getActiveIndex();return b>this.$items.length-1||0>b?void 0:this.sliding?this.$element.one("slid.bs.carousel",function(){c.to(b)}):d==b?this.pause().cycle():this.slide(b>d?"next":"prev",a(this.$items[b]))},b.prototype.pause=function(b){return b||(this.paused=!0),this.$element.find(".next, .prev").length&&a.support.transition&&(this.$element.trigger(a.support.transition.end),this.cycle(!0)),this.interval=clearInterval(this.interval),this},b.prototype.next=function(){return this.sliding?void 0:this.slide("next")},b.prototype.prev=function(){return this.sliding?void 0:this.slide("prev")},b.prototype.slide=function(b,c){var d=this.$element.find(".item.active"),e=c||d[b](),f=this.interval,g="next"==b?"left":"right",h="next"==b?"first":"last",i=this;if(!e.length){if(!this.options.wrap)return;e=this.$element.find(".item")[h]()}if(e.hasClass("active"))return this.sliding=!1;var j=a.Event("slide.bs.carousel",{relatedTarget:e[0],direction:g});return this.$element.trigger(j),j.isDefaultPrevented()?void 0:(this.sliding=!0,f&&this.pause(),this.$indicators.length&&(this.$indicators.find(".active").removeClass("active"),this.$element.one("slid.bs.carousel",function(){var b=a(i.$indicators.children()[i.getActiveIndex()]);b&&b.addClass("active")})),a.support.transition&&this.$element.hasClass("slide")?(e.addClass(b),e[0].offsetWidth,d.addClass(g),e.addClass(g),d.one(a.support.transition.end,function(){e.removeClass([b,g].join(" ")).addClass("active"),d.removeClass(["active",g].join(" ")),i.sliding=!1,setTimeout(function(){i.$element.trigger("slid.bs.carousel")},0)}).emulateTransitionEnd(1e3*d.css("transition-duration").slice(0,-1))):(d.removeClass("active"),e.addClass("active"),this.sliding=!1,this.$element.trigger("slid.bs.carousel")),f&&this.cycle(),this)};var c=a.fn.carousel;a.fn.carousel=function(c){return this.each(function(){var d=a(this),e=d.data("bs.carousel"),f=a.extend({},b.DEFAULTS,d.data(),"object"==typeof c&&c),g="string"==typeof c?c:f.slide;e||d.data("bs.carousel",e=new b(this,f)),"number"==typeof c?e.to(c):g?e[g]():f.interval&&e.pause().cycle()})},a.fn.carousel.Constructor=b,a.fn.carousel.noConflict=function(){return a.fn.carousel=c,this},a(document).on("click.bs.carousel.data-api","[data-slide], [data-slide-to]",function(b){var c,d=a(this),e=a(d.attr("data-target")||(c=d.attr("href"))&&c.replace(/.*(?=#[^\s]+$)/,"")),f=a.extend({},e.data(),d.data()),g=d.attr("data-slide-to");g&&(f.interval=!1),e.carousel(f),(g=d.attr("data-slide-to"))&&e.data("bs.carousel").to(g),b.preventDefault()}),a(window).on("load",function(){a('[data-ride="carousel"]').each(function(){var b=a(this);b.carousel(b.data())})})}(jQuery),+function(a){"use strict";var b=function(c,d){this.$element=a(c),this.options=a.extend({},b.DEFAULTS,d),this.transitioning=null,this.options.parent&&(this.$parent=a(this.options.parent)),this.options.toggle&&this.toggle()};b.DEFAULTS={toggle:!0},b.prototype.dimension=function(){var a=this.$element.hasClass("width");return a?"width":"height"},b.prototype.show=function(){if(!this.transitioning&&!this.$element.hasClass("in")){var b=a.Event("show.bs.collapse");if(this.$element.trigger(b),!b.isDefaultPrevented()){var c=this.$parent&&this.$parent.find("> .panel > .in");if(c&&c.length){var d=c.data("bs.collapse");if(d&&d.transitioning)return;c.collapse("hide"),d||c.data("bs.collapse",null)}var e=this.dimension();this.$element.removeClass("collapse").addClass("collapsing")[e](0),this.transitioning=1;var f=function(){this.$element.removeClass("collapsing").addClass("collapse in")[e]("auto"),this.transitioning=0,this.$element.trigger("shown.bs.collapse")};if(!a.support.transition)return f.call(this);var g=a.camelCase(["scroll",e].join("-"));this.$element.one(a.support.transition.end,a.proxy(f,this)).emulateTransitionEnd(350)[e](this.$element[0][g])}}},b.prototype.hide=function(){if(!this.transitioning&&this.$element.hasClass("in")){var b=a.Event("hide.bs.collapse");if(this.$element.trigger(b),!b.isDefaultPrevented()){var c=this.dimension();this.$element[c](this.$element[c]())[0].offsetHeight,this.$element.addClass("collapsing").removeClass("collapse").removeClass("in"),this.transitioning=1;var d=function(){this.transitioning=0,this.$element.trigger("hidden.bs.collapse").removeClass("collapsing").addClass("collapse")};return a.support.transition?void this.$element[c](0).one(a.support.transition.end,a.proxy(d,this)).emulateTransitionEnd(350):d.call(this)}}},b.prototype.toggle=function(){this[this.$element.hasClass("in")?"hide":"show"]()};var c=a.fn.collapse;a.fn.collapse=function(c){return this.each(function(){var d=a(this),e=d.data("bs.collapse"),f=a.extend({},b.DEFAULTS,d.data(),"object"==typeof c&&c);!e&&f.toggle&&"show"==c&&(c=!c),e||d.data("bs.collapse",e=new b(this,f)),"string"==typeof c&&e[c]()})},a.fn.collapse.Constructor=b,a.fn.collapse.noConflict=function(){return a.fn.collapse=c,this},a(document).on("click.bs.collapse.data-api","[data-toggle=collapse]",function(b){var c,d=a(this),e=d.attr("data-target")||b.preventDefault()||(c=d.attr("href"))&&c.replace(/.*(?=#[^\s]+$)/,""),f=a(e),g=f.data("bs.collapse"),h=g?"toggle":d.data(),i=d.attr("data-parent"),j=i&&a(i);g&&g.transitioning||(j&&j.find('[data-toggle=collapse][data-parent="'+i+'"]').not(d).addClass("collapsed"),d[f.hasClass("in")?"addClass":"removeClass"]("collapsed")),f.collapse(h)})}(jQuery),+function(a){"use strict";function b(b){a(d).remove(),a(e).each(function(){var d=c(a(this)),e={relatedTarget:this};d.hasClass("open")&&(d.trigger(b=a.Event("hide.bs.dropdown",e)),b.isDefaultPrevented()||d.removeClass("open").trigger("hidden.bs.dropdown",e))})}function c(b){var c=b.attr("data-target");c||(c=b.attr("href"),c=c&&/#[A-Za-z]/.test(c)&&c.replace(/.*(?=#[^\s]*$)/,""));var d=c&&a(c);return d&&d.length?d:b.parent()}var d=".dropdown-backdrop",e="[data-toggle=dropdown]",f=function(b){a(b).on("click.bs.dropdown",this.toggle)};f.prototype.toggle=function(d){var e=a(this);if(!e.is(".disabled, :disabled")){var f=c(e),g=f.hasClass("open");if(b(),!g){"ontouchstart"in document.documentElement&&!f.closest(".navbar-nav").length&&a('<div class="dropdown-backdrop"/>').insertAfter(a(this)).on("click",b);var h={relatedTarget:this};if(f.trigger(d=a.Event("show.bs.dropdown",h)),d.isDefaultPrevented())return;f.toggleClass("open").trigger("shown.bs.dropdown",h),e.focus()}return!1}},f.prototype.keydown=function(b){if(/(38|40|27)/.test(b.keyCode)){var d=a(this);if(b.preventDefault(),b.stopPropagation(),!d.is(".disabled, :disabled")){var f=c(d),g=f.hasClass("open");if(!g||g&&27==b.keyCode)return 27==b.which&&f.find(e).focus(),d.click();var h=" li:not(.divider):visible a",i=f.find("[role=menu]"+h+", [role=listbox]"+h);if(i.length){var j=i.index(i.filter(":focus"));38==b.keyCode&&j>0&&j--,40==b.keyCode&&j<i.length-1&&j++,~j||(j=0),i.eq(j).focus()}}}};var g=a.fn.dropdown;a.fn.dropdown=function(b){return this.each(function(){var c=a(this),d=c.data("bs.dropdown");d||c.data("bs.dropdown",d=new f(this)),"string"==typeof b&&d[b].call(c)})},a.fn.dropdown.Constructor=f,a.fn.dropdown.noConflict=function(){return a.fn.dropdown=g,this},a(document).on("click.bs.dropdown.data-api",b).on("click.bs.dropdown.data-api",".dropdown form",function(a){a.stopPropagation()}).on("click.bs.dropdown.data-api",e,f.prototype.toggle).on("keydown.bs.dropdown.data-api",e+", [role=menu], [role=listbox]",f.prototype.keydown)}(jQuery),+function(a){"use strict";var b=function(b,c){this.options=c,this.$element=a(b),this.$backdrop=this.isShown=null,this.options.remote&&this.$element.find(".modal-content").load(this.options.remote,a.proxy(function(){this.$element.trigger("loaded.bs.modal")},this))};b.DEFAULTS={backdrop:!0,keyboard:!0,show:!0},b.prototype.toggle=function(a){return this[this.isShown?"hide":"show"](a)},b.prototype.show=function(b){var c=this,d=a.Event("show.bs.modal",{relatedTarget:b});this.$element.trigger(d),this.isShown||d.isDefaultPrevented()||(this.isShown=!0,this.escape(),this.$element.on("click.dismiss.bs.modal",'[data-dismiss="modal"]',a.proxy(this.hide,this)),this.backdrop(function(){var d=a.support.transition&&c.$element.hasClass("fade");c.$element.parent().length||c.$element.appendTo(document.body),c.$element.show().scrollTop(0),d&&c.$element[0].offsetWidth,c.$element.addClass("in").attr("aria-hidden",!1),c.enforceFocus();var e=a.Event("shown.bs.modal",{relatedTarget:b});d?c.$element.find(".modal-dialog").one(a.support.transition.end,function(){c.$element.focus().trigger(e)}).emulateTransitionEnd(300):c.$element.focus().trigger(e)}))},b.prototype.hide=function(b){b&&b.preventDefault(),b=a.Event("hide.bs.modal"),this.$element.trigger(b),this.isShown&&!b.isDefaultPrevented()&&(this.isShown=!1,this.escape(),a(document).off("focusin.bs.modal"),this.$element.removeClass("in").attr("aria-hidden",!0).off("click.dismiss.bs.modal"),a.support.transition&&this.$element.hasClass("fade")?this.$element.one(a.support.transition.end,a.proxy(this.hideModal,this)).emulateTransitionEnd(300):this.hideModal())},b.prototype.enforceFocus=function(){a(document).off("focusin.bs.modal").on("focusin.bs.modal",a.proxy(function(a){this.$element[0]===a.target||this.$element.has(a.target).length||this.$element.focus()},this))},b.prototype.escape=function(){this.isShown&&this.options.keyboard?this.$element.on("keyup.dismiss.bs.modal",a.proxy(function(a){27==a.which&&this.hide()},this)):this.isShown||this.$element.off("keyup.dismiss.bs.modal")},b.prototype.hideModal=function(){var a=this;this.$element.hide(),this.backdrop(function(){a.removeBackdrop(),a.$element.trigger("hidden.bs.modal")})},b.prototype.removeBackdrop=function(){this.$backdrop&&this.$backdrop.remove(),this.$backdrop=null},b.prototype.backdrop=function(b){var c=this.$element.hasClass("fade")?"fade":"";if(this.isShown&&this.options.backdrop){var d=a.support.transition&&c;if(this.$backdrop=a('<div class="modal-backdrop '+c+'" />').appendTo(document.body),this.$element.on("click.dismiss.bs.modal",a.proxy(function(a){a.target===a.currentTarget&&("static"==this.options.backdrop?this.$element[0].focus.call(this.$element[0]):this.hide.call(this))},this)),d&&this.$backdrop[0].offsetWidth,this.$backdrop.addClass("in"),!b)return;d?this.$backdrop.one(a.support.transition.end,b).emulateTransitionEnd(150):b()}else!this.isShown&&this.$backdrop?(this.$backdrop.removeClass("in"),a.support.transition&&this.$element.hasClass("fade")?this.$backdrop.one(a.support.transition.end,b).emulateTransitionEnd(150):b()):b&&b()};var c=a.fn.modal;a.fn.modal=function(c,d){return this.each(function(){var e=a(this),f=e.data("bs.modal"),g=a.extend({},b.DEFAULTS,e.data(),"object"==typeof c&&c);f||e.data("bs.modal",f=new b(this,g)),"string"==typeof c?f[c](d):g.show&&f.show(d)})},a.fn.modal.Constructor=b,a.fn.modal.noConflict=function(){return a.fn.modal=c,this},a(document).on("click.bs.modal.data-api",'[data-toggle="modal"]',function(b){var c=a(this),d=c.attr("href"),e=a(c.attr("data-target")||d&&d.replace(/.*(?=#[^\s]+$)/,"")),f=e.data("bs.modal")?"toggle":a.extend({remote:!/#/.test(d)&&d},e.data(),c.data());c.is("a")&&b.preventDefault(),e.modal(f,this).one("hide",function(){c.is(":visible")&&c.focus()})}),a(document).on("show.bs.modal",".modal",function(){a(document.body).addClass("modal-open")}).on("hidden.bs.modal",".modal",function(){a(document.body).removeClass("modal-open")})}(jQuery),+function(a){"use strict";var b=function(a,b){this.type=this.options=this.enabled=this.timeout=this.hoverState=this.$element=null,this.init("tooltip",a,b)};b.DEFAULTS={animation:!0,placement:"top",selector:!1,template:'<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:!1,container:!1},b.prototype.init=function(b,c,d){this.enabled=!0,this.type=b,this.$element=a(c),this.options=this.getOptions(d);for(var e=this.options.trigger.split(" "),f=e.length;f--;){var g=e[f];if("click"==g)this.$element.on("click."+this.type,this.options.selector,a.proxy(this.toggle,this));else if("manual"!=g){var h="hover"==g?"mouseenter":"focusin",i="hover"==g?"mouseleave":"focusout";this.$element.on(h+"."+this.type,this.options.selector,a.proxy(this.enter,this)),this.$element.on(i+"."+this.type,this.options.selector,a.proxy(this.leave,this))}}this.options.selector?this._options=a.extend({},this.options,{trigger:"manual",selector:""}):this.fixTitle()},b.prototype.getDefaults=function(){return b.DEFAULTS},b.prototype.getOptions=function(b){return b=a.extend({},this.getDefaults(),this.$element.data(),b),b.delay&&"number"==typeof b.delay&&(b.delay={show:b.delay,hide:b.delay}),b},b.prototype.getDelegateOptions=function(){var b={},c=this.getDefaults();return this._options&&a.each(this._options,function(a,d){c[a]!=d&&(b[a]=d)}),b},b.prototype.enter=function(b){var c=b instanceof this.constructor?b:a(b.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type);return clearTimeout(c.timeout),c.hoverState="in",c.options.delay&&c.options.delay.show?void(c.timeout=setTimeout(function(){"in"==c.hoverState&&c.show()},c.options.delay.show)):c.show()},b.prototype.leave=function(b){var c=b instanceof this.constructor?b:a(b.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type);return clearTimeout(c.timeout),c.hoverState="out",c.options.delay&&c.options.delay.hide?void(c.timeout=setTimeout(function(){"out"==c.hoverState&&c.hide()},c.options.delay.hide)):c.hide()},b.prototype.show=function(){var b=a.Event("show.bs."+this.type);if(this.hasContent()&&this.enabled){if(this.$element.trigger(b),b.isDefaultPrevented())return;var c=this,d=this.tip();this.setContent(),this.options.animation&&d.addClass("fade");var e="function"==typeof this.options.placement?this.options.placement.call(this,d[0],this.$element[0]):this.options.placement,f=/\s?auto?\s?/i,g=f.test(e);g&&(e=e.replace(f,"")||"top"),d.detach().css({top:0,left:0,display:"block"}).addClass(e),this.options.container?d.appendTo(this.options.container):d.insertAfter(this.$element);var h=this.getPosition(),i=d[0].offsetWidth,j=d[0].offsetHeight;if(g){var k=this.$element.parent(),l=e,m=document.documentElement.scrollTop||document.body.scrollTop,n="body"==this.options.container?window.innerWidth:k.outerWidth(),o="body"==this.options.container?window.innerHeight:k.outerHeight(),p="body"==this.options.container?0:k.offset().left;e="bottom"==e&&h.top+h.height+j-m>o?"top":"top"==e&&h.top-m-j<0?"bottom":"right"==e&&h.right+i>n?"left":"left"==e&&h.left-i<p?"right":e,d.removeClass(l).addClass(e)}var q=this.getCalculatedOffset(e,h,i,j);this.applyPlacement(q,e),this.hoverState=null;var r=function(){c.$element.trigger("shown.bs."+c.type)};a.support.transition&&this.$tip.hasClass("fade")?d.one(a.support.transition.end,r).emulateTransitionEnd(150):r()}},b.prototype.applyPlacement=function(b,c){var d,e=this.tip(),f=e[0].offsetWidth,g=e[0].offsetHeight,h=parseInt(e.css("margin-top"),10),i=parseInt(e.css("margin-left"),10);isNaN(h)&&(h=0),isNaN(i)&&(i=0),b.top=b.top+h,b.left=b.left+i,a.offset.setOffset(e[0],a.extend({using:function(a){e.css({top:Math.round(a.top),left:Math.round(a.left)})}},b),0),e.addClass("in");var j=e[0].offsetWidth,k=e[0].offsetHeight;if("top"==c&&k!=g&&(d=!0,b.top=b.top+g-k),/bottom|top/.test(c)){var l=0;b.left<0&&(l=-2*b.left,b.left=0,e.offset(b),j=e[0].offsetWidth,k=e[0].offsetHeight),this.replaceArrow(l-f+j,j,"left")}else this.replaceArrow(k-g,k,"top");d&&e.offset(b)},b.prototype.replaceArrow=function(a,b,c){this.arrow().css(c,a?50*(1-a/b)+"%":"")},b.prototype.setContent=function(){var a=this.tip(),b=this.getTitle();a.find(".tooltip-inner")[this.options.html?"html":"text"](b),a.removeClass("fade in top bottom left right")},b.prototype.hide=function(){function b(){"in"!=c.hoverState&&d.detach(),c.$element.trigger("hidden.bs."+c.type)}var c=this,d=this.tip(),e=a.Event("hide.bs."+this.type);return this.$element.trigger(e),e.isDefaultPrevented()?void 0:(d.removeClass("in"),a.support.transition&&this.$tip.hasClass("fade")?d.one(a.support.transition.end,b).emulateTransitionEnd(150):b(),this.hoverState=null,this)},b.prototype.fixTitle=function(){var a=this.$element;(a.attr("title")||"string"!=typeof a.attr("data-original-title"))&&a.attr("data-original-title",a.attr("title")||"").attr("title","")},b.prototype.hasContent=function(){return this.getTitle()},b.prototype.getPosition=function(){var b=this.$element[0];return a.extend({},"function"==typeof b.getBoundingClientRect?b.getBoundingClientRect():{width:b.offsetWidth,height:b.offsetHeight},this.$element.offset())},b.prototype.getCalculatedOffset=function(a,b,c,d){return"bottom"==a?{top:b.top+b.height,left:b.left+b.width/2-c/2}:"top"==a?{top:b.top-d,left:b.left+b.width/2-c/2}:"left"==a?{top:b.top+b.height/2-d/2,left:b.left-c}:{top:b.top+b.height/2-d/2,left:b.left+b.width}},b.prototype.getTitle=function(){var a,b=this.$element,c=this.options;return a=b.attr("data-original-title")||("function"==typeof c.title?c.title.call(b[0]):c.title)},b.prototype.tip=function(){return this.$tip=this.$tip||a(this.options.template)},b.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".tooltip-arrow")},b.prototype.validate=function(){this.$element[0].parentNode||(this.hide(),this.$element=null,this.options=null)},b.prototype.enable=function(){this.enabled=!0},b.prototype.disable=function(){this.enabled=!1},b.prototype.toggleEnabled=function(){this.enabled=!this.enabled},b.prototype.toggle=function(b){var c=b?a(b.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type):this;c.tip().hasClass("in")?c.leave(c):c.enter(c)},b.prototype.destroy=function(){clearTimeout(this.timeout),this.hide().$element.off("."+this.type).removeData("bs."+this.type)};var c=a.fn.tooltip;a.fn.tooltip=function(c){return this.each(function(){var d=a(this),e=d.data("bs.tooltip"),f="object"==typeof c&&c;(e||"destroy"!=c)&&(e||d.data("bs.tooltip",e=new b(this,f)),"string"==typeof c&&e[c]())})},a.fn.tooltip.Constructor=b,a.fn.tooltip.noConflict=function(){return a.fn.tooltip=c,this}}(jQuery),+function(a){"use strict";var b=function(a,b){this.init("popover",a,b)};if(!a.fn.tooltip)throw new Error("Popover requires tooltip.js");b.DEFAULTS=a.extend({},a.fn.tooltip.Constructor.DEFAULTS,{placement:"right",trigger:"click",content:"",template:'<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'}),b.prototype=a.extend({},a.fn.tooltip.Constructor.prototype),b.prototype.constructor=b,b.prototype.getDefaults=function(){return b.DEFAULTS},b.prototype.setContent=function(){var a=this.tip(),b=this.getTitle(),c=this.getContent();a.find(".popover-title")[this.options.html?"html":"text"](b),a.find(".popover-content")[this.options.html?"string"==typeof c?"html":"append":"text"](c),a.removeClass("fade top bottom left right in"),a.find(".popover-title").html()||a.find(".popover-title").hide()},b.prototype.hasContent=function(){return this.getTitle()||this.getContent()},b.prototype.getContent=function(){var a=this.$element,b=this.options;return a.attr("data-content")||("function"==typeof b.content?b.content.call(a[0]):b.content)},b.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".arrow")},b.prototype.tip=function(){return this.$tip||(this.$tip=a(this.options.template)),this.$tip};var c=a.fn.popover;a.fn.popover=function(c){return this.each(function(){var d=a(this),e=d.data("bs.popover"),f="object"==typeof c&&c;(e||"destroy"!=c)&&(e||d.data("bs.popover",e=new b(this,f)),"string"==typeof c&&e[c]())})},a.fn.popover.Constructor=b,a.fn.popover.noConflict=function(){return a.fn.popover=c,this}}(jQuery),+function(a){"use strict";function b(c,d){var e,f=a.proxy(this.process,this);this.$element=a(a(c).is("body")?window:c),this.$body=a("body"),this.$scrollElement=this.$element.on("scroll.bs.scroll-spy.data-api",f),this.options=a.extend({},b.DEFAULTS,d),this.selector=(this.options.target||(e=a(c).attr("href"))&&e.replace(/.*(?=#[^\s]+$)/,"")||"")+" .nav li > a",this.offsets=a([]),this.targets=a([]),this.activeTarget=null,this.refresh(),this.process()}b.DEFAULTS={offset:10},b.prototype.refresh=function(){var b=this.$element[0]==window?"offset":"position";this.offsets=a([]),this.targets=a([]);{var c=this;this.$body.find(this.selector).map(function(){var d=a(this),e=d.data("target")||d.attr("href"),f=/^#./.test(e)&&a(e);return f&&f.length&&f.is(":visible")&&[[f[b]().top+(!a.isWindow(c.$scrollElement.get(0))&&c.$scrollElement.scrollTop()),e]]||null}).sort(function(a,b){return a[0]-b[0]}).each(function(){c.offsets.push(this[0]),c.targets.push(this[1])})}},b.prototype.process=function(){var a,b=this.$scrollElement.scrollTop()+this.options.offset,c=this.$scrollElement[0].scrollHeight||this.$body[0].scrollHeight,d=c-this.$scrollElement.height(),e=this.offsets,f=this.targets,g=this.activeTarget;if(b>=d)return g!=(a=f.last()[0])&&this.activate(a);if(g&&b<=e[0])return g!=(a=f[0])&&this.activate(a);for(a=e.length;a--;)g!=f[a]&&b>=e[a]&&(!e[a+1]||b<=e[a+1])&&this.activate(f[a])},b.prototype.activate=function(b){this.activeTarget=b,a(this.selector).parentsUntil(this.options.target,".active").removeClass("active");var c=this.selector+'[data-target="'+b+'"],'+this.selector+'[href="'+b+'"]',d=a(c).parents("li").addClass("active");d.parent(".dropdown-menu").length&&(d=d.closest("li.dropdown").addClass("active")),d.trigger("activate.bs.scrollspy")};var c=a.fn.scrollspy;a.fn.scrollspy=function(c){return this.each(function(){var d=a(this),e=d.data("bs.scrollspy"),f="object"==typeof c&&c;e||d.data("bs.scrollspy",e=new b(this,f)),"string"==typeof c&&e[c]()})},a.fn.scrollspy.Constructor=b,a.fn.scrollspy.noConflict=function(){return a.fn.scrollspy=c,this},a(window).on("load",function(){a('[data-spy="scroll"]').each(function(){var b=a(this);b.scrollspy(b.data())})})}(jQuery),+function(a){"use strict";var b=function(b){this.element=a(b)};b.prototype.show=function(){var b=this.element,c=b.closest("ul:not(.dropdown-menu)"),d=b.data("target");if(d||(d=b.attr("href"),d=d&&d.replace(/.*(?=#[^\s]*$)/,"")),!b.parent("li").hasClass("active")){var e=c.find(".active:last a")[0],f=a.Event("show.bs.tab",{relatedTarget:e});if(b.trigger(f),!f.isDefaultPrevented()){var g=a(d);this.activate(b.parent("li"),c),this.activate(g,g.parent(),function(){b.trigger({type:"shown.bs.tab",relatedTarget:e})})}}},b.prototype.activate=function(b,c,d){function e(){f.removeClass("active").find("> .dropdown-menu > .active").removeClass("active"),b.addClass("active"),g?(b[0].offsetWidth,b.addClass("in")):b.removeClass("fade"),b.parent(".dropdown-menu")&&b.closest("li.dropdown").addClass("active"),d&&d()}var f=c.find("> .active"),g=d&&a.support.transition&&f.hasClass("fade");g?f.one(a.support.transition.end,e).emulateTransitionEnd(150):e(),f.removeClass("in")};var c=a.fn.tab;a.fn.tab=function(c){return this.each(function(){var d=a(this),e=d.data("bs.tab");e||d.data("bs.tab",e=new b(this)),"string"==typeof c&&e[c]()})},a.fn.tab.Constructor=b,a.fn.tab.noConflict=function(){return a.fn.tab=c,this},a(document).on("click.bs.tab.data-api",'[data-toggle="tab"], [data-toggle="pill"]',function(b){b.preventDefault(),a(this).tab("show")})}(jQuery),+function(a){"use strict";var b=function(c,d){this.options=a.extend({},b.DEFAULTS,d),this.$window=a(window).on("scroll.bs.affix.data-api",a.proxy(this.checkPosition,this)).on("click.bs.affix.data-api",a.proxy(this.checkPositionWithEventLoop,this)),this.$element=a(c),this.affixed=this.unpin=this.pinnedOffset=null,this.checkPosition()};b.RESET="affix affix-top affix-bottom",b.DEFAULTS={offset:0},b.prototype.getPinnedOffset=function(){if(this.pinnedOffset)return this.pinnedOffset;this.$element.removeClass(b.RESET).addClass("affix");var a=this.$window.scrollTop(),c=this.$element.offset();return this.pinnedOffset=c.top-a},b.prototype.checkPositionWithEventLoop=function(){setTimeout(a.proxy(this.checkPosition,this),1)},b.prototype.checkPosition=function(){if(this.$element.is(":visible")){var c=a(document).height(),d=this.$window.scrollTop(),e=this.$element.offset(),f=this.options.offset,g=f.top,h=f.bottom;"top"==this.affixed&&(e.top+=d),"object"!=typeof f&&(h=g=f),"function"==typeof g&&(g=f.top(this.$element)),"function"==typeof h&&(h=f.bottom(this.$element));var i=null!=this.unpin&&d+this.unpin<=e.top?!1:null!=h&&e.top+this.$element.height()>=c-h?"bottom":null!=g&&g>=d?"top":!1;if(this.affixed!==i){this.unpin&&this.$element.css("top","");var j="affix"+(i?"-"+i:""),k=a.Event(j+".bs.affix");this.$element.trigger(k),k.isDefaultPrevented()||(this.affixed=i,this.unpin="bottom"==i?this.getPinnedOffset():null,this.$element.removeClass(b.RESET).addClass(j).trigger(a.Event(j.replace("affix","affixed"))),"bottom"==i&&this.$element.offset({top:c-h-this.$element.height()}))}}};var c=a.fn.affix;a.fn.affix=function(c){return this.each(function(){var d=a(this),e=d.data("bs.affix"),f="object"==typeof c&&c;e||d.data("bs.affix",e=new b(this,f)),"string"==typeof c&&e[c]()})},a.fn.affix.Constructor=b,a.fn.affix.noConflict=function(){return a.fn.affix=c,this},a(window).on("load",function(){a('[data-spy="affix"]').each(function(){var b=a(this),c=b.data();c.offset=c.offset||{},c.offsetBottom&&(c.offset.bottom=c.offsetBottom),c.offsetTop&&(c.offset.top=c.offsetTop),b.affix(c)})})}(jQuery);;'use strict';(function(l,f){function m(){var a=e.elements;return"string"==typeof a?a.split(" "):a}function i(a){var b=n[a[o]];b||(b={},h++,a[o]=h,n[h]=b);return b}function p(a,b,c){b||(b=f);if(g)return b.createElement(a);c||(c=i(b));b=c.cache[a]?c.cache[a].cloneNode():r.test(a)?(c.cache[a]=c.createElem(a)).cloneNode():c.createElem(a);return b.canHaveChildren&&!s.test(a)?c.frag.appendChild(b):b}function t(a,b){if(!b.cache)b.cache={},b.createElem=a.createElement,b.createFrag=a.createDocumentFragment,b.frag=b.createFrag();a.createElement=function(c){return!e.shivMethods?b.createElem(c):p(c,a,b)};a.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+m().join().replace(/[\w\-]+/g,function(a){b.createElem(a);b.frag.createElement(a);return'c("'+a+'")'})+");return n}")(e,b.frag)}function q(a){a||(a=f);var b=i(a);if(e.shivCSS&&!j&&!b.hasCSS){var c,d=a;c=d.createElement("p");d=d.getElementsByTagName("head")[0]||d.documentElement;c.innerHTML="x<style>article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}mark{background:#FF0;color:#000}template{display:none}</style>";c=d.insertBefore(c.lastChild,d.firstChild);b.hasCSS=!!c}g||t(a,b);return a}var k=l.html5||{},s=/^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,r=/^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,j,o="_html5shiv",h=0,n={},g;(function(){try{var a=f.createElement("a");a.innerHTML="<xyz></xyz>";j="hidden"in a;var b;if(!(b=1==a.childNodes.length)){f.createElement("a");var c=f.createDocumentFragment();b="undefined"==typeof c.cloneNode||"undefined"==typeof c.createDocumentFragment||"undefined"==typeof c.createElement}g=b}catch(d){g=j=!0}})();var e={elements:k.elements||"abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output progress section summary template time video",version:"3.7.0",shivCSS:!1!==k.shivCSS,supportsUnknownElements:g,shivMethods:!1!==k.shivMethods,type:"default",shivDocument:q,createElement:p,createDocumentFragment:function(a,b){a||(a=f);if(g)return a.createDocumentFragment();for(var b=b||i(a),c=b.frag.cloneNode(),d=0,e=m(),h=e.length;d<h;d++)c.createElement(e[d]);return c}};l.html5=e;q(f)})(this,document);
  ;/*!
   * Lazy Load - jQuery plugin for lazy loading images
   *
   * Copyright (c) 2007-2015 Mika Tuupola
   *
   * Licensed under the MIT license:
   *   https://www.opensource.org/licenses/mit-license.php
   *
   * Project home:
   *   https://www.appelsiini.net/projects/lazyload
   *
   * Version:  1.9.7
   *
   */
  
  (function($, window, document, undefined) {
      var $window = $(window);
  
      $.fn.lazyload = function(options) {
          var elements = this;
          var $container;
          var settings = {
              threshold       : 0,
              failure_limit   : 0,
              ignore          : 0,
              event           : "scroll",
              effect          : "show",
              container       : window,
              data_attribute  : "original",
              data_set        : "original-set",
              skip_invisible  : false,
              appear          : null,
              load            : null,
              // placeholder     : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC",
              placeholder: '',
              beforeLoad: function(el) {},
              afterLoad: function(el) {},
          };
  
          function update(){
              var counter = 0;
  
              elements.each(function() {
  
                  var $this = $(this);
  
                  if ( settings.skip_invisible && ( !$this.is(":in-viewport") || !$this.is(":visible") ) ) {
                      return;
                  }
  
                  if ( $.abovethetop( this, settings ) ||
                       $.leftofbegin( this, settings ) ) {
  
                          /* Nothing. */
  
                  } else if ( !$.belowthefold( this, settings ) &&
                      !$.rightoffold( this, settings ) ) {
  
                          $this.trigger("appear");
                          /* if we found an image we'll load, reset the counter */
                          counter = 0;
  
                  } else {
  
                      if ( ++counter > settings.failure_limit ) {
                          return false;
                      }
  
                  }
              });
  
          }
  
          if(options) {
              /* Maintain BC for a couple of versions. */
              if (undefined !== options.failurelimit) {
                  options.failure_limit = options.failurelimit;
                  delete options.failurelimit;
              }
              if (undefined !== options.effectspeed) {
                  options.effect_speed = options.effectspeed;
                  delete options.effectspeed;
              }
  
              $.extend(settings, options);
          }
  
          /* Cache container as jQuery as object. */
          $container = (settings.container === undefined ||
                        settings.container === window) ? $window : $(settings.container);
  
          /* Fire one scroll event per scroll. Not one scroll event per image. */
          if (0 === settings.event.indexOf("scroll")) {
              $container.on(settings.event, function() {
                  return update();
              });
          }
  
          this.each(function() {
              var self = this;
              var $self = $(self);
  
              self.loaded = false;
  
              /* If no src attribute given use data:uri. */
              if ($self.attr("src") === undefined || $self.attr("src") === false) {
                  if ($self.is("img")) {
                      $self.attr("src", settings.placeholder);
                  }
              }
  
              if ( settings.ignore.length && settings.ignore.has($self).length ) {
                  return;
              }
  
              /* When appear is triggered load original image. */
              $self.one("appear", function() {
  
                  if ( !this.loaded ) {
  
                      if( typeof settings.beforeLoad == 'function' ) {
  
                          settings.beforeLoad(this);
  
                      }
  
                      if ( settings.appear ) {
  
                          var elements_left = elements.length;
                          settings.appear.call( self, elements_left, settings );
  
                      }
                      
                      $("<img />")
                          .one("load", function() {
  
                              if($self.hasClass('lazyloaded')) return;
  
                              var original = $self.attr("data-" + settings.data_attribute),
                                  originalSet = $self.attr("data-" + settings.data_set);
  
                              $self.hide();
  
                              if ( $self.is("img") ) {
  
                                  $self.attr("src", original).addClass('lazyloaded');
  
                                  if( $self.has('[srcset]') ) {
                                      $self.attr("srcset", originalSet);
                                  }
  
                              } else {
  
                                  $self.css("background-image", "url('" + original + "')").addClass('lazyloaded');
  
                              }
  
                              $self[ settings.effect ]( settings.effect_speed );
  
                              self.loaded = true;
  
                              /* Remove image from array so it is not looped next time. */
                              var temp = $.grep( elements, function(element) {
                                  return !element.loaded;
                              });
  
                              elements = $( temp );
  
                              if ( settings.load ) {
  
                                  var elements_left = elements.length;
                                  settings.load.call( self, elements_left, settings );
  
                              }
  
                              /*
                               * Re-init, re-calc, reload, re-- everything that must bre reloaded after image was loaded, below.
                               */
  
                              if ( $self.closest(AIRKIT_EL.gallery.selector).length ) {
                                  AIRKIT_EL.gallery._lazyFix();
                              }
  
                              if ( $self.closest(AIRKIT_EL.greaseSlider.selector).length ) {
                                  AIRKIT_EL.greaseSlider._lazyFix();
                              }
  
                              if ( $self.closest(AIRKIT.equalHeightColumns.selector).length ) {
                                  setTimeout(function(){
                                      AIRKIT.equalHeightColumns.init();
                                  }, 1000);
                              }
  
                              /*
                               * Recalculate isotope.
                               */
  
                              if( $self.closest('.ts-masonry-container').length ) {
                                  
                                  $self.closest('.ts-masonry-container').isotope('layout');
                                  
                              }
  
  
                          })
                          .attr( "src", $self.attr( "data-" + settings.data_attribute ) )
                          .attr( "srcset", $self.attr( "data-" + settings.data_set ) );
  
                      if( typeof settings.afterLoad == 'function' ) {
  
                        settings.afterLoad(this);
  
                      }
                          
                  }
              });
  
              /* When wanted event is triggered load original image */
              /* by triggering appear.                              */
              if (0 !== settings.event.indexOf("scroll")) {
  
                  $self.on( settings.event, function() {
  
                      if ( !self.loaded ) {
  
                          $self.trigger("appear");
  
                      }
  
                  });
  
              }
  
              jQuery(document).ready(function(){
  
                  if( $.inviewport( $self, settings ) == true ) {
  
                      if(!self.loaded){ 
  
                          $self.trigger("appear");
  
                      }
                  }
  
              })
          });
  
          /* Check if something appears when window is resized. */
          $window.on("resize", function() {
              update();
          });
  
          /* With IOS5 force loading images when navigating with back button. */
          /* Non optimal workaround. */
          if ((/(?:iphone|ipod|ipad).*os 5/gi).test(navigator.appVersion)) {
              $window.on("pageshow", function(event) {
                  if (event.originalEvent && event.originalEvent.persisted) {
                      elements.each(function() {
                          $(this).trigger("appear");
                      });
                  }
              });
          }
  
          /* Force initial check if images should appear. */
          $(document).ready(function() {
              update();
          });
          return this;
      };
  
      /* Convenience methods in jQuery namespace.           */
      /* Use as  $.belowthefold(element, {threshold : 100, container : window}) */
  
  
      $.belowthefold = function(element, settings) {
  
          var fold;
  
          if (settings.container === undefined || settings.container === window) {
  
              fold = (window.innerHeight ? window.innerHeight : $window.height()) + $window.scrollTop();
  
          } else {
  
              fold = $(settings.container).offset().top + $(settings.container).height();
  
          }
  
          return fold <= $(element).offset().top - settings.threshold;
      };
  
      $.rightoffold = function(element, settings) {
  
          var fold;
  
          if (settings.container === undefined || settings.container === window) {
  
              fold = $window.width() + $window.scrollLeft();
  
          } else {
  
              fold = $(settings.container).offset().left + $(settings.container).width();
  
          }
  
          return fold <= $(element).offset().left - settings.threshold;
      };
  
      $.abovethetop = function(element, settings) {
  
          var fold;
  
          if (settings.container === undefined || settings.container === window) {
  
              fold = $window.scrollTop();
  
          } else {
  
              fold = $(settings.container).offset().top;
  
          }
  
          return fold >= $(element).offset().top + settings.threshold  + $(element).height();
      };
  
      $.leftofbegin = function(element, settings) {
  
          var fold;
  
          if (settings.container === undefined || settings.container === window) {
  
              fold = $window.scrollLeft();
  
          } else {
  
              fold = $(settings.container).offset().left;
  
          }
  
          return fold >= $(element).offset().left + settings.threshold + $(element).width();
      };
  
      $.inviewport = function(element, settings) {
  
           return !$.rightoffold(element, settings) && !$.leftofbegin(element, settings) &&
                  !$.belowthefold(element, settings) && !$.abovethetop(element, settings);
  
       };
  
      /* Custom selectors for your convenience.   */
      /* Use as $("img:below-the-fold").something() or */
      /* $("img").filter(":below-the-fold").something() which is faster */
  
      $.extend($.expr[":"], {
          "below-the-fold" : function(a) { return $.belowthefold(a, {threshold : 0}); },
          "above-the-top"  : function(a) { return !$.belowthefold(a, {threshold : 0}); },
          "right-of-screen": function(a) { return $.rightoffold(a, {threshold : 0}); },
          "left-of-screen" : function(a) { return !$.rightoffold(a, {threshold : 0}); },
          "in-viewport"    : function(a) { return $.inviewport(a, {threshold : 0}); },
          /* Maintain BC for couple of versions. */
          "above-the-fold" : function(a) { return !$.belowthefold(a, {threshold : 0}); },
          "right-of-fold"  : function(a) { return $.rightoffold(a, {threshold : 0}); },
          "left-of-fold"   : function(a) { return !$.rightoffold(a, {threshold : 0}); },
      });
  
  })(jQuery, window, document);
  
  ;'use strict'
  /*!
   * jQuery Cookie Plugin v1.4.1
   * https://github.com/carhartl/jquery-cookie
   *
   * Copyright 2013 Klaus Hartl
   * Released under the MIT license
   */
  ;(function(factory){if(typeof define==='function'&&define.amd){define(['jquery'],factory);}else if(typeof exports==='object'){factory(require('jquery'));}else{factory(jQuery);}}(function($){var pluses=/\+/g;function encode(s){return config.raw?s:encodeURIComponent(s);}
  function decode(s){return config.raw?s:decodeURIComponent(s);}
  function stringifyCookieValue(value){return encode(config.json?JSON.stringify(value):String(value));}
  function parseCookieValue(s){if(s.indexOf('"')===0){s=s.slice(1,-1).replace(/\\"/g,'"').replace(/\\\\/g,'\\');}
  try{s=decodeURIComponent(s.replace(pluses,' '));return config.json?JSON.parse(s):s;}catch(e){}}
  function read(s,converter){var value=config.raw?s:parseCookieValue(s);return $.isFunction(converter)?converter(value):value;}
  var config=$.cookie=function(key,value,options){if(value!==undefined&&!$.isFunction(value)){options=$.extend({},config.defaults,options);if(typeof options.expires==='number'){var days=options.expires,t=options.expires=new Date();t.setTime(+t+days*864e+5);}
  return(document.cookie=[encode(key),'=',stringifyCookieValue(value),options.expires?'; expires='+options.expires.toUTCString():'',options.path?'; path='+options.path:'',options.domain?'; domain='+options.domain:'',options.secure?'; secure':''].join(''));}
  var result=key?undefined:{};var cookies=document.cookie?document.cookie.split('; '):[];for(var i=0,l=cookies.length;i<l;i++){var parts=cookies[i].split('=');var name=decode(parts.shift());var cookie=parts.join('=');if(key&&key===name){result=read(cookie,value);break;}
  if(!key&&(cookie=read(cookie))!==undefined){result[name]=cookie;}}
  return result;};config.defaults={};$.removeCookie=function(key,options){if($.cookie(key)===undefined){return false;}
  $.cookie(key,'',$.extend({},options,{expires:-1}));return!$.cookie(key);};}));
  ;/*! This file is auto-generated */
  (function(){function r(){}var n=this,t=n._,e=Array.prototype,o=Object.prototype,u=Function.prototype,i=e.push,c=e.slice,s=o.toString,a=o.hasOwnProperty,f=Array.isArray,l=Object.keys,p=u.bind,h=Object.create,v=function(n){return n instanceof v?n:this instanceof v?void(this._wrapped=n):new v(n)};"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=v),exports._=v):n._=v,v.VERSION="1.8.3";var y=function(u,i,n){if(void 0===i)return u;switch(null==n?3:n){case 1:return function(n){return u.call(i,n)};case 2:return function(n,t){return u.call(i,n,t)};case 3:return function(n,t,r){return u.call(i,n,t,r)};case 4:return function(n,t,r,e){return u.call(i,n,t,r,e)}}return function(){return u.apply(i,arguments)}},d=function(n,t,r){return null==n?v.identity:v.isFunction(n)?y(n,t,r):v.isObject(n)?v.matcher(n):v.property(n)};v.iteratee=function(n,t){return d(n,t,1/0)};function g(c,f){return function(n){var t=arguments.length;if(t<2||null==n)return n;for(var r=1;r<t;r++)for(var e=arguments[r],u=c(e),i=u.length,o=0;o<i;o++){var a=u[o];f&&void 0!==n[a]||(n[a]=e[a])}return n}}function m(n){if(!v.isObject(n))return{};if(h)return h(n);r.prototype=n;var t=new r;return r.prototype=null,t}function b(t){return function(n){return null==n?void 0:n[t]}}var x=Math.pow(2,53)-1,_=b("length"),j=function(n){var t=_(n);return"number"==typeof t&&0<=t&&t<=x};function w(a){return function(n,t,r,e){t=y(t,e,4);var u=!j(n)&&v.keys(n),i=(u||n).length,o=0<a?0:i-1;return arguments.length<3&&(r=n[u?u[o]:o],o+=a),function(n,t,r,e,u,i){for(;0<=u&&u<i;u+=a){var o=e?e[u]:u;r=t(r,n[o],o,n)}return r}(n,t,r,u,o,i)}}v.each=v.forEach=function(n,t,r){var e,u;if(t=y(t,r),j(n))for(e=0,u=n.length;e<u;e++)t(n[e],e,n);else{var i=v.keys(n);for(e=0,u=i.length;e<u;e++)t(n[i[e]],i[e],n)}return n},v.map=v.collect=function(n,t,r){t=d(t,r);for(var e=!j(n)&&v.keys(n),u=(e||n).length,i=Array(u),o=0;o<u;o++){var a=e?e[o]:o;i[o]=t(n[a],a,n)}return i},v.reduce=v.foldl=v.inject=w(1),v.reduceRight=v.foldr=w(-1),v.find=v.detect=function(n,t,r){var e;if(void 0!==(e=j(n)?v.findIndex(n,t,r):v.findKey(n,t,r))&&-1!==e)return n[e]},v.filter=v.select=function(n,e,t){var u=[];return e=d(e,t),v.each(n,function(n,t,r){e(n,t,r)&&u.push(n)}),u},v.reject=function(n,t,r){return v.filter(n,v.negate(d(t)),r)},v.every=v.all=function(n,t,r){t=d(t,r);for(var e=!j(n)&&v.keys(n),u=(e||n).length,i=0;i<u;i++){var o=e?e[i]:i;if(!t(n[o],o,n))return!1}return!0},v.some=v.any=function(n,t,r){t=d(t,r);for(var e=!j(n)&&v.keys(n),u=(e||n).length,i=0;i<u;i++){var o=e?e[i]:i;if(t(n[o],o,n))return!0}return!1},v.contains=v.includes=v.include=function(n,t,r,e){return j(n)||(n=v.values(n)),"number"==typeof r&&!e||(r=0),0<=v.indexOf(n,t,r)},v.invoke=function(n,r){var e=c.call(arguments,2),u=v.isFunction(r);return v.map(n,function(n){var t=u?r:n[r];return null==t?t:t.apply(n,e)})},v.pluck=function(n,t){return v.map(n,v.property(t))},v.where=function(n,t){return v.filter(n,v.matcher(t))},v.findWhere=function(n,t){return v.find(n,v.matcher(t))},v.max=function(n,e,t){var r,u,i=-1/0,o=-1/0;if(null==e&&null!=n)for(var a=0,c=(n=j(n)?n:v.values(n)).length;a<c;a++)r=n[a],i<r&&(i=r);else e=d(e,t),v.each(n,function(n,t,r){u=e(n,t,r),(o<u||u===-1/0&&i===-1/0)&&(i=n,o=u)});return i},v.min=function(n,e,t){var r,u,i=1/0,o=1/0;if(null==e&&null!=n)for(var a=0,c=(n=j(n)?n:v.values(n)).length;a<c;a++)(r=n[a])<i&&(i=r);else e=d(e,t),v.each(n,function(n,t,r){((u=e(n,t,r))<o||u===1/0&&i===1/0)&&(i=n,o=u)});return i},v.shuffle=function(n){for(var t,r=j(n)?n:v.values(n),e=r.length,u=Array(e),i=0;i<e;i++)(t=v.random(0,i))!==i&&(u[i]=u[t]),u[t]=r[i];return u},v.sample=function(n,t,r){return null==t||r?(j(n)||(n=v.values(n)),n[v.random(n.length-1)]):v.shuffle(n).slice(0,Math.max(0,t))},v.sortBy=function(n,e,t){return e=d(e,t),v.pluck(v.map(n,function(n,t,r){return{value:n,index:t,criteria:e(n,t,r)}}).sort(function(n,t){var r=n.criteria,e=t.criteria;if(r!==e){if(e<r||void 0===r)return 1;if(r<e||void 0===e)return-1}return n.index-t.index}),"value")};function A(o){return function(e,u,n){var i={};return u=d(u,n),v.each(e,function(n,t){var r=u(n,t,e);o(i,n,r)}),i}}v.groupBy=A(function(n,t,r){v.has(n,r)?n[r].push(t):n[r]=[t]}),v.indexBy=A(function(n,t,r){n[r]=t}),v.countBy=A(function(n,t,r){v.has(n,r)?n[r]++:n[r]=1}),v.toArray=function(n){return n?v.isArray(n)?c.call(n):j(n)?v.map(n,v.identity):v.values(n):[]},v.size=function(n){return null==n?0:j(n)?n.length:v.keys(n).length},v.partition=function(n,e,t){e=d(e,t);var u=[],i=[];return v.each(n,function(n,t,r){(e(n,t,r)?u:i).push(n)}),[u,i]},v.first=v.head=v.take=function(n,t,r){if(null!=n)return null==t||r?n[0]:v.initial(n,n.length-t)},v.initial=function(n,t,r){return c.call(n,0,Math.max(0,n.length-(null==t||r?1:t)))},v.last=function(n,t,r){if(null!=n)return null==t||r?n[n.length-1]:v.rest(n,Math.max(0,n.length-t))},v.rest=v.tail=v.drop=function(n,t,r){return c.call(n,null==t||r?1:t)},v.compact=function(n){return v.filter(n,v.identity)};var O=function(n,t,r,e){for(var u=[],i=0,o=e||0,a=_(n);o<a;o++){var c=n[o];if(j(c)&&(v.isArray(c)||v.isArguments(c))){t||(c=O(c,t,r));var f=0,l=c.length;for(u.length+=l;f<l;)u[i++]=c[f++]}else r||(u[i++]=c)}return u};function k(i){return function(n,t,r){t=d(t,r);for(var e=_(n),u=0<i?0:e-1;0<=u&&u<e;u+=i)if(t(n[u],u,n))return u;return-1}}function F(i,o,a){return function(n,t,r){var e=0,u=_(n);if("number"==typeof r)0<i?e=0<=r?r:Math.max(r+u,e):u=0<=r?Math.min(r+1,u):r+u+1;else if(a&&r&&u)return n[r=a(n,t)]===t?r:-1;if(t!=t)return 0<=(r=o(c.call(n,e,u),v.isNaN))?r+e:-1;for(r=0<i?e:u-1;0<=r&&r<u;r+=i)if(n[r]===t)return r;return-1}}v.flatten=function(n,t){return O(n,t,!1)},v.without=function(n){return v.difference(n,c.call(arguments,1))},v.uniq=v.unique=function(n,t,r,e){v.isBoolean(t)||(e=r,r=t,t=!1),null!=r&&(r=d(r,e));for(var u=[],i=[],o=0,a=_(n);o<a;o++){var c=n[o],f=r?r(c,o,n):c;t?(o&&i===f||u.push(c),i=f):r?v.contains(i,f)||(i.push(f),u.push(c)):v.contains(u,c)||u.push(c)}return u},v.union=function(){return v.uniq(O(arguments,!0,!0))},v.intersection=function(n){for(var t=[],r=arguments.length,e=0,u=_(n);e<u;e++){var i=n[e];if(!v.contains(t,i)){for(var o=1;o<r&&v.contains(arguments[o],i);o++);o===r&&t.push(i)}}return t},v.difference=function(n){var t=O(arguments,!0,!0,1);return v.filter(n,function(n){return!v.contains(t,n)})},v.zip=function(){return v.unzip(arguments)},v.unzip=function(n){for(var t=n&&v.max(n,_).length||0,r=Array(t),e=0;e<t;e++)r[e]=v.pluck(n,e);return r},v.object=function(n,t){for(var r={},e=0,u=_(n);e<u;e++)t?r[n[e]]=t[e]:r[n[e][0]]=n[e][1];return r},v.findIndex=k(1),v.findLastIndex=k(-1),v.sortedIndex=function(n,t,r,e){for(var u=(r=d(r,e,1))(t),i=0,o=_(n);i<o;){var a=Math.floor((i+o)/2);r(n[a])<u?i=a+1:o=a}return i},v.indexOf=F(1,v.findIndex,v.sortedIndex),v.lastIndexOf=F(-1,v.findLastIndex),v.range=function(n,t,r){null==t&&(t=n||0,n=0),r=r||1;for(var e=Math.max(Math.ceil((t-n)/r),0),u=Array(e),i=0;i<e;i++,n+=r)u[i]=n;return u};function S(n,t,r,e,u){if(!(e instanceof t))return n.apply(r,u);var i=m(n.prototype),o=n.apply(i,u);return v.isObject(o)?o:i}v.bind=function(n,t){if(p&&n.bind===p)return p.apply(n,c.call(arguments,1));if(!v.isFunction(n))throw new TypeError("Bind must be called on a function");var r=c.call(arguments,2),e=function(){return S(n,e,t,this,r.concat(c.call(arguments)))};return e},v.partial=function(u){var i=c.call(arguments,1),o=function(){for(var n=0,t=i.length,r=Array(t),e=0;e<t;e++)r[e]=i[e]===v?arguments[n++]:i[e];for(;n<arguments.length;)r.push(arguments[n++]);return S(u,o,this,this,r)};return o},v.bindAll=function(n){var t,r,e=arguments.length;if(e<=1)throw new Error("bindAll must be passed function names");for(t=1;t<e;t++)n[r=arguments[t]]=v.bind(n[r],n);return n},v.memoize=function(e,u){var i=function(n){var t=i.cache,r=""+(u?u.apply(this,arguments):n);return v.has(t,r)||(t[r]=e.apply(this,arguments)),t[r]};return i.cache={},i},v.delay=function(n,t){var r=c.call(arguments,2);return setTimeout(function(){return n.apply(null,r)},t)},v.defer=v.partial(v.delay,v,1),v.throttle=function(r,e,u){var i,o,a,c=null,f=0;u=u||{};function l(){f=!1===u.leading?0:v.now(),c=null,a=r.apply(i,o),c||(i=o=null)}return function(){var n=v.now();f||!1!==u.leading||(f=n);var t=e-(n-f);return i=this,o=arguments,t<=0||e<t?(c&&(clearTimeout(c),c=null),f=n,a=r.apply(i,o),c||(i=o=null)):c||!1===u.trailing||(c=setTimeout(l,t)),a}},v.debounce=function(t,r,e){var u,i,o,a,c,f=function(){var n=v.now()-a;n<r&&0<=n?u=setTimeout(f,r-n):(u=null,e||(c=t.apply(o,i),u||(o=i=null)))};return function(){o=this,i=arguments,a=v.now();var n=e&&!u;return u=u||setTimeout(f,r),n&&(c=t.apply(o,i),o=i=null),c}},v.wrap=function(n,t){return v.partial(t,n)},v.negate=function(n){return function(){return!n.apply(this,arguments)}},v.compose=function(){var r=arguments,e=r.length-1;return function(){for(var n=e,t=r[e].apply(this,arguments);n--;)t=r[n].call(this,t);return t}},v.after=function(n,t){return function(){if(--n<1)return t.apply(this,arguments)}},v.before=function(n,t){var r;return function(){return 0<--n&&(r=t.apply(this,arguments)),n<=1&&(t=null),r}},v.once=v.partial(v.before,2);var E=!{toString:null}.propertyIsEnumerable("toString"),M=["valueOf","isPrototypeOf","toString","propertyIsEnumerable","hasOwnProperty","toLocaleString"];function I(n,t){var r=M.length,e=n.constructor,u=v.isFunction(e)&&e.prototype||o,i="constructor";for(v.has(n,i)&&!v.contains(t,i)&&t.push(i);r--;)(i=M[r])in n&&n[i]!==u[i]&&!v.contains(t,i)&&t.push(i)}v.keys=function(n){if(!v.isObject(n))return[];if(l)return l(n);var t=[];for(var r in n)v.has(n,r)&&t.push(r);return E&&I(n,t),t},v.allKeys=function(n){if(!v.isObject(n))return[];var t=[];for(var r in n)t.push(r);return E&&I(n,t),t},v.values=function(n){for(var t=v.keys(n),r=t.length,e=Array(r),u=0;u<r;u++)e[u]=n[t[u]];return e},v.mapObject=function(n,t,r){t=d(t,r);for(var e,u=v.keys(n),i=u.length,o={},a=0;a<i;a++)o[e=u[a]]=t(n[e],e,n);return o},v.pairs=function(n){for(var t=v.keys(n),r=t.length,e=Array(r),u=0;u<r;u++)e[u]=[t[u],n[t[u]]];return e},v.invert=function(n){for(var t={},r=v.keys(n),e=0,u=r.length;e<u;e++)t[n[r[e]]]=r[e];return t},v.functions=v.methods=function(n){var t=[];for(var r in n)v.isFunction(n[r])&&t.push(r);return t.sort()},v.extend=g(v.allKeys),v.extendOwn=v.assign=g(v.keys),v.findKey=function(n,t,r){t=d(t,r);for(var e,u=v.keys(n),i=0,o=u.length;i<o;i++)if(t(n[e=u[i]],e,n))return e},v.pick=function(n,t,r){var e,u,i={},o=n;if(null==o)return i;v.isFunction(t)?(u=v.allKeys(o),e=y(t,r)):(u=O(arguments,!1,!1,1),e=function(n,t,r){return t in r},o=Object(o));for(var a=0,c=u.length;a<c;a++){var f=u[a],l=o[f];e(l,f,o)&&(i[f]=l)}return i},v.omit=function(n,t,r){if(v.isFunction(t))t=v.negate(t);else{var e=v.map(O(arguments,!1,!1,1),String);t=function(n,t){return!v.contains(e,t)}}return v.pick(n,t,r)},v.defaults=g(v.allKeys,!0),v.create=function(n,t){var r=m(n);return t&&v.extendOwn(r,t),r},v.clone=function(n){return v.isObject(n)?v.isArray(n)?n.slice():v.extend({},n):n},v.tap=function(n,t){return t(n),n},v.isMatch=function(n,t){var r=v.keys(t),e=r.length;if(null==n)return!e;for(var u=Object(n),i=0;i<e;i++){var o=r[i];if(t[o]!==u[o]||!(o in u))return!1}return!0};var N=function(n,t,r,e){if(n===t)return 0!==n||1/n==1/t;if(null==n||null==t)return n===t;n instanceof v&&(n=n._wrapped),t instanceof v&&(t=t._wrapped);var u=s.call(n);if(u!==s.call(t))return!1;switch(u){case"[object RegExp]":case"[object String]":return""+n==""+t;case"[object Number]":return+n!=+n?+t!=+t:0==+n?1/+n==1/t:+n==+t;case"[object Date]":case"[object Boolean]":return+n==+t}var i="[object Array]"===u;if(!i){if("object"!=typeof n||"object"!=typeof t)return!1;var o=n.constructor,a=t.constructor;if(o!==a&&!(v.isFunction(o)&&o instanceof o&&v.isFunction(a)&&a instanceof a)&&"constructor"in n&&"constructor"in t)return!1}e=e||[];for(var c=(r=r||[]).length;c--;)if(r[c]===n)return e[c]===t;if(r.push(n),e.push(t),i){if((c=n.length)!==t.length)return!1;for(;c--;)if(!N(n[c],t[c],r,e))return!1}else{var f,l=v.keys(n);if(c=l.length,v.keys(t).length!==c)return!1;for(;c--;)if(f=l[c],!v.has(t,f)||!N(n[f],t[f],r,e))return!1}return r.pop(),e.pop(),!0};v.isEqual=function(n,t){return N(n,t)},v.isEmpty=function(n){return null==n||(j(n)&&(v.isArray(n)||v.isString(n)||v.isArguments(n))?0===n.length:0===v.keys(n).length)},v.isElement=function(n){return!(!n||1!==n.nodeType)},v.isArray=f||function(n){return"[object Array]"===s.call(n)},v.isObject=function(n){var t=typeof n;return"function"==t||"object"==t&&!!n},v.each(["Arguments","Function","String","Number","Date","RegExp","Error"],function(t){v["is"+t]=function(n){return s.call(n)==="[object "+t+"]"}}),v.isArguments(arguments)||(v.isArguments=function(n){return v.has(n,"callee")}),"function"!=typeof/./&&"object"!=typeof Int8Array&&(v.isFunction=function(n){return"function"==typeof n||!1}),v.isFinite=function(n){return isFinite(n)&&!isNaN(parseFloat(n))},v.isNaN=function(n){return v.isNumber(n)&&n!==+n},v.isBoolean=function(n){return!0===n||!1===n||"[object Boolean]"===s.call(n)},v.isNull=function(n){return null===n},v.isUndefined=function(n){return void 0===n},v.has=function(n,t){return null!=n&&a.call(n,t)},v.noConflict=function(){return n._=t,this},v.identity=function(n){return n},v.constant=function(n){return function(){return n}},v.noop=function(){},v.property=b,v.propertyOf=function(t){return null==t?function(){}:function(n){return t[n]}},v.matcher=v.matches=function(t){return t=v.extendOwn({},t),function(n){return v.isMatch(n,t)}},v.times=function(n,t,r){var e=Array(Math.max(0,n));t=y(t,r,1);for(var u=0;u<n;u++)e[u]=t(u);return e},v.random=function(n,t){return null==t&&(t=n,n=0),n+Math.floor(Math.random()*(t-n+1))},v.now=Date.now||function(){return(new Date).getTime()};function B(t){function r(n){return t[n]}var n="(?:"+v.keys(t).join("|")+")",e=RegExp(n),u=RegExp(n,"g");return function(n){return n=null==n?"":""+n,e.test(n)?n.replace(u,r):n}}var T={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"},R=v.invert(T);v.escape=B(T),v.unescape=B(R),v.result=function(n,t,r){var e=null==n?void 0:n[t];return void 0===e&&(e=r),v.isFunction(e)?e.call(n):e};var q=0;v.uniqueId=function(n){var t=++q+"";return n?n+t:t},v.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};function K(n){return"\\"+D[n]}var z=/(.)^/,D={"'":"'","\\":"\\","\r":"r","\n":"n","\u2028":"u2028","\u2029":"u2029"},L=/\\|'|\r|\n|\u2028|\u2029/g;v.template=function(i,n,t){!n&&t&&(n=t),n=v.defaults({},n,v.templateSettings);var r=RegExp([(n.escape||z).source,(n.interpolate||z).source,(n.evaluate||z).source].join("|")+"|$","g"),o=0,a="__p+='";i.replace(r,function(n,t,r,e,u){return a+=i.slice(o,u).replace(L,K),o=u+n.length,t?a+="'+\n((__t=("+t+"))==null?'':_.escape(__t))+\n'":r?a+="'+\n((__t=("+r+"))==null?'':__t)+\n'":e&&(a+="';\n"+e+"\n__p+='"),n}),a+="';\n",n.variable||(a="with(obj||{}){\n"+a+"}\n"),a="var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\n"+a+"return __p;\n";try{var e=new Function(n.variable||"obj","_",a)}catch(n){throw n.source=a,n}function u(n){return e.call(this,n,v)}var c=n.variable||"obj";return u.source="function("+c+"){\n"+a+"}",u},v.chain=function(n){var t=v(n);return t._chain=!0,t};function P(n,t){return n._chain?v(t).chain():t}v.mixin=function(r){v.each(v.functions(r),function(n){var t=v[n]=r[n];v.prototype[n]=function(){var n=[this._wrapped];return i.apply(n,arguments),P(this,t.apply(v,n))}})},v.mixin(v),v.each(["pop","push","reverse","shift","sort","splice","unshift"],function(t){var r=e[t];v.prototype[t]=function(){var n=this._wrapped;return r.apply(n,arguments),"shift"!==t&&"splice"!==t||0!==n.length||delete n[0],P(this,n)}}),v.each(["concat","join","slice"],function(n){var t=e[n];v.prototype[n]=function(){return P(this,t.apply(this._wrapped,arguments))}}),v.prototype.value=function(){return this._wrapped},v.prototype.valueOf=v.prototype.toJSON=v.prototype.value,v.prototype.toString=function(){return""+this._wrapped},"function"==typeof define&&define.amd&&define("underscore",[],function(){return v})}).call(this);
  ;/*! This file is auto-generated */
  !function(a){a.fn.hoverIntent=function(e,t,n){var o,r,v,i,u={interval:100,sensitivity:6,timeout:0};u="object"==typeof e?a.extend(u,e):a.isFunction(t)?a.extend(u,{over:e,out:t,selector:n}):a.extend(u,{over:e,out:e,selector:t});function s(e){o=e.pageX,r=e.pageY}function h(e){var t=a.extend({},e),n=this;n.hoverIntent_t&&(n.hoverIntent_t=clearTimeout(n.hoverIntent_t)),"mouseenter"===e.type?(v=t.pageX,i=t.pageY,a(n).on("mousemove.hoverIntent",s),n.hoverIntent_s||(n.hoverIntent_t=setTimeout(function(){I(t,n)},u.interval))):(a(n).off("mousemove.hoverIntent",s),n.hoverIntent_s&&(n.hoverIntent_t=setTimeout(function(){!function(e,t){t.hoverIntent_t=clearTimeout(t.hoverIntent_t),t.hoverIntent_s=!1,u.out.apply(t,[e])}(t,n)},u.timeout)))}var I=function(e,t){if(t.hoverIntent_t=clearTimeout(t.hoverIntent_t),Math.sqrt((v-o)*(v-o)+(i-r)*(i-r))<u.sensitivity)return a(t).off("mousemove.hoverIntent",s),t.hoverIntent_s=!0,u.over.apply(t,[e]);v=o,i=r,t.hoverIntent_t=setTimeout(function(){I(e,t)},u.interval)};return this.on({"mouseenter.hoverIntent":h,"mouseleave.hoverIntent":h},u.selector)}}(jQuery);
  ;(function($){"use strict";var sticky=jQuery('.ts-sticky-menu-enabled header .airkit_horizontal-menu').last();if(sticky.length&&jQuery(window).width()>768){sticky.affix({offset:{top:sticky.offset().top,}});if(sticky.hasClass('affix')){sticky.find('.navbar').addClass('container');sticky.parent().height(sticky.height());}
  sticky.on('affixed.bs.affix',function(){sticky.find('.navbar').addClass('container');sticky.parent().height(sticky.height());});sticky.on('affixed-top.bs.affix',function(){sticky.find('.navbar').removeClass('container');});}
  jQuery('.airkit_menu .nav-pills > li:first-child').find('a').tab('show');jQuery('.airkit_menu .nav-pills > li ').on('hover',function(){if(jQuery(this).hasClass('hoverblock')){return;}else{jQuery(this).addClass('active');jQuery(this).siblings().removeClass('active');var go=jQuery(this).find('a').attr('href'),pane=jQuery(this).closest('.airkit_menu').find(go)
  pane.addClass('active');pane.siblings().removeClass('active');}});jQuery(document).ready(function(){jQuery('.airkit_menu').each(function(){var go=jQuery(this).find('.nav-pills > li.active').find('a').attr('href'),pane=jQuery(this).find(go);pane.addClass('active');pane.siblings().removeClass('active');});});jQuery('.nav-tabs > li').find('a').on('click',function(){jQuery(this).parent().siblings().addClass('hoverblock');});jQuery(".hovermenu").hoverIntent({over:function(){var menuItem=jQuery(this);if(jQuery(window).width()>768){jQuery(menuItem).children('.dropdown-menu').show();jQuery(menuItem).addClass('open');}
  AIRKIT.lazyLoad.control(menuItem);},out:function(){var menuItem=jQuery(this);jQuery(menuItem).removeClass('open');if(jQuery(window).width()>768){jQuery(menuItem).children('.dropdown-menu').fadeOut(250);}},selector:'.dropdown',timeout:300});jQuery('.airkit_horizontal-menu.clickablemenu .dropdown').each(function(){jQuery(this).on('click','show.bs.dropdown',function(e){var $dropdown=jQuery(this).find('.dropdown-menu'),orig_margin_top=parseInt($dropdown.css('margin-top'));});});jQuery('.airkit_vertical-menu .navbar-nav > li.menu-item-has-children > a').on('click',function(e){e.preventDefault();jQuery(this).parent().children('.dropdown-menu').hide();jQuery(this).parent().siblings('.open').removeClass('open');jQuery(this).parent().toggleClass('open');if(jQuery(this).parents('.airkit_menu').hasClass('ver')){}
  jQuery(this).parent().children('.dropdown-menu').show();AIRKIT.lazyLoad.control(jQuery(this).parent());return false;});jQuery('.airkit_sidebar-menu .sb-menu-toggle').on('click',function(e){});jQuery('.airkit_vertical-menu .dropdown-menu li').on('click',function(e){e.stopPropagation();});})(jQuery);
  ;// ==================================================
  // fancyBox v3.0.19
  //
  // Licensed GPLv3 for open source use
  // or fancyBox Commercial License for commercial use
  //
  // https://fancyapps.com/fancybox/
  // Copyright 2017 fancyApps
  //
  // ==================================================
  !function(t,e,n,o){"use strict";function s(t){var e=t.currentTarget,o=t.data?t.data.options:{},s=t.data?t.data.items:[],i="",a=0;t.preventDefault(),t.stopPropagation(),n(e).attr("data-fancybox")&&(i=n(e).data("fancybox")),i?(s=s.length?s.filter('[data-fancybox="'+i+'"]'):n("[data-fancybox="+i+"]"),a=s.index(e)):s=[e],n.fancybox.open(s,o,a)}if(!n)return o;var i={speed:330,loop:!0,opacity:"auto",margin:[44,0],gutter:30,infobar:!0,buttons:!0,slideShow:!0,fullScreen:!0,thumbs:!0,closeBtn:!0,smallBtn:"auto",image:{preload:"auto",protect:!1},ajax:{settings:{data:{fancybox:!0}}},iframe:{tpl:'<iframe id="fancybox-frame{rnd}" name="fancybox-frame{rnd}" class="fancybox-iframe" frameborder="0" vspace="0" hspace="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen allowtransparency="true" src=""></iframe>',preload:!0,scrolling:"no",css:{}},baseClass:"",slideClass:"",baseTpl:'<div class="fancybox-container" role="dialog" tabindex="-1"><div class="fancybox-bg"></div><div class="fancybox-controls"><div class="fancybox-infobar"><button data-fancybox-previous class="fancybox-button fancybox-button--left" title="Previous"></button><div class="fancybox-infobar__body"><span class="js-fancybox-index"></span>&nbsp;/&nbsp;<span class="js-fancybox-count"></span></div><button data-fancybox-next class="fancybox-button fancybox-button--right" title="Next"></button></div><div class="fancybox-buttons"><button data-fancybox-close class="fancybox-button fancybox-button--close" title="Close (Esc)"></button></div></div><div class="fancybox-slider-wrap"><div class="fancybox-slider"></div></div><div class="fancybox-caption-wrap"><div class="fancybox-caption"></div></div></div>',spinnerTpl:'<div class="fancybox-loading"></div>',errorTpl:'<div class="fancybox-error"><p>The requested content cannot be loaded. <br /> Please try again later.<p></div>',closeTpl:'<button data-fancybox-close class="fancybox-close-small">×</button>',parentEl:"body",touch:!0,keyboard:!0,focus:!0,closeClickOutside:!0,beforeLoad:n.noop,afterLoad:n.noop,beforeMove:n.noop,afterMove:n.noop,onComplete:n.noop,onInit:n.noop,beforeClose:n.noop,afterClose:n.noop,onActivate:n.noop,onDeactivate:n.noop},a=n(t),r=n(e),c=0,l=function(t){return t&&t.hasOwnProperty&&t instanceof n},u=function(){return t.requestAnimationFrame||t.webkitRequestAnimationFrame||t.mozRequestAnimationFrame||function(e){t.setTimeout(e,1e3/60)}}(),d=function(o){var s;return"function"==typeof n&&o instanceof n&&(o=o[0]),s=o.getBoundingClientRect(),s.bottom>0&&s.right>0&&s.left<(t.innerWidth||e.documentElement.clientWidth)&&s.top<(t.innerHeight||e.documentElement.clientHeight)},h=function(t,o,s){var a=this;a.opts=n.extend(!0,{index:s},i,o||{}),a.id=a.opts.id||++c,a.group=[],a.currIndex=parseInt(a.opts.index,10)||0,a.prevIndex=null,a.createGroup(t),a.group.length&&(a.$lastFocus=n(e.activeElement),a.elems={},a.slides={},a.init(t))};n.extend(h.prototype,{init:function(){var t,e,o=this;o.scrollTop=a.scrollTop(),o.scrollLeft=a.scrollLeft(),n.fancybox.isTouch||n("body").hasClass("fancybox-enabled")||(t=n("body").width(),t=n("body").addClass("fancybox-enabled").width()-t,t>1&&n('<style id="fancybox-noscroll" type="text/css">').html(".compensate-for-scrollbar, .fancybox-enabled { margin-right: "+t+"px; }").appendTo("head")),e=n(o.opts.baseTpl).attr("id","fancybox-container-"+o.id).data("FancyBox",o).addClass(o.opts.baseClass).hide().prependTo(o.opts.parentEl),o.$refs={container:e,bg:e.find(".fancybox-bg"),controls:e.find(".fancybox-controls"),buttons:e.find(".fancybox-buttons"),slider_wrap:e.find(".fancybox-slider-wrap"),slider:e.find(".fancybox-slider"),caption:e.find(".fancybox-caption")},o.prevPos=null,o.currPos=0,o.allowZoomIn=!0,o.trigger("onInit"),o.activate(),o.current||o.jumpTo(o.currIndex)},createGroup:function(t){var e=this,s=n.makeArray(t);n.each(s,function(t,s){var i,a,r,c,l,u={},d={};n.isPlainObject(s)?(u=s,d=s.opts||{}):"object"===n.type(s)&&n(s).length?(i=n(s),a=i.data(),d="options"in a?a.options:{},d="object"===n.type(d)?d:{},u.type="type"in a?a.type:d.type,u.src="src"in a?a.src:d.src||i.attr("href"),d.width="width"in a?a.width:d.width,d.height="height"in a?a.height:d.height,d.thumb="thumb"in a?a.thumb:d.thumb,d.caption="caption"in a?a.caption:d.caption||i.attr("title"),d.selector="selector"in a?a.selector:d.selector,d.$orig=i):u={type:"html",content:s+""},u.opts=n.extend(!0,{},e.opts,d),r=u.type,c=u.src||"",r||(u.content?r="html":c.match(/(^data:image\/[a-z0-9+\/=]*,)|(\.(jp(e|g|eg)|gif|png|bmp|webp|svg|ico)((\?|#).*)?$)/i)?r="image":c.match(/\.(pdf)((\?|#).*)?$/i)?r="pdf":"#"===c.charAt(0)&&(r="inline"),u.type=r),u.index=e.group.length,u.opts.$orig&&!u.opts.$orig.length&&delete u.opts.$orig,!u.opts.$thumb&&u.opts.$orig&&(u.opts.$thumb=u.opts.$orig.find("img:first")),u.opts.$thumb&&!u.opts.$thumb.length&&delete u.opts.$thumb,"function"===n.type(e.opts.caption)?u.opts.caption=e.opts.caption.apply(s,[e,u]):u.opts.caption=u.opts.caption===o?"":u.opts.caption+"","ajax"===r&&(l=c.split(/\s+/,2),l.length>1&&(u.src=l.shift(),u.opts.selector=l.shift())),"auto"==u.opts.smallBtn&&(n.inArray(r,["html","inline","ajax"])>-1?(u.opts.buttons=!1,u.opts.smallBtn=!0):u.opts.smallBtn=!1),"pdf"===r&&(u.type="iframe",u.opts.closeBtn=!0,u.opts.smallBtn=!1,u.opts.iframe.preload=!1),u.opts.modal&&n.extend(!0,u.opts,{infobar:0,buttons:0,keyboard:0,slideShow:0,fullScreen:0,closeClickOutside:0}),e.group.push(u)})},addEvents:function(){var o=this,s=function(){a.scrollTop(o.scrollTop).scrollLeft(o.scrollLeft),o.$refs.slider_wrap.show(),o.update()};o.removeEvents(),o.$refs.container.on("click.fb-close","[data-fancybox-close]",function(t){t.stopPropagation(),t.preventDefault(),o.close(t)}).on("click.fb-previous","[data-fancybox-previous]",function(t){t.stopPropagation(),t.preventDefault(),o.previous()}).on("click.fb-next","[data-fancybox-next]",function(t){t.stopPropagation(),t.preventDefault(),o.next()}),n(t).on("orientationchange.fb resize.fb",function(t){u(function(){"orientationchange"==t.type?(o.$refs.slider_wrap.hide(),u(s)):s()})}),r.on("focusin.fb",function(t){var e;n.fancybox&&(e=n.fancybox.getInstance(),!e||n(t.target).hasClass("fancybox-container")||n.contains(e.$refs.container[0],t.target)||(t.stopPropagation(),e.focus()))}),n(e).on("keydown.fb",function(t){var e=o.current,s=t.keyCode||t.which;if(e&&e.opts.keyboard&&!n(t.target).is("input")&&!n(t.target).is("textarea")){if(8===s||27===s)return t.preventDefault(),void o.close();switch(s){case 37:case 38:t.preventDefault(),o.previous();break;case 39:case 40:t.preventDefault(),o.next();break;case 80:case 32:t.preventDefault(),o.SlideShow&&(t.preventDefault(),o.SlideShow.toggle());break;case 70:o.FullScreen&&(t.preventDefault(),o.FullScreen.toggle());break;case 71:o.Thumbs&&(t.preventDefault(),o.Thumbs.toggle())}}})},removeEvents:function(){a.off("scroll.fb resize.fb orientationchange.fb"),r.off("keydown.fb focusin.fb click.fb-close"),this.$refs.container.off("click.fb-close click.fb-previous click.fb-next")},previous:function(t){this.current.opts.loop||this.currIndex>0?this.jumpTo(this.currIndex-1,t):this.update(!1,!1,t)},next:function(t){this.current.opts.loop||this.currIndex<this.group.length-1?this.jumpTo(this.currIndex+1,t):this.update(!1,!1,t)},jumpTo:function(t,e){var n,s,i=this,a=null===i.prevIndex;t=parseInt(t,10),n=t,s=t,n%=i.group.length,n=n<0?i.group.length+n:n,i.isAnimating||n==i.currIndex&&!a||(i.group.length>1&&!a&&(2==i.group.length?s=t-i.currIndex+i.currPos:(s=n-i.currIndex+i.currPos,Math.abs(i.currPos-(s+i.group.length))<Math.abs(i.currPos-s)?s+=i.group.length:Math.abs(i.currPos-(s-i.group.length))<Math.abs(i.currPos-s)&&(s-=i.group.length))),i.prevIndex=i.currIndex,i.prevPos=i.currPos,i.currIndex=n,i.currPos=s,i.createSlide(s),i.group.length>1&&((i.opts.loop||s-1>=0)&&i.createSlide(s-1),(i.opts.loop||s+1<i.group.length)&&i.createSlide(s+1)),i.current=i.slides[s],i.current.isMoved=!1,i.current.isComplete=!1,e=parseInt(e===o?1.5*i.current.opts.speed:e,10),i.trigger("beforeMove"),i.updateControls(),a?(i.current.$slide.addClass("fancybox-slide--current"),i.$refs.container.show(),i.$refs.bg.css("transition-duration",e+90+"ms").hide().show(0),i.$refs.container.addClass("fancybox-container--ready")):i.$refs.slider.children().removeClass("fancybox-slide--current fancybox-slide--complete"),i.update(!0,!1,a?0:e,function(){i.afterMove()}),i.loadSlide(i.current))},createSlide:function(t){var e,o,s=this;o=t%s.group.length,o=o<0?s.group.length+o:o,!s.slides[t]&&s.group[o]&&(e=n('<div class="fancybox-slide"></div>').appendTo(s.$refs.slider),s.slides[t]=n.extend(!0,{},s.group[o],{pos:t,$slide:e,isMoved:!1,isLoaded:!1}))},zoomInOut:function(t,e,o){var s,i,a,r=this,c=r.current,l=c.$placeholder,u=c.opts.opacity,h=c.opts.$thumb,p=h?h.offset():0,f=c.$slide.offset();return!!(l&&p&&d(h))&&(n.fancybox.stop(l),r.isAnimating=!0,s={top:p.top-f.top+parseFloat(h.css("border-top-width")||0),left:p.left-f.left+parseFloat(h.css("border-left-width")||0),width:h.width(),height:h.height(),scaleX:1,scaleY:1},"auto"==u&&(u=Math.abs(c.width/c.height-s.width/s.height)>.1),"In"===t?(i=s,a=r.getFitPos(c),a.scaleX=a.width/i.width,a.scaleY=a.height/i.height,u&&(i.opacity=.1,a.opacity=1)):(i=n.fancybox.getTranslate(l),a=s,c.$ghost&&(c.$ghost.show(),c.$image&&c.$image.remove()),i.scaleX=i.width/a.width,i.scaleY=i.height/a.height,i.width=a.width,i.height=a.height,u&&(a.opacity=0)),r.updateCursor(a.width,a.height),delete a.width,delete a.height,n.fancybox.setTranslate(l,i),l.show(),r.trigger("beforeZoom"+t),setTimeout(function(){l.css("transition","all "+e+"ms"),n.fancybox.setTranslate(l,a),setTimeout(function(){l.css("transition","none"),r.trigger("afterZoom"+t),o(),r.isAnimating=!1},e+20)},70),!0)},zoomIn:function(){var t=this,e=t.current,o=e.$placeholder;return t.allowZoomIn=!1,t.isOpening=!0,t.zoomInOut("In",e.opts.speed,function(){var s=n.fancybox.getTranslate(o);s.scaleX=1,s.scaleY=1,n.fancybox.setTranslate(o,s),t.isOpening=!1,t.update(!1,!0,0),e.$ghost&&t.setBigImage(e)})},zoomOut:function(t){var e=this,n=e.current;return!!e.zoomInOut("Out",n.opts.speed,t)&&(e.$refs.bg.css("transition-duration",n.opts.speed+"ms"),this.$refs.container.removeClass("fancybox-container--ready"),!0)},canPan:function(){var t=this,e=t.current,n=e.$placeholder,o=!1;return n&&(o=t.getFitPos(e),o=Math.abs(n.width()-o.width)>1||Math.abs(n.height()-o.height)>1),o},isScaledDown:function(){var t=this,e=t.current,o=e.$placeholder,s=!1;return o&&(s=n.fancybox.getTranslate(o),s=s.width<e.width||s.height<e.height),s},scaleToActual:function(t,e,s){var i,a,r,c,l,u=this,d=u.current,h=d.$placeholder,p=parseInt(d.$slide.width(),10),f=parseInt(d.$slide.height(),10),g=d.width,b=d.height;h&&(u.isAnimating=!0,t=t===o?.5*p:t,e=e===o?.5*f:e,i=n.fancybox.getTranslate(h),c=g/i.width,l=b/i.height,a=.5*p-.5*g,r=.5*f-.5*b,g>p&&(a=i.left*c-(t*c-t),a>0&&(a=0),a<p-g&&(a=p-g)),b>f&&(r=i.top*l-(e*l-e),r>0&&(r=0),r<f-b&&(r=f-b)),u.updateCursor(g,b),n.fancybox.animate(h,{top:i.top,left:i.left,width:g,height:b,scaleX:i.width/g,scaleY:i.height/b},{top:r,left:a,scaleX:1,scaleY:1},s||d.opts.speed,function(){u.isAnimating=!1}))},scaleToFit:function(t){var e,o=this,s=o.current,i=s.$placeholder;i&&(o.isAnimating=!0,e=o.getFitPos(s),o.updateCursor(e.width,e.height),n.fancybox.animate(i,null,{top:e.top,left:e.left,scaleX:e.width/i.width(),scaleY:e.height/i.height()},t||s.opts.speed,function(){o.isAnimating=!1}))},getFitPos:function(t){var e,o,s,i,r,c,l,u=t.$placeholder||t.$content,d=t.width,h=t.height,p=t.opts.margin;return!(!u||!u.length||!d&&!h)&&("number"===n.type(p)&&(p=[p,p]),2==p.length&&(p=[p[0],p[1],p[0],p[1]]),a.width()<800&&(p=[0,0,0,0]),e=parseInt(t.$slide.width(),10)-(p[1]+p[3]),o=parseInt(t.$slide.height(),10)-(p[0]+p[2]),s=Math.min(1,e/d,o/h),c=Math.floor(s*d),l=Math.floor(s*h),i=Math.floor(.5*(o-l))+p[0],r=Math.floor(.5*(e-c))+p[3],{top:i,left:r,width:c,height:l})},update:function(t,e,o,s){var i=this,a=i.current.pos*Math.floor(i.current.$slide.width())*-1-i.current.pos*i.current.opts.gutter;i.isOpening!==!0&&(o=parseInt(o,10)||0,n.fancybox.stop(i.$refs.slider),t===!1?i.updateSlide(i.current,e):n.each(i.slides,function(t,n){i.updateSlide(n,e)}),o?n.fancybox.animate(i.$refs.slider,null,{top:0,left:a},o,function(){i.current.isMoved=!0,"function"===n.type(s)&&s.apply(i)}):(n.fancybox.setTranslate(i.$refs.slider,{left:a}),"function"===n.type(s)&&s.apply(i)),i.updateCursor())},updateSlide:function(t,e){var o=this,s=t.$placeholder;t=t||o.current,t&&!o.isClosing&&(n.fancybox.setTranslate(t.$slide,{left:t.pos*Math.floor(t.$slide.width())+t.pos*t.opts.gutter}),e!==!1&&s&&n.fancybox.setTranslate(s,o.getFitPos(t)),t.$slide.trigger("refresh"),o.trigger("onUpdate",t))},updateCursor:function(t,e){var n,s=this,i=s.$refs.container.removeClass("fancybox-controls--canzoomIn fancybox-controls--canzoomOut fancybox-controls--canGrab");!s.isClosing&&s.opts.touch&&(n=t!==o&&e!==o?t<s.current.width&&e<s.current.height:s.isScaledDown(),n?i.addClass("fancybox-controls--canzoomIn"):s.group.length<2?i.addClass("fancybox-controls--canzoomOut"):i.addClass("fancybox-controls--canGrab"))},loadSlide:function(t){var e,o,s,i=this;if(!t)return!1;if(!t.isLoading){switch(i.trigger("beforeLoad",t),e=t.type,o=t.$slide,o.unbind("refresh").trigger("onReset").addClass("fancybox-slide--"+(e||"unknown")).addClass(t.opts.slideClass),t.isLoading=!0,e){case"image":i.setImage(t);break;case"iframe":i.setIframe(t);break;case"html":i.setContent(t,t.content);break;case"inline":n(t.src).length?i.setContent(t,n(t.src)):i.setError(t);break;case"ajax":i.showLoading(t),s=n.ajax(n.extend({},t.opts.ajax.settings,{url:t.src,success:function(e,n){"success"===n&&i.setContent(t,e)},error:function(e,n){e&&"abort"!==n&&i.setError(t)}})),o.one("onReset",function(){s.abort()});break;default:i.setError(t)}return!0}},setImage:function(t){var e=this;return t.isLoaded&&!t.hasError?void e.afterLoad(t):(t.$placeholder=n('<div class="fancybox-placeholder"></div>').hide().prependTo(t.$slide),void(t.opts.preload!==!1&&t.opts.width&&t.opts.height&&(t.opts.thumb||t.opts.$thumb)?(t.width=t.opts.width,t.height=t.opts.height,t.$ghost=n("<img />").addClass("fancybox-image").one("load error",function(){e.isClosing||(n(this).appendTo(t.$placeholder),n("<img/>")[0].src=t.src,e.allowZoomIn&&t.index===e.currIndex&&e.zoomIn()||(e.isOpening=!1,e.updateSlide(t,!0),t.$placeholder.show(),e.setBigImage(t)))}).attr("src",t.opts.thumb||t.opts.$thumb.attr("src"))):e.setBigImage(t)))},setBigImage:function(t){var e=this,o=n("<img />");t.opts.image.protect&&n('<div class="fancybox-spaceball"></div>').appendTo(t.$placeholder),o.one("error",function(){e.setError(t)}).one("load",function(){e.isClosing||(t.$image=o.addClass("fancybox-image").appendTo(t.$placeholder),t.width=this.naturalWidth,t.height=this.naturalHeight,e.afterLoad(t),t.$ghost&&(t.timouts=setTimeout(function(){t.$ghost.hide()},300)))}).attr("src",t.src),o[0].complete?o.trigger("load"):o[0].error?o.trigger("error"):t.timouts=setTimeout(function(){o[0].complete||e.showLoading(t)},150)},revealImage:function(t){t.$placeholder&&(t.$placeholder.show(),t.index===this.currIndex&&this.updateCursor())},setIframe:function(t){var e,s=this,i=t.opts.iframe,a=t.$slide;t.$content=n('<div class="fancybox-content"></div>').css(i.css).appendTo(a),e=n(i.tpl.replace(/\{rnd\}/g,(new Date).getTime())).attr("scrolling",n.fancybox.isTouch?"auto":i.scrolling).appendTo(t.$content),i.preload?(t.$content.addClass("fancybox-tmp"),s.showLoading(t),e.on("load.fb error.fb",function(e){this.isReady=1,t.$slide.trigger("refresh"),s.afterLoad(t)}),a.on("refresh.fb",function(){var n,s,a,r,c,l=t.$content;if(1===e[0].isReady){try{n=e.contents(),s=n.find("body")}catch(t){}s&&s.length&&(i.css.width===o||i.css.height===o)&&(a=e[0].contentWindow.document.documentElement.scrollWidth,r=Math.ceil(s.outerWidth(!0)+(l.width()-a)),c=Math.ceil(s.outerHeight(!0)),l.css({width:i.css.width===o?r+(l.outerWidth()-l.innerWidth()):i.css.width,height:i.css.height===o?c+(l.outerHeight()-l.innerHeight()):i.css.height})),l.removeClass("fancybox-tmp")}})):this.afterLoad(t),e.attr("src",t.src),t.opts.smallBtn&&t.$content.prepend(t.opts.closeTpl),a.one("onReset",function(){try{n(this).find("iframe").hide().attr("src","//about:blank")}catch(t){}n(this).empty()})},setContent:function(t,e){var o=this;o.isClosing||(o.hideLoading(t),t.$slide.empty(),l(e)&&e.parent().length?(e.data("placeholder")&&e.parents(".fancybox-slide").trigger("onReset"),e.data({placeholder:n("<div></div>").hide().insertAfter(e)}).css("display","inline-block")):("string"===n.type(e)&&(e=n("<div>").append(e).contents(),3===e[0].nodeType&&(e=n("<div>").html(e))),t.opts.selector&&(e=n("<div>").html(e).find(t.opts.selector))),t.$slide.one("onReset",function(){var o=l(e)?e.data("placeholder"):0;o&&(e.hide().replaceAll(o),e.data("placeholder",null)),n(this).empty(),t.isLoaded=!1}),t.$content=n(e).appendTo(t.$slide),t.opts.smallBtn===!0&&t.$content.find(".fancybox-close-small").remove().end().eq(0).append(t.opts.closeTpl),this.afterLoad(t))},setError:function(t){t.hasError=!0,this.setContent(t,t.opts.errorTpl)},showLoading:function(t){var e=this;t=t||e.current,t&&!t.$spinner&&(t.$spinner=n(e.opts.spinnerTpl).appendTo(t.$slide))},hideLoading:function(t){var e=this;t=t||e.current,t&&t.$spinner&&(t.$spinner.remove(),delete t.$spinner)},afterMove:function(){var t=this,e=t.current;e&&(e.isMoved=!0,e.$slide.siblings().trigger("onReset"),n.each(t.slides,function(e,n){(n.pos<t.currPos-1||n.pos>t.currPos+1)&&(n.$slide.remove(),delete t.slides[e])}),t.trigger("afterMove"),e.isLoaded&&t.complete())},afterLoad:function(t){var e=this;e.isClosing||(t.isLoading=!1,t.isLoaded=!0,e.trigger("afterLoad",t),e.hideLoading(t),t.$ghost||e.updateSlide(t,!0),t.index===e.currIndex?(t.isMoved?e.complete():e.revealImage(t),e.slides[e.currPos+1]&&"image"===e.slides[e.currPos+1].type&&e.loadSlide(e.slides[e.currPos+1]),e.slides[e.currPos-1]&&"image"===e.slides[e.currPos-1].type&&e.loadSlide(e.slides[e.currPos-1])):e.revealImage(t))},complete:function(){var t=this,e=t.current;e.isComplete=!0,t.trigger("onComplete"),t.allowZoomIn&&t.zoomIn()||(t.isOpening=!1,t.revealImage(e)),e.$slide.addClass("fancybox-slide--complete"),t.opts.focus&&t.focus()},focus:function(){var t=this.current&&this.current.isComplete?this.current.$slide.find('button,:input,[tabindex],a:not(".disabled")').filter(":visible:first"):null;t&&t.length||(t=this.$refs.container),t.focus(),this.$refs.slider_wrap.scrollLeft(0),this.current&&this.current.$slide.scrollTop(0)},activate:function(){var t=this;n(".fancybox-container").each(function(){var e=n(this).data("FancyBox");e&&e.uid!==t.uid&&!e.isClosing&&e.trigger("onDeactivate")}),t.current&&(t.$refs.container.index()>0&&t.$refs.container.prependTo(e.body),t.updateControls()),t.trigger("onActivate"),t.addEvents()},close:function(t){var e=this,o=e.current,s=n.proxy(function(){e.cleanUp(t)},this);return!e.isAnimating&&!e.isClosing&&(e.isClosing=!0,o.timouts&&clearTimeout(o.timouts),t!==!0&&n.fancybox.stop(e.$refs.slider),e.$refs.container.removeClass("fancybox-container--active").addClass("fancybox-container--closing"),o.$slide.removeClass("fancybox-slide--complete").siblings().remove(),o.isMoved||o.$slide.css("overflow","visible"),e.removeEvents(),e.hideLoading(o),e.hideControls(),e.updateCursor(),e.trigger("beforeClose",o,t),void(t===!0?(setTimeout(s,o.opts.speed),this.$refs.container.removeClass("fancybox-container--ready")):e.zoomOut(s)||n.fancybox.animate(e.$refs.container,null,{opacity:0},o.opts.speed,"easeInSine",s)))},cleanUp:function(t){var e,o=this;o.$refs.slider.children().trigger("onReset"),o.$refs.container.empty().remove(),o.current=null,o.trigger("afterClose",t),e=n.fancybox.getInstance(),e?e.activate():(n("body").removeClass("fancybox-enabled"),n("#fancybox-noscroll").remove()),o.$lastFocus&&o.$lastFocus.focus(),a.scrollTop(o.scrollTop).scrollLeft(o.scrollLeft)},trigger:function(t,e){var o=Array.prototype.slice.call(arguments,1),s=this,i=e&&e.opts?e:s.current;i?o.unshift(i):i=s,o.unshift(s),n.isFunction(i.opts[t])&&i.opts[t].apply(i,o),s.$refs.container.trigger(t+".fb",o)},toggleControls:function(t){this.isHiddenControls?this.updateControls(t):this.hideControls()},hideControls:function(){this.isHiddenControls=!0,this.$refs.container.removeClass("fancybox-show-controls"),this.$refs.container.removeClass("fancybox-show-caption")},updateControls:function(t){var e=this,o=e.$refs.container,s=e.$refs.caption,i=e.current,a=i.index,r=i.opts,c=r.caption;this.isHiddenControls&&t!==!0||(this.isHiddenControls=!1,e.$refs.container.addClass("fancybox-show-controls"),o.toggleClass("fancybox-show-infobar",!!r.infobar&&e.group.length>1).toggleClass("fancybox-show-buttons",!!r.buttons).toggleClass("fancybox-is-modal",!!r.modal),n(".fancybox-button--left",o).toggleClass("fancybox-button--disabled",!r.loop&&a<=0),n(".fancybox-button--right",o).toggleClass("fancybox-button--disabled",!r.loop&&a>=e.group.length-1),n(".fancybox-button--play",o).toggle(!!(r.slideShow&&e.group.length>1)),n(".fancybox-button--close",o).toggle(!!r.closeBtn),n(".js-fancybox-count",o).html(e.group.length),n(".js-fancybox-index",o).html(a+1),i.$slide.trigger("refresh"),s&&s.empty(),c&&c.length?(s.html(c),this.$refs.container.addClass("fancybox-show-caption "),e.$caption=s):this.$refs.container.removeClass("fancybox-show-caption"))}}),n.fancybox={version:"3.0.19",defaults:i,getInstance:function(t){var e=n('.fancybox-container:not(".fancybox-container--closing"):first').data("FancyBox"),o=Array.prototype.slice.call(arguments,1);return e instanceof h&&("string"===n.type(t)?e[t].apply(e,o):"function"===n.type(t)&&t.apply(e,o),e)},open:function(t,e,n){return new h(t,e,n)},close:function(t){var e=this.getInstance();e&&(e.close(),t===!0&&this.close())},isTouch:e.createTouch!==o&&/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent),use3d:function(){var n=e.createElement("div");return t.getComputedStyle(n).getPropertyValue("transform")&&!(e.documentMode&&e.documentMode<=11)}(),getTranslate:function(t){var e,n;return!(!t||!t.length)&&(e=t.get(0).getBoundingClientRect(),n=t.eq(0).css("transform"),n&&n.indexOf("matrix")!==-1?(n=n.split("(")[1],n=n.split(")")[0],n=n.split(",")):n=[],n.length?(n=n.length>10?[n[13],n[12],n[0],n[5]]:[n[5],n[4],n[0],n[3]],n=n.map(parseFloat)):n=[0,0,1,1],{top:n[0],left:n[1],scaleX:n[2],scaleY:n[3],opacity:parseFloat(t.css("opacity")),width:e.width,height:e.height})},setTranslate:function(t,e){var n="",s={};if(t&&e)return e.left===o&&e.top===o||(n=(e.left===o?t.position().top:e.left)+"px, "+(e.top===o?t.position().top:e.top)+"px",n=this.use3d?"translate3d("+n+", 0px)":"translate("+n+")"),e.scaleX!==o&&e.scaleY!==o&&(n=(n.length?n+" ":"")+"scale("+e.scaleX+", "+e.scaleY+")"),n.length&&(s.transform=n),e.opacity!==o&&(s.opacity=e.opacity),e.width!==o&&(s.width=e.width),e.height!==o&&(s.height=e.height),t.css(s)},easing:{easeOutCubic:function(t,e,n,o){return n*((t=t/o-1)*t*t+1)+e},easeInCubic:function(t,e,n,o){return n*(t/=o)*t*t+e},easeOutSine:function(t,e,n,o){return n*Math.sin(t/o*(Math.PI/2))+e},easeInSine:function(t,e,n,o){return-n*Math.cos(t/o*(Math.PI/2))+n+e}},stop:function(t){t.removeData("animateID")},animate:function(t,e,s,i,a,r){var c,l,d,h=this,p=null,f=0,g=function(n){if(c=[],l=0,t.length&&t.data("animateID")===d){if(n=n||Date.now(),p&&(l=n-p),p=n,f+=l,f>=i)return s.scaleX!==o&&s.scaleY!==o&&e.width!==o&&e.height!==o&&(s.width=e.width*s.scaleX,s.height=e.height*s.scaleY,s.scaleX=1,s.scaleY=1),h.setTranslate(t,s),void r();for(var b in s)s.hasOwnProperty(b)&&e[b]!==o&&(e[b]==s[b]?c[b]=s[b]:c[b]=h.easing[a](f,e[b],s[b]-e[b],i));h.setTranslate(t,c),u(g)}};return h.animateID=d=h.animateID===o?1:h.animateID+1,t.data("animateID",d),r===o&&"function"==n.type(a)&&(r=a,a=o),a||(a="easeOutCubic"),r=r||n.noop,i?(e?this.setTranslate(t,e):e=this.getTranslate(t),t.show(),void u(g)):(this.setTranslate(t,s),void r())}},n.fn.fancybox=function(t){return this.off("click.fb-start").on("click.fb-start",{items:this,options:t||{}},s),this},n(e).on("click.fb-start","[data-fancybox]",s)}(window,document,window.jQuery),function(t){"use strict";var e=function(e,n,o){if(e)return o=o||"","object"===t.type(o)&&(o=t.param(o,!0)),t.each(n,function(t,n){e=e.replace("$"+t,n||"")}),o.length&&(e+=(e.indexOf("?")>0?"&":"?")+o),e},n={youtube:{matcher:/(youtube\.com|youtu\.be|youtube\-nocookie\.com)\/(watch\?(.*&)?v=|v\/|u\/|embed\/?)?(videoseries\?list=(.*)|[\w-]{11}|\?listType=(.*)&list=(.*))(.*)/i,params:{autoplay:1,autohide:1,fs:1,rel:0,hd:1,wmode:"transparent",enablejsapi:1,html5:1},paramPlace:8,type:"iframe",url:"//www.youtube.com/embed/$4",thumb:"//img.youtube.com/vi/$4/hqdefault.jpg"},vimeo:{matcher:/((player\.)?vimeo(pro)?\.com)\/(video\/)?([\d]+)?(\?(.*))?/,params:{autoplay:1,hd:1,show_title:1,show_byline:1,show_portrait:0,fullscreen:1,api:1},paramPlace:7,type:"iframe",url:"//player.vimeo.com/video/$5"},metacafe:{matcher:/metacafe.com\/watch\/(\d+)\/(.*)?/,type:"iframe",url:"//www.metacafe.com/embed/$1/?ap=1"},dailymotion:{matcher:/dailymotion.com\/video\/(.*)\/?(.*)/,params:{additionalInfos:0,autoStart:1},type:"iframe",url:"//www.dailymotion.com/embed/video/$1"},vine:{matcher:/vine.co\/v\/([a-zA-Z0-9\?\=\-]+)/,type:"iframe",url:"//vine.co/v/$1/embed/simple"},instagram:{matcher:/(instagr\.am|instagram\.com)\/p\/([a-zA-Z0-9_\-]+)\/?/i,type:"image",url:"//$1/p/$2/media/?size=l"},google_maps:{matcher:/(maps\.)?google\.([a-z]{2,3}(\.[a-z]{2})?)\/(((maps\/(place\/(.*)\/)?\@(.*),(\d+.?\d+?)z))|(\?ll=))(.*)?/i,type:"iframe",url:function(t){return"//maps.google."+t[2]+"/?ll="+(t[9]?t[9]+"&z="+Math.floor(t[10])+(t[12]?t[12].replace(/^\//,"&"):""):t[12])+"&output="+(t[12]&&t[12].indexOf("layer=c")>0?"svembed":"embed")}}};t(document).on("onInit.fb",function(o,s){t.each(s.group,function(o,s){var i,a,r,c,l,u,d,h=s.src||"",p=!1;s.type||(t.each(n,function(n,o){if(a=h.match(o.matcher),l={},d=n,a){if(p=o.type,o.paramPlace&&a[o.paramPlace]){c=a[o.paramPlace],"?"==c[0]&&(c=c.substring(1)),c=c.split("&");for(var f=0;f<c.length;++f){var g=c[f].split("=",2);2==g.length&&(l[g[0]]=decodeURIComponent(g[1].replace(/\+/g," ")))}}return o.idPlace&&(u=a[o.idPlace]),r=t.extend(!0,{},o.params,s.opts[n],l),h="function"===t.type(o.url)?o.url.call(this,a,r,s):e(o.url,a,r),i="function"===t.type(o.thumb)?o.thumb.call(this,a,r,s):e(o.thumb,a),!1}}),p?(s.src=h,s.type=p,s.opts.thumb||s.opts.$thumb&&s.opts.$thumb.length||(s.opts.thumb=i),u&&(s.opts.id=d+"-"+u),"iframe"===p&&(t.extend(!0,s.opts,{iframe:{preload:!1,scrolling:"no"},smallBtn:!1,closeBtn:!0,fullScreen:!1,slideShow:!1}),s.opts.slideClass+=" fancybox-slide--video")):s.type="iframe")})})}(window.jQuery),function(t,e,n){"use strict";var o=function(){return t.requestAnimationFrame||t.webkitRequestAnimationFrame||t.mozRequestAnimationFrame||function(e){t.setTimeout(e,1e3/60)}}(),s=function(e){var n=[];e=e.originalEvent||e||t.e,e=e.touches&&e.touches.length?e.touches:e.changedTouches&&e.changedTouches.length?e.changedTouches:[e];for(var o in e)e[o].pageX?n.push({x:e[o].pageX,y:e[o].pageY}):e[o].clientX&&n.push({x:e[o].clientX,y:e[o].clientY});return n},i=function(t,e,n){return"x"===n?t.x-e.x:"y"===n?t.y-e.y:Math.sqrt(Math.pow(t.x-e.x,2)+Math.pow(t.y-e.y,2))},a=function(t){return t.is("a")||t.is("button")||t.is("input")||t.is("select")||t.is("textarea")||n.isFunction(t.get(0).onclick)},r=function(e){var n=t.getComputedStyle(e)["overflow-y"],o=t.getComputedStyle(e)["overflow-x"],s=("scroll"===n||"auto"===n)&&e.scrollHeight>e.clientHeight,i=("scroll"===o||"auto"===o)&&e.scrollWidth>e.clientWidth;return s||i},c=function(t){for(var e=!1;;){if(e=r(t.get(0)))break;if(t=t.parent(),!t.length||t.hasClass("fancybox-slider")||t.is("body"))break}return e},l=function(t){var e=this;e.instance=t,e.$wrap=t.$refs.slider_wrap,e.$slider=t.$refs.slider,e.$container=t.$refs.container,e.destroy(),e.$wrap.on("touchstart.fb mousedown.fb",n.proxy(e,"ontouchstart"))};l.prototype.destroy=function(){this.$wrap.off("touchstart.fb mousedown.fb touchmove.fb mousemove.fb touchend.fb touchcancel.fb mouseup.fb mouseleave.fb")},l.prototype.ontouchstart=function(e){var r=this,l=n(e.target),u=r.instance,d=u.current,h=d.$content||d.$placeholder,p=function(){r.sliderNewPos&&(n.fancybox.setTranslate(r.$slider,r.sliderNewPos),r.sliderNewPos=null),r.contentNewPos&&(n.fancybox.setTranslate(r.$content,r.contentNewPos),r.contentNewPos=null),(r.isSwiping||r.isPanning||r.isZooming)&&o(p)};a(l)||a(l.parent())||c(l)&&!l.hasClass("fancybox-slide")||(e.stopPropagation(),e.preventDefault(),!d||r.instance.isAnimating||r.instance.isClosing||(r.startPoints=s(e),r.startPoints.length>1&&!d.isMoved||(r.$wrap.off("touchmove.fb mousemove.fb",n.proxy(r,"ontouchmove")),r.$wrap.off("touchend.fb touchcancel.fb mouseup.fb mouseleave.fb",n.proxy(r,"ontouchend")),r.$wrap.on("touchmove.fb mousemove.fb",n.proxy(r,"ontouchmove")),r.$wrap.on("touchend.fb touchcancel.fb mouseup.fb mouseleave.fb",n.proxy(r,"ontouchend")),r.$target=l,r.$content=h,r.startTime=(new Date).getTime(),r.distanceX=r.distanceY=r.distance=0,r.canvasWidth=Math.round(d.$slide.width()),r.canvasHeight=Math.round(d.$slide.height()),r.canTap=d.isMoved,r.isPanning=!1,r.isSwiping=!1,r.isZooming=!1,r.sliderStartPos=n.fancybox.getTranslate(r.$slider),r.sliderNewPos=null,r.contentStartPos=n.fancybox.getTranslate(r.$content),r.contentNewPos=null,1==r.startPoints.length&&("image"===d.type&&(r.contentStartPos.width>r.canvasWidth+1||r.contentStartPos.height>r.canvasHeight+1)?(n.fancybox.stop(r.$content),r.isPanning=!0):(n.fancybox.stop(r.$slider),r.isSwiping=!0),r.$container.addClass("fancybox-controls--isGrabbing")),"image"!==d.type||d.hasError||2!=r.startPoints.length||!d.isLoaded&&!d.$ghost||(r.isZooming=!0,r.canTap=!1,n.fancybox.stop(r.$content),r.centerPointStartX=(r.startPoints[0].x+r.startPoints[1].x)/2-n(t).scrollLeft(),r.centerPointStartY=(r.startPoints[0].y+r.startPoints[1].y)/2-n(t).scrollTop(),r.percentageOfImageAtPinchPointX=(r.centerPointStartX-r.contentStartPos.left)/r.contentStartPos.width,r.percentageOfImageAtPinchPointY=(r.centerPointStartY-r.contentStartPos.top)/r.contentStartPos.height,r.startDistanceBetweenFingers=i(r.startPoints[0],r.startPoints[1])),p())))},l.prototype.ontouchmove=function(t){var e=this;t.preventDefault(),e.instance.isAnimating||(e.newPoints=s(t),e.newPoints.length&&(e.distanceX=i(e.newPoints[0],e.startPoints[0],"x"),e.distanceY=i(e.newPoints[0],e.startPoints[0],"y"),e.distance=i(e.newPoints[0],e.startPoints[0]),e.distance>0&&(e.isSwiping?e.onSwipe():e.isPanning?e.onPan():e.isZooming&&e.onZoom())))},l.prototype.onSwipe=function(){var e,o=this,s=o.isSwiping;s===!0?Math.abs(o.distance)>10&&(e=Math.abs(180*Math.atan2(o.distanceY,o.distanceX)/Math.PI),s=e>45&&e<135||o.instance.group.length<=1?"y":"x",(o.instance.opts.touch.vertical===!1||"auto"===o.instance.opts.touch.vertical&&n(t).width()>800)&&(s="x"),o.isSwiping=s,o.canTap=!1,o.instance.current.isMoved=!1,o.instance.allowZoomIn=!1,o.startPoints=o.newPoints):o.sliderNewPos={top:"x"==s?0:o.sliderStartPos.top+o.distanceY,left:"y"==s?o.sliderStartPos.left:o.sliderStartPos.left+o.distanceX}},l.prototype.onPan=function(){var t,e,n,o=this;o.canTap=!1,t=o.contentStartPos.width>o.canvasWidth?o.contentStartPos.left+o.distanceX:o.contentStartPos.left,e=o.contentStartPos.top+o.distanceY,n=o.limitMovement(t,e,o.contentStartPos.width,o.contentStartPos.height),n.scaleX=o.contentStartPos.scaleX,n.scaleY=o.contentStartPos.scaleY,o.contentNewPos=n,o.contentLastPos=n},l.prototype.limitMovement=function(t,e,n,o){var s,i,a,r,c=this,l=c.canvasWidth,u=c.canvasHeight,d=c.contentStartPos.left,h=c.contentStartPos.top,p=c.distanceX,f=c.distanceY;return s=Math.max(0,.5*l-.5*n),i=Math.max(0,.5*u-.5*o),a=Math.min(l-n,.5*l-.5*n),r=Math.min(u-o,.5*u-.5*o),n>l&&(p>0&&t>s&&(t=s-1+Math.pow(-s+d+p,.8)||0),p<0&&t<a&&(t=a+1-Math.pow(a-d-p,.8)||0)),o>u&&(f>0&&e>i&&(e=i-1+Math.pow(-i+h+f,.8)||0),f<0&&e<r&&(e=r+1-Math.pow(r-h-f,.8)||0)),{top:e,left:t}},l.prototype.limitPosition=function(t,e,n,o){var s=this,i=s.canvasWidth,a=s.canvasHeight;
  return n>i?(t=t>0?0:t,t=t<i-n?i-n:t):t=Math.max(0,i/2-n/2),o>a?(e=e>0?0:e,e=e<a-o?a-o:e):e=Math.max(0,a/2-o/2),{top:e,left:t}},l.prototype.onZoom=function(){var e=this,o=e.contentStartPos.width,s=e.contentStartPos.height,a=e.contentStartPos.left,r=e.contentStartPos.top,c=i(e.newPoints[0],e.newPoints[1]),l=c/e.startDistanceBetweenFingers,u=Math.floor(o*l),d=Math.floor(s*l),h=(o-u)*e.percentageOfImageAtPinchPointX,p=(s-d)*e.percentageOfImageAtPinchPointY,f=(e.newPoints[0].x+e.newPoints[1].x)/2-n(t).scrollLeft(),g=(e.newPoints[0].y+e.newPoints[1].y)/2-n(t).scrollTop(),b=f-e.centerPointStartX,m=g-e.centerPointStartY,y=a+(h+b),v=r+(p+m),x={top:v,left:y,scaleX:e.contentStartPos.scaleX*l,scaleY:e.contentStartPos.scaleY*l};e.canTap=!1,e.newWidth=u,e.newHeight=d,e.contentNewPos=x,e.contentLastPos=x},l.prototype.ontouchend=function(t){var e=this,o=e.instance.current,i=Math.max((new Date).getTime()-e.startTime,1),a=e.isSwiping,r=e.isPanning,c=e.isZooming;if(e.endPoints=s(t),!(e.endPoints.length>1)||"x"!==e.isSwiping&&"y"!==e.isSwiping){if(e.$container.removeClass("fancybox-controls--isGrabbing"),e.$wrap.off("touchmove.fb mousemove.fb",n.proxy(this,"ontouchmove")),e.$wrap.off("touchend.fb touchcancel.fb mouseup.fb mouseleave.fb",n.proxy(this,"ontouchend")),e.isSwiping=!1,e.isPanning=!1,e.isZooming=!1,e.canTap)return e.ontap();e.velocityX=e.distanceX/i*.5,e.velocityY=e.distanceY/i*.5,e.speed=o.opts.speed,e.speedX=Math.max(.5*e.speed,Math.min(1.5*e.speed,1/Math.abs(e.velocityX)*e.speed)),e.speedY=Math.max(.5*e.speed,Math.min(1.5*e.speed,1/Math.abs(e.velocityY)*e.speed)),a?e.endSwiping(a):r?e.endPanning():c&&e.endZooming()}},l.prototype.endSwiping=function(t){var e=this;"y"==t&&Math.abs(e.distanceY)>50?(n.fancybox.animate(e.$slider,null,{top:e.sliderStartPos.top+e.distanceY+150*e.velocityY,left:e.sliderStartPos.left,opacity:0},e.speedY),e.instance.close(!0)):"x"==t&&e.distanceX>50?e.instance.previous(e.speedX):"x"==t&&e.distanceX<-50?e.instance.next(e.speedX):e.instance.update(!1,!0,e.speedX)},l.prototype.endPanning=function(){var t=this,e=t.contentLastPos.left+t.velocityX*t.speed*2,o=t.contentLastPos.top+t.velocityY*t.speed*2,s=t.limitPosition(e,o,t.contentStartPos.width,t.contentStartPos.height);s.width=t.contentStartPos.width,s.height=t.contentStartPos.height,n.fancybox.animate(t.$content,null,s,t.speed,"easeOutSine")},l.prototype.endZooming=function(){var t,e=this,o=e.instance.current,s=e.contentLastPos.left,i=e.contentLastPos.top,a=e.newWidth,r=e.newHeight,c={top:i,left:s,width:a,height:r,scaleX:1,scaleY:1};n.fancybox.setTranslate(e.$content,c),a<e.canvasWidth&&r<e.canvasHeight?e.instance.scaleToFit(150):a>o.width||r>o.height?e.instance.scaleToActual(e.centerPointStartX,e.centerPointStartY,150):(t=e.limitPosition(s,i,a,r),n.fancybox.animate(e.$content,null,t,e.speed,"easeOutSine"))},l.prototype.ontap=function(){var t=this,e=t.endPoints[0].x,o=t.endPoints[0].y;if(e-=t.$wrap.offset().left,o-=t.$wrap.offset().top,!n.fancybox.isTouch)return t.instance.opts.closeClickOutside&&t.$target.is(".fancybox-slide")?void t.instance.close():void("image"==t.instance.current.type&&t.instance.current.isMoved&&(t.instance.canPan()?t.instance.scaleToFit():t.instance.isScaledDown()?t.instance.scaleToActual(e,o):t.instance.group.length<2&&t.instance.close()));if(t.tapped){if(t.tapped=!1,clearTimeout(t.id),Math.abs(e-t.x)>50||Math.abs(o-t.y)>50||!t.instance.current.isMoved)return this;if(!t.instance.current.isLoaded&&!t.instance.current.$ghost)return;"image"==t.instance.current.type&&(t.instance.canPan()?t.instance.scaleToFit():t.instance.isScaledDown()&&t.instance.scaleToActual(e,o))}else t.tapped=!0,t.x=e,t.y=o,t.id=setTimeout(function(){t.tapped=!1,t.instance.toggleControls(!0)},300);return this},n(e).on("onActivate.fb",function(t,e){e.opts.touch&&!e.Guestures&&(e.Guestures=new l(e))}),n(e).on("beforeClose.fb",function(t,e){e.Guestures&&e.Guestures.destroy()})}(window,document,window.jQuery),function(t,e){"use strict";var n=function(t){this.instance=t,this.init()};e.extend(n.prototype,{timer:null,speed:3e3,$button:null,init:function(){var t=this;t.$button=e('<button data-fancybox-play class="fancybox-button fancybox-button--play" title="Slideshow (P)"></button>').appendTo(t.instance.$refs.buttons),t.instance.$refs.container.on("click","[data-fancybox-play]",function(){t.toggle()})},set:function(){var t=this;t.instance&&t.instance.current&&t.instance.currIndex<t.instance.group.length-1?t.timer=setTimeout(function(){t.instance.next()},t.speed):t.stop()},clear:function(){var t=this;clearTimeout(t.timer),t.timer=null},start:function(){var t=this;t.stop(),t.instance&&t.instance.current&&t.instance.currIndex<t.instance.group.length-1&&(t.instance.$refs.container.on({"beforeLoad.fb.player":e.proxy(t,"clear"),"onComplete.fb.player":e.proxy(t,"set")}),t.instance.current.isComplete?t.set():t.timer=!0,t.instance.$refs.container.trigger("onPlayStart"),t.$button.addClass("fancybox-button--pause"))},stop:function(){var t=this;t.clear(),t.instance.$refs.container.trigger("onPlayEnd").off(".player"),t.$button.removeClass("fancybox-button--pause")},toggle:function(){var t=this;t.timer?t.stop():t.start()}}),e(t).on("onInit.fb",function(t,e){e.opts.slideShow&&!e.SlideShow&&e.group.length>1&&(e.SlideShow=new n(e))}),e(t).on("beforeClose.fb onDeactivate.fb",function(t,e){e.SlideShow&&e.SlideShow.stop()})}(document,window.jQuery),function(t,e){"use strict";var n=function(t){this.instance=t,this.init()};e.extend(n.prototype,{$button:null,init:function(){var n=this;n.isAvailable()&&(n.$button=e('<button data-fancybox-fullscreen class="fancybox-button fancybox-button--fullscreen" title="Full screen (F)"></button>').appendTo(n.instance.$refs.buttons),n.instance.$refs.container.on("click.fb-fullscreen","[data-fancybox-fullscreen]",function(t){t.stopPropagation(),t.preventDefault(),n.toggle()}),e(t).on("onUpdate.fb",function(t,e){n.$button.toggle(!!e.current.opts.fullScreen),n.$button.toggleClass("fancybox-button-shrink",n.isActivated())}),e(t).on("afterClose.fb",function(){n.exit()}))},isAvailable:function(){var t=this.instance.$refs.container.get(0);return!!(t.requestFullscreen||t.msRequestFullscreen||t.mozRequestFullScreen||t.webkitRequestFullscreen)},isActivated:function(){return!!(t.fullscreenElement||t.mozFullScreenElement||t.webkitFullscreenElement||t.msFullscreenElement)},launch:function(){var t=this.instance.$refs.container.get(0);t&&!this.instance.isClosing&&(t.requestFullscreen?t.requestFullscreen():t.msRequestFullscreen?t.msRequestFullscreen():t.mozRequestFullScreen?t.mozRequestFullScreen():t.webkitRequestFullscreen&&t.webkitRequestFullscreen(t.ALLOW_KEYBOARD_INPUT))},exit:function(){t.exitFullscreen?t.exitFullscreen():t.msExitFullscreen?t.msExitFullscreen():t.mozCancelFullScreen?t.mozCancelFullScreen():t.webkitExitFullscreen&&t.webkitExitFullscreen()},toggle:function(){this.isActivated()?this.exit():this.isAvailable()&&this.launch()}}),e(t).on("onInit.fb",function(t,e){e.opts.fullScreen&&!e.FullScreen&&(e.FullScreen=new n(e))})}(document,window.jQuery),function(t,e){"use strict";var n=function(t){this.instance=t,this.init()};e.extend(n.prototype,{$button:null,$grid:null,$list:null,isVisible:!1,init:function(){var t=this;t.$button=e('<button data-fancybox-thumbs class="fancybox-button fancybox-button--thumbs" title="Thumbnails (G)"></button>').appendTo(this.instance.$refs.buttons).on("touchend click",function(e){e.stopPropagation(),e.preventDefault(),t.toggle()})},create:function(){var t,n,o=this.instance;this.$grid=e('<div class="fancybox-thumbs"></div>').appendTo(o.$refs.container),t="<ul>",e.each(o.group,function(e,o){n=o.opts.thumb||(o.opts.$thumb?o.opts.$thumb.attr("src"):null),n||"image"!==o.type||(n=o.src),n&&n.length&&(t+='<li data-index="'+e+'"  tabindex="0" class="fancybox-thumbs-loading"><img data-src="'+n+'" /></li>')}),t+="</ul>",this.$list=e(t).appendTo(this.$grid).on("click touchstart","li",function(){o.jumpTo(e(this).data("index"))}),this.$list.find("img").hide().one("load",function(){var t,n,o,s,i=e(this).parent().removeClass("fancybox-thumbs-loading"),a=i.outerWidth(),r=i.outerHeight();t=this.naturalWidth||this.width,n=this.naturalHeight||this.height,o=t/a,s=n/r,o>=1&&s>=1&&(o>s?(t/=s,n=r):(t=a,n/=o)),e(this).css({width:Math.floor(t),height:Math.floor(n),"margin-top":Math.min(0,Math.floor(.3*r-.3*n)),"margin-left":Math.min(0,Math.floor(.5*a-.5*t))}).show()}).each(function(){this.src=e(this).data("src")})},focus:function(){this.instance.current&&this.$list.children().removeClass("fancybox-thumbs-active").filter('[data-index="'+this.instance.current.index+'"]').addClass("fancybox-thumbs-active").focus()},close:function(){this.$grid.hide()},update:function(){this.instance.$refs.container.toggleClass("fancybox-container--thumbs",this.isVisible),this.isVisible?(this.$grid||this.create(),this.$grid.show(),this.focus()):this.$grid&&this.$grid.hide(),this.instance.allowZoomIn||this.instance.update()},hide:function(){this.isVisible=!1,this.update()},show:function(){this.isVisible=!0,this.update()},toggle:function(){this.isVisible?this.hide():this.show()}}),e(t).on("onInit.fb",function(t,e){e.opts.thumbs&&!e.Thumbs&&e.group.length>1&&("image"==e.group[0].type||e.group[0].opts.thumb)&&("image"==e.group[1].type||e.group[1].opts.thumb)&&(e.Thumbs=new n(e))}),e(t).on("beforeMove.fb",function(t,e,n){var o=e.Thumbs;o&&(n.modal?(o.$button.hide(),o.hide()):(o.$button.show(),e.opts.thumbs.showOnStart===!0&&e.allowZoomIn?o.show():o.isVisible&&o.focus()))}),e(t).on("beforeClose.fb",function(t,e){e.Thumbs&&e.Thumbs.isVisible&&e.opts.thumbs.hideOnClosing!==!1&&e.Thumbs.close(),e.Thumbs=null})}(document,window.jQuery);
  ;+function($){'use strict';var Affix=function(element,options){this.options=$.extend({},Affix.DEFAULTS,options)
  this.$target=$(this.options.target).on('scroll.bs.affix.data-api',$.proxy(this.checkPosition,this))
  this.$element=$(element)
  this.affixed=null
  this.unpin=null
  this.pinnedOffset=null
  this.checkPosition()}
  Affix.VERSION='3.3.6'
  Affix.RESET='affix affix-top affix-bottom'
  Affix.DEFAULTS={offset:0,target:window}
  Affix.prototype.getState=function(scrollHeight,height,offsetTop,offsetBottom){var scrollTop=this.$target.scrollTop()
  var position=this.$element.offset()
  var targetHeight=this.$target.height()
  if(offsetTop!=null&&this.affixed=='top')return scrollTop<offsetTop?'top':false
  if(this.affixed=='bottom'){if(offsetTop!=null)return(scrollTop+this.unpin<=position.top)?false:'bottom'
  return(scrollTop+targetHeight<=scrollHeight-offsetBottom)?false:'bottom'}
  var initializing=this.affixed==null
  var colliderTop=initializing?scrollTop:position.top
  var colliderHeight=initializing?targetHeight:height
  if(offsetTop!=null&&scrollTop<=offsetTop)return'top'
  if(offsetBottom!=null&&(colliderTop+colliderHeight>=scrollHeight-offsetBottom))return'bottom'
  return false}
  Affix.prototype.getPinnedOffset=function(){if(this.pinnedOffset)return this.pinnedOffset
  this.$element.removeClass(Affix.RESET).addClass('affix')
  var scrollTop=this.$target.scrollTop()
  var position=this.$element.offset()
  return(this.pinnedOffset=position.top-scrollTop)}
  Affix.prototype.checkPositionWithEventLoop=function(){setTimeout($.proxy(this.checkPosition,this),1)}
  Affix.prototype.checkPosition=function(){if(!this.$element.is(':visible'))return
  var height=this.$element.height()
  var offset=this.options.offset
  var offsetTop=offset.top
  var offsetBottom=offset.bottom
  var scrollHeight=Math.max($(document).height(),$(document.body).height())
  if(typeof offset!='object')offsetBottom=offsetTop=offset
  if(typeof offsetTop=='function')offsetTop=offset.top(this.$element)
  if(typeof offsetBottom=='function')offsetBottom=offset.bottom(this.$element)
  var affix=this.getState(scrollHeight,height,offsetTop,offsetBottom)
  if(this.affixed!=affix){if(this.unpin!=null)this.$element.css('top','')
  var affixType='affix'+(affix?'-'+affix:'')
  var e=$.Event(affixType+'.bs.affix')
  this.$element.trigger(e)
  if(e.isDefaultPrevented())return
  this.affixed=affix
  this.unpin=affix=='bottom'?this.getPinnedOffset():null
  this.$element.removeClass(Affix.RESET).addClass(affixType).trigger(affixType.replace('affix','affixed')+'.bs.affix')
  if(!this.$element.hasClass('affixer')){if(affixType=='affix'){this.$element.before('<div class="fix-row" style="height: '+this.$element.outerHeight(true)+'px"></div>');}else{this.$element.prev('.fix-row').remove();}}}
  if(affix=='bottom'){this.$element.offset({top:scrollHeight-height-offsetBottom})}}
  function Plugin(option){return this.each(function(){var $this=$(this)
  var data=$this.data('bs.affix')
  var options=typeof option=='object'&&option
  if(!data)$this.data('bs.affix',(data=new Affix(this,options)))
  if(typeof option=='string')data[option]()})}
  var old=$.fn.affix
  $.fn.affix=Plugin
  $.fn.affix.Constructor=Affix
  $.fn.affix.noConflict=function(){$.fn.affix=old
  return this}
  $(window).on('load',function(){$('[data-spy="affix"]').each(function(){var $spy=$(this)
  var data=$spy.data()
  data.offset=data.offset||{}
  if(data.offsetBottom!=null)data.offset.bottom=data.offsetBottom
  if(data.offsetTop!=null)data.offset.top=data.offsetTop
  Plugin.call($spy,data)})})}(jQuery);
  /*!
   * Theia Sticky Sidebar v1.5.0
   * https://github.com/WeCodePixels/theia-sticky-sidebar
   *
   * Glues your website's sidebars, making them permanently visible while scrolling.
   *
   * Copyright 2013-2016 WeCodePixels and other contributors
   * Released under the MIT license
   * modded o.container
   */
  !function(i){i.fn.theiaStickySidebar=function(t){function e(t,e){var a=o(t,e);a||(console.log("TSS: Body width smaller than options.minWidth. Init is delayed."),i(document).on("scroll."+t.namespace,function(t,e){return function(a){var n=o(t,e);n&&i(this).unbind(a)}}(t,e)),i(window).on("resize."+t.namespace,function(t,e){return function(a){var n=o(t,e);n&&i(this).unbind(a)}}(t,e)))}function o(t,e){return t.initialized===!0||!(i("body").width()<t.minWidth)&&(a(t,e),!0)}function a(t,e){t.initialized=!0;var o=i("#theia-sticky-sidebar-stylesheet-"+t.namespace);0===o.length&&i("head").append(i('<style id="theia-sticky-sidebar-stylesheet-'+t.namespace+'">.theiaStickySidebar:after {content: ""; display: table; clear: both;}</style>')),e.each(function(){function e(){a.fixedScrollTop=0,a.sidebar.css({"min-height":"1px"}),a.stickySidebar.css({position:"static",width:"",transform:"none"})}function o(t){var e=t.height();return t.children().each(function(){e=Math.max(e,i(this).height())}),e}var a={};if(a.sidebar=i(this),a.options=t||{},a.container=i(a.options.containerSelector),0==a.container.length&&(a.container=a.sidebar.parent()),a.sidebar.parents().css("-webkit-transform","none"),a.sidebar.css({position:a.options.defaultPosition,overflow:"visible","-webkit-box-sizing":"border-box","-moz-box-sizing":"border-box","box-sizing":"border-box"}),a.stickySidebar=a.sidebar.find(".theiaStickySidebar"),0==a.stickySidebar.length){var s=/(?:text|application)\/(?:x-)?(?:javascript|ecmascript)/i;a.sidebar.find("script").filter(function(i,t){return 0===t.type.length||t.type.match(s)}).remove(),a.stickySidebar=i("<div>").addClass("theiaStickySidebar").append(a.sidebar.children()),a.sidebar.append(a.stickySidebar)}a.marginBottom=parseInt(a.sidebar.css("margin-bottom")),a.paddingTop=parseInt(a.sidebar.css("padding-top")),a.paddingBottom=parseInt(a.sidebar.css("padding-bottom"));var r=a.stickySidebar.offset().top,d=a.stickySidebar.outerHeight();a.stickySidebar.css("padding-top",1),a.stickySidebar.css("padding-bottom",1),r-=a.stickySidebar.offset().top,d=a.stickySidebar.outerHeight()-d-r,0==r?(a.stickySidebar.css("padding-top",0),a.stickySidebarPaddingTop=0):a.stickySidebarPaddingTop=1,0==d?(a.stickySidebar.css("padding-bottom",0),a.stickySidebarPaddingBottom=0):a.stickySidebarPaddingBottom=1,a.previousScrollTop=null,a.fixedScrollTop=0,e(),a.onScroll=function(a){if(a.stickySidebar.is(":visible")){if(i("body").width()<a.options.minWidth)return void e();if(a.options.disableOnResponsiveLayouts){var s=a.sidebar.outerWidth("none"==a.sidebar.css("float"));if(s+50>a.container.width())return void e()}var r=i(document).scrollTop(),d="static";if(r>=a.sidebar.offset().top+(a.paddingTop-a.options.additionalMarginTop)){var c,p=a.paddingTop+t.additionalMarginTop,b=a.paddingBottom+a.marginBottom+t.additionalMarginBottom,l=a.sidebar.offset().top,f=a.sidebar.offset().top+o(a.container),h=0+t.additionalMarginTop,g=a.stickySidebar.outerHeight()+p+b<i(window).height();c=g?h+a.stickySidebar.outerHeight():i(window).height()-a.marginBottom-a.paddingBottom-t.additionalMarginBottom;var u=l-r+a.paddingTop,S=f-r-a.paddingBottom-a.marginBottom,y=a.stickySidebar.offset().top-r,m=a.previousScrollTop-r;"fixed"==a.stickySidebar.css("position")&&"modern"==a.options.sidebarBehavior&&(y+=m),"stick-to-top"==a.options.sidebarBehavior&&(y=t.additionalMarginTop),"stick-to-bottom"==a.options.sidebarBehavior&&(y=c-a.stickySidebar.outerHeight()),y=m>0?Math.min(y,h):Math.max(y,c-a.stickySidebar.outerHeight()),y=Math.max(y,u),y=Math.min(y,S-a.stickySidebar.outerHeight());var k=a.container.height()==a.stickySidebar.outerHeight();d=(k||y!=h)&&(k||y!=c-a.stickySidebar.outerHeight())?r+y-a.sidebar.offset().top-a.paddingTop<=t.additionalMarginTop?"static":"absolute":"fixed"}if("fixed"==d){var v=i(document).scrollLeft();a.stickySidebar.css({position:"fixed",width:n(a.stickySidebar)+"px",transform:"translateY("+y+"px)",left:a.sidebar.offset().left+parseInt(a.sidebar.css("padding-left"))-v+"px",top:"0px"})}else if("absolute"==d){var x={};"absolute"!=a.stickySidebar.css("position")&&(x.position="absolute",x.transform="translateY("+(r+y-a.sidebar.offset().top-a.stickySidebarPaddingTop-a.stickySidebarPaddingBottom)+"px)",x.top="0px"),x.width=n(a.stickySidebar)+"px",x.left="",a.stickySidebar.css(x)}else"static"==d&&e();"static"!=d&&1==a.options.updateSidebarHeight&&a.sidebar.css({"min-height":a.stickySidebar.outerHeight()+a.stickySidebar.offset().top-a.sidebar.offset().top+a.paddingBottom}),a.previousScrollTop=r}},a.onScroll(a),i(document).on("scroll."+a.options.namespace,function(i){return function(){i.onScroll(i)}}(a)),i(window).on("resize."+a.options.namespace,function(i){return function(){i.stickySidebar.css({position:"static"}),i.onScroll(i)}}(a)),"undefined"!=typeof ResizeSensor&&new ResizeSensor(a.stickySidebar[0],function(i){return function(){i.onScroll(i)}}(a))})}function n(i){var t;try{t=i[0].getBoundingClientRect().width}catch(i){}return"undefined"==typeof t&&(t=i.width()),t}var s={containerSelector:"",additionalMarginTop:0,additionalMarginBottom:0,updateSidebarHeight:!0,minWidth:0,disableOnResponsiveLayouts:!0,sidebarBehavior:"modern",defaultPosition:"relative",namespace:"TSS"};return t=i.extend(s,t),t.additionalMarginTop=parseInt(t.additionalMarginTop)||0,t.additionalMarginBottom=parseInt(t.additionalMarginBottom)||0,e(t,this),this}}(jQuery);