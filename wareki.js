window.onload = function() {


  document.getElementById("convert1").onclick = function() {
    var y = document.getElementById("seireki").value;
    y = parseInt(y); // Pick only number
    // If it's blank
    if (isNaN(y)) {
      s = "<i class='fa fa-exclamation-circle fa-red' aria-hidden='true'></i> Please type the year you want to convert.";
    } else if (y > 1988) {
      s = "<i class='fa fa-check-circle fa-green' aria-hidden='true'></i> " + y + " is Heisei(平成) " + (y - 1988) + "<br><small><a href='https://en.wikipedia.org/wiki/" + y + "'>" + "What happened this year?</a></small>";
    } else if (y > 1925) {
      s = "<i class='fa fa-check-circle fa-green' aria-hidden='true'></i> " + y + " is Showa(昭和) " + (y - 1925) + "<br><small><a href='https://en.wikipedia.org/wiki/" + y + "'>" + "What happened this year?</a></small>";
    } else if (y > 1911) {
      s = "<i class='fa fa-check-circle fa-green' aria-hidden='true'></i> " + y + " is Taisho(大正) " + (y - 1911) + "<br><small><a href='https://en.wikipedia.org/wiki/" + y + "'>" + "What happened this year?</a></small>";
    } else if (y > 1867) {
      s = "<i class='fa fa-check-circle fa-green' aria-hidden='true'></i> " + y + " is Meiji(明治) " + (y - 1867) + "<br><small><a href='https://en.wikipedia.org/wiki/" + y + "'>" + "What happened this year?</a></small>";
    } else {
      s = "<i class='fa fa-exclamation-circle fa-red' aria-hidden='true'></i> Are you immortal? Please type later than 1868 (Meiji 1).";
    }
    // show Japanese year
    document.getElementById("result").innerHTML = "<p>" + s + "</p>";
  }

  document.getElementById("convert2").onclick = function() {
    var n = document.getElementById("nengou1").value;
    var y = document.getElementById("wareki1").value;
    y = parseInt(y);
    if (isNaN(y)) {
      s = "<i class='fa fa-exclamation-circle fa-red' aria-hidden='true'></i> Please type the Japanese year you want to covert.";
    } else if ((n == "Heisei") && (y > 0)) {
      s = "<i class='fa fa-check-circle fa-green' aria-hidden='true'></i> " + n + " " + y + " is " + (y + 1988) + "<br><small><a href='https://en.wikipedia.org/wiki/" + (y + 1988) + "'>What happened this year?</a></small>";
    } else if ((n == "Showa") && (y > 0) && (y <= 64)) {
      s = "<i class='fa fa-check-circle fa-green' aria-hidden='true'></i> " + n + " " + y + " is " + (y + 1925) + "<br><small><a href='https://en.wikipedia.org/wiki/" + (y + 1925) + "'>What happened this year?</a></small>";
    } else if ((n == "Taisho") && (y > 0) && (y <= 15)) {
      s = "<i class='fa fa-check-circle fa-green' aria-hidden='true'></i> " + n + " " + y + " is " + (y + 1911 + "<br><small><a href='https://en.wikipedia.org/wiki/" + (y + 1911) + "'>What happened this year?</a></small>");
    } else if ((n == "Meiji") && (y > 0) && (y <= 45)) {
      s = "<i class='fa fa-check-circle fa-green' aria-hidden='true'></i> " + n + " " + y + " is " + (y + 1867) + "<br><small><a href='https://en.wikipedia.org/wiki/" + (y + 1867) + "'>What happened this year?</a></small>";
    } else {
      s = "<i class='fa fa-exclamation-circle fa-red' aria-hidden='true'></i> Does not exit...";
    }
    document.getElementById("result").innerHTML = "<p>" + s + "</p>";
  }

}
