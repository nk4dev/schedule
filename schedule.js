document.addEventListener("DOMContentLoaded", () => {
                // URLパラメータの取得 (param.js で解析済み)
                const { title, dateStr, timeStr, addcaltype, from } = scheduleParams;

                // 画面表示用・生成用変数の初期化
                let displayDate = "未定";
                let displayTime = "終日";
                let isAllDay = true;

                // 各プラットフォーム用日時フォーマット
                let startStrICS = "";
                let endStrICS = "";
                let startStrGoogle = "";
                let endStrGoogle = "";
                let startStrOutlook = "";
                let endStrOutlook = "";

                // 日付のパース (YYYYMMDD形式を想定)
                if (dateStr && dateStr.length === 8) {
                    const y = dateStr.substring(0, 4);
                    const m = dateStr.substring(4, 6);
                    const d = dateStr.substring(6, 8);

                    displayDate = `${y}年${parseInt(m)}月${parseInt(d)}日`;

                    // 翌日の計算 (終日対応用)
                    const dateObj = new Date(
                        parseInt(y),
                        parseInt(m) - 1,
                        parseInt(d),
                    );
                    dateObj.setDate(dateObj.getDate() + 1);

                    const nextY = dateObj.getFullYear();
                    const nextM = String(dateObj.getMonth() + 1).padStart(
                        2,
                        "0",
                    );
                    const nextD = String(dateObj.getDate()).padStart(2, "0");
                    const nextDayDate = `${nextY}${nextM}${nextD}`;
                    const nextDayHyphen = `${nextY}-${nextM}-${nextD}`;

                    // 時間のパース (HHMM-HHMM形式を想定)
                    if (timeStr && timeStr.includes("-")) {
                        isAllDay = false;
                        const times = timeStr.split("-");
                        const sh = times[0].substring(0, 2);
                        const sm = times[0].substring(2, 4);
                        const eh = times[1].substring(0, 2);
                        const em = times[1].substring(2, 4);

                        displayTime = `${sh}:${sm} 〜 ${eh}:${em}`;

                        // ICS用 (タイムゾーン付きローカル時間)
                        startStrICS = `${dateStr}T${sh}${sm}00`;
                        endStrICS = `${dateStr}T${eh}${em}00`;

                        // Google用
                        startStrGoogle = startStrICS;
                        endStrGoogle = endStrICS;

                        // Outlook用 (YYYY-MM-DDTHH:mm:ss形式)
                        startStrOutlook = `${y}-${m}-${d}T${sh}:${sm}:00`;
                        endStrOutlook = `${y}-${m}-${d}T${eh}:${em}:00`;
                    } else {
                        isAllDay = true;
                        displayTime = "終日";

                        // 終日イベントの場合、終了日は「翌日」を指定する
                        startStrICS = dateStr;
                        endStrICS = nextDayDate;

                        startStrGoogle = dateStr;
                        endStrGoogle = nextDayDate;

                        startStrOutlook = `${y}-${m}-${d}`;
                        endStrOutlook = nextDayHyphen;
                    }
                } else {
                    displayDate = "日付指定なし（URLを確認してください）";
                }

                // 画面のDOM更新
                document.getElementById("event-title").textContent = title;
                document.getElementById("event-date").textContent = displayDate;
                document.getElementById("event-time").textContent = displayTime;

                // OGP動的更新 (LINEなどJSを実行するクローラー向け)
                const ogTitle = from ? `${title}（${from}さんより）` : title;
                const timeLabel = isAllDay ? "（終日）" : displayTime;
                const ogDesc = (from ? `${from}さんがカレンダーへの追加を依頼しています。` : "カレンダーへの予定追加依頼です。")
                    + `　📅 ${displayDate}　${timeLabel}`;

                const imageLines = [title, `${displayDate}　${timeLabel}`];
                if (from) imageLines.push(`${from}さんより`);
                const ogImageUrl = "https://ogp-img-gen.vercel.app/api/img-gen?text="
                    + encodeURIComponent(imageLines.join("\n"));

                document.title = ogTitle;
                const setMeta = (sel, val) => { const el = document.querySelector(sel); if (el) el.setAttribute("content", val); };
                setMeta('meta[property="og:title"]',       ogTitle);
                setMeta('meta[property="og:description"]', ogDesc);
                setMeta('meta[property="og:url"]',         window.location.href);
                setMeta('meta[property="og:image"]',       ogImageUrl);
                setMeta('meta[name="twitter:title"]',      ogTitle);
                setMeta('meta[name="twitter:description"]', ogDesc);
                setMeta('meta[name="twitter:image"]',      ogImageUrl);

                // 1. ICSファイルの動的生成・ダウンロード処理 (Apple / 汎用)
                const downloadICS = () => {
                    let icsContent =
                        "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//nknighta//Schedule//EN\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\n";
                    icsContent += "BEGIN:VEVENT\n";
                    icsContent += `UID:${Date.now()}@nknighta.me\n`;
                    icsContent += `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z\n`;

                    if (isAllDay) {
                        icsContent += `DTSTART;VALUE=DATE:${startStrICS}\n`;
                        icsContent += `DTEND;VALUE=DATE:${endStrICS}\n`;
                    } else {
                        icsContent += `DTSTART;TZID=Asia/Tokyo:${startStrICS}\n`;
                        icsContent += `DTEND;TZID=Asia/Tokyo:${endStrICS}\n`;
                    }

                    icsContent += `SUMMARY:${title}\n`;
                    // 改行は \n にエスケープして記述
                    icsContent +=
                        "DESCRIPTION:この予定は nknighta スケジュール共有ツールより登録されました。\\n\\n詳細はこちら: " +
                        window.location.href +
                        "\n";
                    icsContent += "END:VEVENT\nEND:VCALENDAR";

                    const blob = new Blob([icsContent], {
                        type: "text/calendar;charset=utf-8;",
                    });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.setAttribute("download", `${title}.ics`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                };

                // 2. GoogleカレンダーURLの生成 (エンコードによるバグを防ぐため手動結合)
                const googleDetails =
                    (from ? `${from}さんより共有された予定です。` : "nknighta スケジュール共有ツールより登録されました。") +
                    "\n\n共有URL: " + window.location.href;
                const googleUrl =
                    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
                    "&text=" +
                    encodeURIComponent(title) +
                    "&dates=" +
                    startStrGoogle +
                    "/" +
                    endStrGoogle +
                    (isAllDay ? "" : "&ctz=Asia/Tokyo") +
                    "&details=" +
                    encodeURIComponent(googleDetails);

                // 3. OutlookカレンダーURLの生成
                const outlookUrl =
                    "https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent" +
                    "&subject=" +
                    encodeURIComponent(title) +
                    "&startdt=" +
                    encodeURIComponent(startStrOutlook) +
                    "&enddt=" +
                    encodeURIComponent(endStrOutlook) +
                    (isAllDay ? "&allday=true" : "");

                // ボタンクリックイベントの設定
                document
                    .getElementById("btn-apple")
                    .addEventListener("click", downloadICS);

                document
                    .getElementById("btn-google")
                    .addEventListener("click", () => {
                        window.open(googleUrl, "_blank", "noopener,noreferrer");
                    });

                document
                    .getElementById("btn-outlook")
                    .addEventListener("click", () => {
                        window.open(
                            outlookUrl,
                            "_blank",
                            "noopener,noreferrer",
                        );
                    });

                // addcaltype=ics パラメータ指定時の自動ダウンロード処理
                if (addcaltype === "ics" && dateStr.length === 8) {
                    // 少しだけ遅延させてDOMの描画を優先する
                    setTimeout(() => {
                        downloadICS();
                        // メッセージをフェードイン表示
                        const msgEl =
                            document.getElementById("auto-dl-message");
                        msgEl.classList.remove("hidden");
                        msgEl.classList.add("animate-pulse");
                        setTimeout(
                            () => msgEl.classList.remove("animate-pulse"),
                            1500,
                        );
                    }, 500);
                }
            });
        