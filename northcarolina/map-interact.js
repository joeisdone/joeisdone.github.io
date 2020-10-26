function isTouchEnabled() {
  return (("ontouchstart" in window)
    || (navigator.MaxTouchPoints > 0)
    || (navigator.msMaxTouchPoints > 0));
}
jQuery(function () {
  jQuery("path[id^=usncjs]").each(function (i, e) {
    usncaddEvent( jQuery(e).attr("id"));
  });
});
function usncaddEvent(id,relationId) {
  var _obj = jQuery("#" + id);
  var arr = id.split("");
  var _Textobj = jQuery("#" + id + "," + "#usncjsvn" + arr.slice(6).join(""));
  jQuery("#" + ["visnames"]).attr({"fill":usncjsconfig.general.visibleNames});
  _obj.attr({"fill":usncjsconfig[id].upColor, "stroke":usncjsconfig.general.borderColor});
  _Textobj.attr({"cursor": "default"});
  if (usncjsconfig[id].active === true) {
    _Textobj.attr({"cursor": "pointer"});
    _Textobj.hover(function () {
      jQuery("#usncjstip").show().html(usncjsconfig[id].hover);
      _obj.css({"fill":usncjsconfig[id].overColor});
    }, function () {
      jQuery("#usncjstip").hide();
      jQuery("#" + id).css({"fill":usncjsconfig[id].upColor});
    });
    if (usncjsconfig[id].target !== "none") {
      _Textobj.mousedown(function () {
        jQuery("#" + id).css({"fill":usncjsconfig[id].downColor});
      });
    }
    _Textobj.mouseup(function () {
      jQuery("#" + id).css({"fill":usncjsconfig[id].overColor});
      if (usncjsconfig[id].target === "new_window") {
        window.open(usncjsconfig[id].url);	
      } else if (usncjsconfig[id].target === "same_window") {
        window.parent.location.href = usncjsconfig[id].url;
      } else if (usncjsconfig[id].target === "modal") {
        jQuery(usncjsconfig[id].url).modal("show");
      }
    });
    _Textobj.mousemove(function (e) {
      var x = e.pageX + 10, y = e.pageY + 15;
      var tipw =jQuery("#usncjstip").outerWidth(), tiph =jQuery("#usncjstip").outerHeight(),
      x = (x + tipw >jQuery(document).scrollLeft() +jQuery(window).width())? x - tipw - (20 * 2) : x ;
      y = (y + tiph >jQuery(document).scrollTop() +jQuery(window).height())? jQuery(document).scrollTop() +jQuery(window).height() - tiph - 10 : y ;
      jQuery("#usncjstip").css({left: x, top: y});
    });
    if (isTouchEnabled()) {
      _Textobj.on("touchstart", function (e) {
        var touch = e.originalEvent.touches[0];
        var x = touch.pageX + 10, y = touch.pageY + 15;
        var tipw =jQuery("#usncjstip").outerWidth(), tiph =jQuery("#usncjstip").outerHeight(),
        x = (x + tipw >jQuery(document).scrollLeft() +jQuery(window).width())? x - tipw -(20 * 2) : x ;
        y =(y + tiph >jQuery(document).scrollTop() +jQuery(window).height())? jQuery(document).scrollTop() +jQuery(window).height() -tiph - 10 : y ;
        jQuery("#" + id).css({"fill":usncjsconfig[id].downColor});
        jQuery("#usncjstip").show().html(usncjsconfig[id].hover);
        jQuery("#usncjstip").css({left: x, top: y});
      });
      _Textobj.on("touchend", function () {
        jQuery("#" + id).css({"fill":usncjsconfig[id].upColor});
        if (usncjsconfig[id].target === "new_window") {
          window.open(usncjsconfig[id].url);
        } else if (usncjsconfig[id].target === "same_window") {
          window.parent.location.href = usncjsconfig[id].url;
        } else if (usncjsconfig[id].target === "modal") {
          jQuery(usncjsconfig[id].url).modal("show");
        }
      });
    }
	}
}