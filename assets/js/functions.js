
// Sort object by keys... 
function sortByKeys(obj) {
  items = Object.keys(obj).map(function (key) {
    return [key, obj[key]];
  });
  items.sort(function (first, second) {
    return second[1] - first[1];
  });
  sorted_obj = {}
  $.each(items, function (k, v) {
    use_key = v[0]
    use_value = v[1]
    sorted_obj[use_key] = use_value
  })
  return (sorted_obj)
}

function pctToString(pct) {
  return Number(pct).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2 });
}

// Get numerator from county given type
// Possible types are: 
// NPA -> No Party
// TOTAL -> Total
// REP -> Republican
// DEM -> Democrat
function getNumerator(party) {
  var lookup = {};
  $.each(liveData, function (k, v) {
    if (k === "TIMESTAMP") return;
    if (party in v && methodType in v[party]) {
      lookup[k] = v[party][methodType];
    } else {
      console.log("No party - " + k + " " + party + " " + methodType);
    }
  });

  return lookup;
}

function resetHover() {
  const defaultColor = "#FFFFF3";
  $.each(counties, function (county, myid) {
    usfljsconfig[myid].hover = county;
    usfljsconfig[myid].upColor = defaultColor;
    usfljsconfig[myid].downColor = defaultColor;
    $('#' + myid).attr({ fill: defaultColor });
  });
}

function getPercentages(numeratorType, denominatorType) {
  resetHover();
  numerators = getNumerator(numeratorType);
  denominators = getDenominator(denominatorType);
  results = {};

  $.each(numerators, function (k, v) {
    if (!(k in denominators)) {
      console.log(k + " not found for " + numeratorType + " " + denominatorType);
      return;
    }
    numerator = v;
    denominator = denominators[k];
    if (denominator && denominator > 0.0) {
      results[k] = (numerator + 0.0) / (denominator + 0.0);
      setHover(k, numeratorType, numerator, denominatorType, denominator, results[k]);
    } else {
      console.log(k + " is invalid for " + numeratorType + " " + denominatorType);
    }
  });

  return results;
}

function colorGradient(party, results) {
  var gradient = [];
  if (party === "REP") {
    gradient = redGradient;
  } else if (party === "DEM") {
    gradient = blueGradient;
  } else if (party === "NPA") {
    gradient = greenGradient;
  } else if (party === "TOTAL") {
    gradient = yellowGradient;
  } else {
    console.log("Unknown party: " + party);
    return;
  }

  numColors = gradient.length;
  sortedObj = sortByKeys(results);
  var validCount = 0;

  $.each(sortedObj, function (k, v) {
    if (k in counties) {
      validCount += 1;
    }
  });
  const step = ((validCount + 0.0) / (numColors + 0.0));
  var index = 0;
  $.each(sortedObj, function (k, v) {
    if (k in counties) {
      const bracket = Math.floor((index + 0.0) / step);
      index = index + 1;
      const myColor = gradient[bracket];
      const myid = counties[k];
      usfljsconfig[myid].upColor = myColor;
      usfljsconfig[myid].downColor = myColor;
      $('#' + myid).attr({ fill: myColor });
      //console.log("Colored " + k + " " + myid);
    }
  });
}

function cannibalizationBlurb(party) {
  return "";
}

function getTotalWithFallback(data, party, methodType) {
  // const npaCountyLevel = data['NPA'][methodType] || 0;
  if (!data) return 0;
  if (!data[party]) return 0;
  if (!data[party][methodType]) return 0;
  return data[party][methodType];
}

function formatNumber(num) {
  if (num == null)
    return 'NaN';
  return num.toLocaleString();
}

function getSplitColor(rPercent, dPercent) {
  var difference = rPercent - dPercent;
  if (difference > 0.40) {
    return '#cc0000'; // dark red
  } else if (difference > 0.25) {
    return '#ff0000'; // bright red
  } else if (difference > 0.10) {
    return '#ff8080'; // pinkish red
  } else if (difference > 0.05) {
    return '#ffb3b3'; // pinky
  } else if (difference >= 0.00) {
    return '#ffe6e6'; // light pink
  } else if (difference > -0.05) {
    return '#e6e6ff'; // light blue
  } else if (difference > -0.10) {
    return '#8080ff'; // less light blue
  } else if (difference > -0.25) {
    return '#4d4dff'; // medium blue
  } else if (difference > -0.40) {
    return '#0000ff'; // bright blue
  } else {
    return '#0000cc'; // dark blue
  }
}

function getSplitAdvantageColor(gap) {
  const difference = gap * -1.0;
  if (difference > 0.07) {
    return '#cc0000'; // dark red
  } else if (difference > 0.10) {
    return '#ff0000'; // bright red
  } else if (difference > 0.05) {
    return '#ff8080'; // pinkish red
  } else if (difference > 0.02) {
    return '#ffb3b3'; // pinky
  } else if (difference >= 0.01) {
    return '#ffe6e6'; // light pink
  } else if (difference >= 0.0) {
    return '#ffffe0';
  } else if (difference > -0.01) {
    return '#fffdd0'; // cream
  } else if (difference > -0.02) {
    return '#e6e6ff'; // light blue
  } else if (difference > -0.05) {
    return '#8080ff'; // medium blue
  } else if (difference > -0.10) {
    return '#0000ff'; // bright blue
  } else {
    return '#0000cc'; // dark blue
  }
}

