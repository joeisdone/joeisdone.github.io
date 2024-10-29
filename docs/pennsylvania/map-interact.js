function isTouchEnabled() {
  return (("ontouchstart" in window)
    || (navigator.MaxTouchPoints > 0)
    || (navigator.msMaxTouchPoints > 0));
}
jQuery(function () {
  jQuery("path").each(function (i, e) {
    id = jQuery(e).attr("id")
    if (!usfljsconfig[id]) {
      console.log("wtffff: " + id);
      return;
    }
    usfladdEvent( jQuery(e).attr("id"));
  });
});
function usfladdEvent(id,relationId) {
  var _obj = jQuery("#" + id);
  var arr = id.split("");
  var _Textobj = jQuery("#" + id + "," + "#usfljsvn" + arr.slice(6).join(""));
  jQuery("#" + ["visnames"]).attr({"fill":usfljsconfig.general.visibleNames});
  _obj.attr({"fill":usfljsconfig[id].upColor, "stroke":usfljsconfig.general.borderColor});
  _Textobj.attr({"cursor": "default"});
  if (usfljsconfig[id].active === true) {
    _Textobj.attr({"cursor": "pointer"});
    _Textobj.hover(function () {
      jQuery("#usfljstip").show().html(usfljsconfig[id].hover);
      _obj.css({"fill":usfljsconfig[id].overColor});
    }, function () {
      jQuery("#usfljstip").hide();
      jQuery("#" + id).css({"fill":usfljsconfig[id].upColor});
    });
    if (usfljsconfig[id].target !== "none") {
      _Textobj.mousedown(function () {
        jQuery("#" + id).css({"fill":usfljsconfig[id].downColor});
      });
    }
    _Textobj.mouseup(function () {
      jQuery("#" + id).css({"fill":usfljsconfig[id].overColor});
      if (usfljsconfig[id].target === "new_window") {
        window.open(usfljsconfig[id].url);	
      } else if (usfljsconfig[id].target === "same_window") {
        window.parent.location.href = usfljsconfig[id].url;
      } else if (usfljsconfig[id].target === "modal") {
        jQuery(usfljsconfig[id].url).modal("show");
      }
    });
    _Textobj.mousemove(function (e) {
      var x = e.pageX + 10, y = e.pageY + 15;
      var tipw =jQuery("#usfljstip").outerWidth(), tiph =jQuery("#usfljstip").outerHeight(),
      x = (x + tipw >jQuery(document).scrollLeft() +jQuery(window).width())? x - tipw - (20 * 2) : x ;
      y = (y + tiph >jQuery(document).scrollTop() +jQuery(window).height())? jQuery(document).scrollTop() +jQuery(window).height() - tiph - 10 : y ;
      jQuery("#usfljstip").css({left: x, top: y});
    });
    if (isTouchEnabled()) {
      _Textobj.on("touchstart", function (e) {
        var touch = e.originalEvent.touches[0];
        var x = touch.pageX + 10, y = touch.pageY + 15;
        var tipw =jQuery("#usfljstip").outerWidth(), tiph =jQuery("#usfljstip").outerHeight(),
        x = (x + tipw >jQuery(document).scrollLeft() +jQuery(window).width())? x - tipw -(20 * 2) : x ;
        y =(y + tiph >jQuery(document).scrollTop() +jQuery(window).height())? jQuery(document).scrollTop() +jQuery(window).height() -tiph - 10 : y ;
        jQuery("#" + id).css({"fill":usfljsconfig[id].downColor});
        jQuery("#usfljstip").show().html(usfljsconfig[id].hover);
        jQuery("#usfljstip").css({left: x, top: y});
      });
      _Textobj.on("touchend", function () {
        jQuery("#" + id).css({"fill":usfljsconfig[id].upColor});
        if (usfljsconfig[id].target === "new_window") {
          window.open(usfljsconfig[id].url);
        } else if (usfljsconfig[id].target === "same_window") {
          window.parent.location.href = usfljsconfig[id].url;
        } else if (usfljsconfig[id].target === "modal") {
          jQuery(usfljsconfig[id].url).modal("show");
        }
      });
    }
	}
}