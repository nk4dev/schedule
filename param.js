// URLクエリパラメータを解析してグローバルに公開する
const scheduleParams = (() => {
  const p = new URLSearchParams(window.location.search);
  return {
    title:      p.get("title")      || "新規予定",
    dateStr:    p.get("date")       || "",
    timeStr:    p.get("time")       || "",
    addcaltype: p.get("addcaltype") || "",
    from:       p.get("from")       || "",
  };
})();
