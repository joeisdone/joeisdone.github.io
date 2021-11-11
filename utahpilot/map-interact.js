function isTouchEnabled() {
  return (("ontouchstart" in window)
    || (navigator.MaxTouchPoints > 0)
    || (navigator.msMaxTouchPoints > 0));
}
jQuery(function () {
  jQuery("polygon[id^=uswijs]").each(function (i, e) {
    uswiaddEvent( jQuery(e).attr("id"));
  });
});
function uswiaddEvent(id,relationId) {
  if (!uswijsconfig[id]) return;
  var _obj = jQuery("#" + id);
  var arr = id.split("");
  var _Textobj = jQuery("#" + id + "," + "#uswijsvn" + arr.slice(6).join(""));
  
  jQuery("#" + ["visnames"]).attr({"fill":uswijsconfig.general.visibleNames});
  
  const borderColor = uswijsconfig["general"].borderColor;
  console.log(borderColor);
  _obj.attr({"fill":uswijsconfig[id].upColor, "stroke": borderColor, "stroke-width": 0.0005});
  _Textobj.attr({"cursor": "default"});
  
  if (uswijsconfig[id].active === true) {
    _Textobj.attr({"cursor": "pointer"});
    _Textobj.hover(function () {
      jQuery("#uswijstip").show().html(uswijsconfig[id].hover);
      _obj.css({"fill":uswijsconfig[id].overColor});
    }, function () {
      jQuery("#uswijstip").hide();
      jQuery("#" + id).css({"fill":uswijsconfig[id].upColor});
    });
    if (uswijsconfig[id].target !== "none") {
      _Textobj.mousedown(function () {
        jQuery("#" + id).css({"fill":uswijsconfig[id].downColor});
      });
    }
    _Textobj.mouseup(function () {
      jQuery("#" + id).css({"fill":uswijsconfig[id].overColor});
      if (uswijsconfig[id].target === "new_window") {
        window.open(uswijsconfig[id].url);	
      } else if (uswijsconfig[id].target === "same_window") {
        window.parent.location.href = uswijsconfig[id].url;
      } else if (uswijsconfig[id].target === "modal") {
        jQuery(uswijsconfig[id].url).modal("show");
      }
    });
    _Textobj.mousemove(function (e) {
      var x = e.pageX + 10, y = e.pageY + 15;
      var tipw =jQuery("#uswijstip").outerWidth(), tiph =jQuery("#uswijstip").outerHeight(),
      x = (x + tipw >jQuery(document).scrollLeft() +jQuery(window).width())? x - tipw - (20 * 2) : x ;
      y = (y + tiph >jQuery(document).scrollTop() +jQuery(window).height())? jQuery(document).scrollTop() +jQuery(window).height() - tiph - 10 : y ;
      jQuery("#uswijstip").css({left: x, top: y});
    });
    if (isTouchEnabled()) {
      _Textobj.on("touchstart", function (e) {
        var touch = e.originalEvent.touches[0];
        var x = touch.pageX + 10, y = touch.pageY + 15;
        var tipw =jQuery("#uswijstip").outerWidth(), tiph =jQuery("#uswijstip").outerHeight(),
        x = (x + tipw >jQuery(document).scrollLeft() +jQuery(window).width())? x - tipw -(20 * 2) : x ;
        y =(y + tiph >jQuery(document).scrollTop() +jQuery(window).height())? jQuery(document).scrollTop() +jQuery(window).height() -tiph - 10 : y ;
        jQuery("#" + id).css({"fill":uswijsconfig[id].downColor});
        jQuery("#uswijstip").show().html(uswijsconfig[id].hover);
        jQuery("#uswijstip").css({left: x, top: y});
      });
      _Textobj.on("touchend", function () {
        jQuery("#" + id).css({"fill":uswijsconfig[id].upColor});
        if (uswijsconfig[id].target === "new_window") {
          window.open(uswijsconfig[id].url);
        } else if (uswijsconfig[id].target === "same_window") {
          window.parent.location.href = uswijsconfig[id].url;
        } else if (uswijsconfig[id].target === "modal") {
          jQuery(uswijsconfig[id].url).modal("show");
        }
      });
    }
	}
}