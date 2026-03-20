// Japanese/Western calendar converter
// ==============================
// 入力は「年 + 月 + 日」を使って元号/西暦を相互変換し、
// さらに結果に曜日（weekday）も表示します。


// ==============================

// 曜日（Western: Sun..Sat / Japanese: 日..土）
const WEEKDAY_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAY_JA = ['日', '月', '火', '水', '木', '金', '土'];

// 元号の開始日（この開始日以降の日付をその元号として扱います）
// 注意:
// - 月日があるため、元号境界（開始日/終了前日）を厳密に判定します。
// - 配列は「新しい元号 -> 古い元号」の順に並べています（探索を速くするため）。
const ERAS = [
  { id: 'Reiwa', ja: '令和', start: { y: 2019, m: 5, d: 1 } },
  { id: 'Heisei', ja: '平成', start: { y: 1989, m: 1, d: 8 } },
  { id: 'Showa', ja: '昭和', start: { y: 1926, m: 12, d: 25 } },
  { id: 'Taisho', ja: '大正', start: { y: 1912, m: 7, d: 30 } },
  { id: 'Meiji', ja: '明治', start: { y: 1868, m: 1, d: 25 } }
];

// UTC基準で Date を作る（ローカル時刻・タイムゾーンのズレによる曜日ズレを避ける）
function dateUTC(y, m, d) {
  return Date.UTC(y, m - 1, d);
}

// 入力された (y, m, d) が「実在するグレゴリオ暦の日付」かチェックします。
// 例えば 2024-02-30 のような存在しない日付は弾きます。
function isValidGregorianDate(y, m, d) {
  const dt = new Date(dateUTC(y, m, d));
  return dt.getUTCFullYear() === y && (dt.getUTCMonth() + 1) === m && dt.getUTCDate() === d;
}

// 曜日を返します（UTCで計算）
function getWeekday(y, m, d) {
  const dt = new Date(dateUTC(y, m, d));
  // getUTCDay は 0(Sun)〜6(Sat)
  const idx = dt.getUTCDay();
  return { en: WEEKDAY_EN[idx], ja: WEEKDAY_JA[idx] };
}

// 西暦（y,m,d）から、その日の元号を返します。
// - ERAS は新しい元号から並んでいるため、
//   「一番最初に start <= date を満たした元号」が答えになります。
function getEraForWesternDate(y, m, d) {
  const t = dateUTC(y, m, d);
  // 元号探索の流れ:
  // - ERAS は「新しい元号 -> 古い元号」の順で並べています
  // - そのため、先頭から見ていき「元号の開始日 <= 入力日」を最初に満たした元号が正解になります
  for (const era of ERAS) {
    const eraStart = dateUTC(era.start.y, era.start.m, era.start.d);
    if (t >= eraStart) return era;
  }
  return null;
}

// 元号の有効範囲を返します。
// - startTime は inclusive
// - endExclusive は exclusive（= 次の元号開始日の時刻）
// 例:
// - Reiwa は終わりがまだ設定しづらいので endExclusive=null として扱います。
function getEraRange(eraId) {
  const idx = ERAS.findIndex((e) => e.id === eraId);
  if (idx === -1) return null;
  const era = ERAS[idx];
  const startTime = dateUTC(era.start.y, era.start.m, era.start.d);
  // 次の元号の開始が無い（=配列先頭）の場合は null
  const endExclusive = idx === 0 ? null : dateUTC(ERAS[idx - 1].start.y, ERAS[idx - 1].start.m, ERAS[idx - 1].start.d);
  return { startTime, endExclusive };
}

// 月日入力は常時使用する（checkbox は廃止済み）

// =========================================================
// form1: seireki -> wareki
// =========================================================
const form1 = document.querySelector("#form1");
form1.addEventListener('submit', function(event) {
  event.preventDefault();

  // form1 の入力:
  // - #seireki: 西暦の年
  // - #month1/#day1: 月日（常に使用）
  let westernYear = parseInt(document.querySelector("#seireki").value);
  let htmlFormat;

  // year が数値でない場合はエラー表示
  if (isNaN(westernYear)) {
    htmlFormat = "<i class='fa fa-exclamation-circle fa-red' aria-hidden='true'></i> Please type the year you want to convert.";
    document.getElementById("result").innerHTML = "<p>" + htmlFormat + "</p>";
    document.querySelector("#seireki").value = '';
    return;
  }

  // 月日を取得
  const month = parseInt(document.getElementById('month1').value);
  const day = parseInt(document.getElementById('day1').value);
  if (isNaN(month) || isNaN(day)) {
    htmlFormat = "<i class='fa fa-exclamation-circle fa-red' aria-hidden='true'></i> Please type month (1-12) and date (1-31).";
    document.getElementById("result").innerHTML = "<p>" + htmlFormat + "</p>";
    return;
  }

  // 入力された日付が「実在」するかチェック（例: 2/30 は無効）
  if (!isValidGregorianDate(westernYear, month, day)) {
    htmlFormat = "<i class='fa fa-exclamation-circle fa-red' aria-hidden='true'></i> That date is not a valid Gregorian date.";
    document.getElementById("result").innerHTML = "<p>" + htmlFormat + "</p>";
    return;
  }

  // 元号（era）を日付境界から確定
  const era = getEraForWesternDate(westernYear, month, day);
  if (!era) {
    htmlFormat = "<i class='fa fa-exclamation-circle fa-red' aria-hidden='true'></i> Are you immortal? Please type later than 1868-01-25 (Meiji 1).";
    document.getElementById("result").innerHTML = "<p>" + htmlFormat + "</p>";
    return;
  }

  // 元号年（eraYear）は「その元号の開始年からの差 + 1」
  // 例: Reiwa(2019/5/1開始) で 2019/5/2 → eraYear=1
  const eraYear = westernYear - era.start.y + 1;

  // 曜日は UTC基準で計算した day-of-week を表示
  const weekday = getWeekday(westernYear, month, day);
  htmlFormat =
    "<i class='fa fa-check-circle fa-green' aria-hidden='true'></i> " +
    westernYear + "年" + month + "月" + day + "日は" +
    era.id + "(" + era.ja + ") " + eraYear + "年" + month + "月" + day + "日" +
    "<br><small>曜日: " + weekday.ja + " (" + weekday.en + ")</small>" +
    "<br><small><a href='https://en.wikipedia.org/wiki/" + westernYear + "'>What happened this year?</a></small>";

  document.getElementById("result").innerHTML = "<p>" + htmlFormat + "</p>";

  // clear inputs after submit（入力欄を空にして次の計算へ備える）
  document.querySelector("#seireki").value = '';
  document.getElementById('month1').value = '';
  document.getElementById('day1').value = '';
});

// =========================================================
// form2: wareki -> seireki
// =========================================================
const form2 = document.querySelector('#form2');
form2.addEventListener('submit', function(event) {
  event.preventDefault();

  // form2 の入力:
  // - #nengou1: 元号（Reiwa/Heisei/...）
  // - #wareki: 元号年（例: Reiwa 3）
  // - #month2/#day2: 月日（常に使用）
  const eraId = document.getElementById("nengou1").value;
  let eraYear = parseInt(document.querySelector("#wareki").value);
  let s;

  // 元号年が数値でない場合はエラー表示
  if (isNaN(eraYear)) {
    s = "<i class='fa fa-exclamation-circle fa-red' aria-hidden='true'></i> Please type the Japanese year you want to convert.";
    document.getElementById("result").innerHTML = "<p>" + s + "</p>";
    document.querySelector("#wareki").value = '';
    return;
  }

  // 元号IDから ERAS の定義を引く
  const era = ERAS.find((e) => e.id === eraId);
  if (!era) {
    s = "<i class='fa fa-exclamation-circle fa-red' aria-hidden='true'></i> Please select Japanese era.";
    document.getElementById("result").innerHTML = "<p>" + s + "</p>";
    return;
  }

  // 月日を取得して、該当する「西暦の日付」と「曜日」を計算する
  const month = parseInt(document.getElementById('month2').value);
  const day = parseInt(document.getElementById('day2').value);
  if (isNaN(month) || isNaN(day)) {
    s = "<i class='fa fa-exclamation-circle fa-red' aria-hidden='true'></i> Please type month (1-12) and date (1-31).";
    document.getElementById("result").innerHTML = "<p>" + s + "</p>";
    return;
  }

  // 変換の考え方（和暦 -> 西暦）:
  // - 元号年（eraYear）を元号開始日からの差分として扱い、
  //   西暦年（westernYear）を計算します
  // - 例: Reiwa 1年（令和元年）= 2019年
  // - ただし「月日が元号の開始前か/開始後か」は月日を含めて後段の境界チェックで確定します
  const westernYear = era.start.y + (eraYear - 1);

  // 入力した (westernYear, month, day) が実在する日付かチェック
  if (!isValidGregorianDate(westernYear, month, day)) {
    s = "<i class='fa fa-exclamation-circle fa-red' aria-hidden='true'></i> That date is not a valid Gregorian date.";
    document.getElementById("result").innerHTML = "<p>" + s + "</p>";
    return;
  }

  // 元号の有効範囲（開始 inclusive / 終了 exclusive）に入っているか確認
  // これにより、例えば「Reiwa 1年」でも開始前の日付は弾けます。
  const range = getEraRange(eraId);
  const t = dateUTC(westernYear, month, day);
  if (!(t >= range.startTime && (range.endExclusive === null || t < range.endExclusive))) {
    s = "<i class='fa fa-exclamation-circle fa-red' aria-hidden='true'></i> That month/date does not exist in " + eraId + " " + eraYear + "年.";
    document.getElementById("result").innerHTML = "<p>" + s + "</p>";
    return;
  }

  // 曜日は「境界チェックを通った」確定した西暦（y,m,d）で計算
  const weekday = getWeekday(westernYear, month, day);
  s =
    "<i class='fa fa-check-circle fa-green' aria-hidden='true'></i> " +
    eraId + "(" + era.ja + ") " + eraYear + "年" + month + "月" + day + "日" +
    " is " +
    westernYear + "年" + month + "月" + day + "日" +
    "<br><small>曜日: " + weekday.ja + " (" + weekday.en + ")</small>" +
    "<br><small><a href='https://en.wikipedia.org/wiki/" + westernYear + "'>What happened this year?</a></small>";

  // show Western year
  document.getElementById("result").innerHTML = "<p>" + s + "</p>";

  // empty input values after submit
  document.querySelector("#wareki").value = '';
  document.getElementById('month2').value = '';
  document.getElementById('day2').value = '';
});
