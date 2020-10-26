var pins_config = {
  "pins":[
  ]
};

// The following is the script for pins interaction DON'T EDIT !!!
function isTouchEnabled() {
  return (("ontouchstart" in window)
    || (navigator.MaxTouchPoints > 0)
    || (navigator.msMaxTouchPoints > 0));
}
jQuery(function () {
  var pins_len = pins_config.pins.length;
  if(pins_len > 0) {
    var xmlns = "http://www.w3.org/2000/svg";
    var tsvg_obj = document.getElementById("usncjspins");
    var svg_circle, svg_rect;
    for (var i = 0; i < pins_len; i++) {
      if (pins_config.pins[i].shape === "circle") {
        svg_circle = document.createElementNS(xmlns, "circle");
        svg_circle.setAttributeNS(null, "cx", pins_config.pins[i].pos_X + 1);
        svg_circle.setAttributeNS(null, "cy", pins_config.pins[i].pos_Y + 1);
        svg_circle.setAttributeNS(null, "r", pins_config.pins[i].size / 2);
        svg_circle.setAttributeNS(null, "fill", "rgba(0, 0, 0, 0.5)");
        tsvg_obj.appendChild(svg_circle);
        svg_circle = document.createElementNS(xmlns, "circle");
        svg_circle.setAttributeNS(null, "cx", pins_config.pins[i].pos_X);
        svg_circle.setAttributeNS(null, "cy", pins_config.pins[i].pos_Y);
        svg_circle.setAttributeNS(null, "r", pins_config.pins[i].size / 2);
        svg_circle.setAttributeNS(null, "fill", pins_config.pins[i].upColor);
        svg_circle.setAttributeNS(null, "stroke", pins_config.pins[i].outline);
        svg_circle.setAttributeNS(null, "stroke-width", 1);
        svg_circle.setAttributeNS(null, "id", "usncjspins_" + i);
        tsvg_obj.appendChild(svg_circle);
        usncjsAddEvent(i);
      }
      else if (pins_config.pins[i].shape === "square") {
        svg_rect = document.createElementNS(xmlns, "rect");
        svg_rect.setAttributeNS(null, "x", pins_config.pins[i].pos_X - pins_config.pins[i].size / 2 + 1);
        svg_rect.setAttributeNS(null, "y", pins_config.pins[i].pos_Y - pins_config.pins[i].size / 2 + 1);
        svg_rect.setAttributeNS(null, "width", pins_config.pins[i].size);
        svg_rect.setAttributeNS(null, "height", pins_config.pins[i].size);
        svg_rect.setAttributeNS(null, "fill", "rgba(0, 0, 0, 0.5)");
        tsvg_obj.appendChild(svg_rect);
        svg_rect = document.createElementNS(xmlns, "rect");
        svg_rect.setAttributeNS(null, "x", pins_config.pins[i].pos_X - pins_config.pins[i].size / 2);
        svg_rect.setAttributeNS(null, "y", pins_config.pins[i].pos_Y - pins_config.pins[i].size / 2);
        svg_rect.setAttributeNS(null, "width", pins_config.pins[i].size);
        svg_rect.setAttributeNS(null, "height", pins_config.pins[i].size);
        svg_rect.setAttributeNS(null, "fill", pins_config.pins[i].upColor);
        svg_rect.setAttributeNS(null, "stroke", pins_config.pins[i].outline);
        svg_rect.setAttributeNS(null, "stroke-width", 1);
        svg_rect.setAttributeNS(null, "id", "usncjspins_" + i);
        tsvg_obj.appendChild(svg_rect);
        usncjsAddEvent(i);
      }
    }
  }
});
function usncjsAddEvent(id) {
  var obj = jQuery("#usncjspins_" + id);
  if(pins_config.pins[id].active === true){
    obj.attr({"cursor": "pointer"});
    obj.hover(function () {
      jQuery("#usncjstip").show().html(pins_config.pins[id].hover);
      obj.css({"fill":pins_config.pins[id].overColor});
    }, function () {
      jQuery("#usncjstip").hide();
      obj.css({"fill":pins_config.pins[id].upColor});
    });
    obj.mouseup(function(){
      obj.css({"fill":pins_config.pins[id].overColor});
      if (pins_config.pins[id].target === "new_window"){
        window.open(pins_config.pins[id].url);  
      } else if (pins_config.pins[id].target === "same_window") {
        window.parent.location.href = pins_config.pins[id].url;
      } else if (pins_config.pins[id].target === "modal") {
        jQuery(pins_config.pins[id].url).modal("show");
      }
    });
    obj.mousemove(function (e) {
      var x = e.pageX + 10, y = e.pageY + 15;
      var tipw =jQuery("#usncjstip").outerWidth(), tiph =jQuery("#usncjstip").outerHeight(),
      x = (x + tipw >jQuery(document).scrollLeft() +jQuery(window).width())? x - tipw - (20 * 2) : x ;
      y = (y + tiph >jQuery(document).scrollTop() +jQuery(window).height())? jQuery(document).scrollTop() +jQuery(window).height() - tiph - 10 : y ;
      jQuery("#usncjstip").css({left: x, top: y});
    });
    if (isTouchEnabled()) {
      obj.on("touchstart", function (e) {
        var touch = e.originalEvent.touches[0];
        var x = touch.pageX + 10, y = touch.pageY + 15;
        var tipw=jQuery("#usncjstip").outerWidth(), tiph=jQuery("#usncjstip").outerHeight(),
        x = (x + tipw >jQuery(document).scrollLeft() +jQuery(window).width())? x - tipw -(20 * 2) : x ;
        y =(y + tiph >jQuery(document).scrollTop() +jQuery(window).height())? jQuery(document).scrollTop() +jQuery(window).height() -tiph - 10 : y ;
        jQuery("#usncjstip").show().html(pins_config.pins[id].hover);
        jQuery("#usncjstip").css({left:x, top:y});
      });
      obj.on("touchend", function () {
        jQuery("#" + id).css({"fill":pins_config.pins[id].upColor});
        if (pins_config.pins[id].target === "new_window") {
          window.open(pins_config.pins[id].url);
        } else if (pins_config.pins[id].target === "same_window") {
          window.parent.location.href = pins_config.pins[id].url;
        } else if (pins_config.pins[id].target === "modal") {
          jQuery(pins_config.pins[id].url).modal("show");
        }
      });
    }
  }
}