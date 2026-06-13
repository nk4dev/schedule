// 現在のイベントタイプ管理 ('allday' または 'timespec')
    let currentEventType = 'allday';
    // 現在アクティブな結果表示タブ ('google' または 'share')
    let currentResultTab = 'google';

    // モーダルを開く関数
    function openModal() {
      const modal = document.getElementById('resultModal');
      modal.classList.add('modal-open');
      document.body.style.overflow = 'hidden'; // モーダル表示中は背後のスクロールを防ぐ
    }

    // モーダルを閉じる関数
    function closeModal() {
      const modal = document.getElementById('resultModal');
      modal.classList.remove('modal-open');
      document.body.style.overflow = ''; // スクロール制限を解除
    }

    // キーボードの Esc キーでモーダルを閉じられるようにする
    window.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeModal();
      }
    });

    // 切り替え処理
    function setEventType(type) {
      currentEventType = type;
      const btnAllDay = document.getElementById('btnAllDay');
      const btnTimeSpec = document.getElementById('btnTimeSpec');
      const alldaySection = document.getElementById('alldaySection');
      const timeSpecSection = document.getElementById('timeSpecSection');

      if (type === 'allday') {
        btnAllDay.className = "py-2.5 rounded-lg text-sm font-semibold transition duration-200 bg-white text-blue-600 shadow-sm";
        btnTimeSpec.className = "py-2.5 rounded-lg text-sm font-semibold transition duration-200 text-gray-600 hover:text-gray-800";
        alldaySection.classList.remove('hidden');
        timeSpecSection.classList.add('hidden');
      } else {
        btnAllDay.className = "py-2.5 rounded-lg text-sm font-semibold transition duration-200 text-gray-600 hover:text-gray-800";
        btnTimeSpec.className = "py-2.5 rounded-lg text-sm font-semibold transition duration-200 bg-white text-blue-600 shadow-sm";
        alldaySection.classList.add('hidden');
        timeSpecSection.classList.remove('hidden');
      }
    }

    // 結果エリアのタブ切り替え
    function switchResultTab(tab) {
      currentResultTab = tab;
      const btnGoogle = document.getElementById('btnTabGoogle');
      const btnShare = document.getElementById('btnTabShare');
      const contentGoogle = document.getElementById('contentGoogle');
      const contentShare = document.getElementById('contentShare');

      if (tab === 'google') {
        btnGoogle.className = "py-2.5 text-xs md:text-sm font-bold rounded-lg transition-all duration-200 bg-white text-blue-600 shadow-sm flex items-center justify-center space-x-1";
        btnShare.className = "py-2.5 text-xs md:text-sm font-bold rounded-lg transition-all duration-200 text-gray-600 hover:text-gray-800 flex items-center justify-center space-x-1";
        contentGoogle.classList.remove('hidden');
        contentShare.classList.add('hidden');
      } else {
        btnGoogle.className = "py-2.5 text-xs md:text-sm font-bold rounded-lg transition-all duration-200 text-gray-600 hover:text-gray-800 flex items-center justify-center space-x-1";
        btnShare.className = "py-2.5 text-xs md:text-sm font-bold rounded-lg transition-all duration-200 bg-white text-purple-600 shadow-sm flex items-center justify-center space-x-1";
        contentGoogle.classList.add('hidden');
        contentShare.classList.remove('hidden');
      }
    }

    // コピー完了トースト表示機能
    function showToast(message) {
      const toast = document.getElementById('toast');
      const toastMsg = document.getElementById('toastMessage');
      toastMsg.textContent = message;
      toast.classList.remove('opacity-0', 'translate-y-[-20px]');
      toast.classList.add('opacity-100', 'translate-y-0');
      
      setTimeout(() => {
        toast.classList.remove('opacity-100', 'translate-y-0');
        toast.classList.add('opacity-0', 'translate-y-[-20px]');
      }, 2000);
    }

    // 指定されたA要素のhref属性値をクリップボードにコピー
    function copyLink(elementId) {
      const linkEl = document.getElementById(elementId);
      if (!linkEl) return;
      
      const textToCopy = linkEl.href;
      
      // Iframe環境等でも動作するようダミーinput方式を採用
      const tempInput = document.createElement("input");
      tempInput.value = textToCopy;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      
      showToast("リンクをクリップボードにコピーしました！");
    }

    // 動的にGoogleカレンダー風のアイコンをSVG(Base64)として生成する関数 (iOSのSafari対応)
    function getGoogleCalendarLogo(day) {
      const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="100" height="100">
  <rect x="2" y="2" width="44" height="44" rx="9" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
  <path d="M2 11 c0-4.9 4.1-9 9-9 h26 c4.9 0 9 4.1 9 9 v6 H2 z" fill="#4285F4" />
  <circle cx="12" cy="10" r="2.5" fill="#ffffff" />
  <circle cx="36" cy="10" r="2.5" fill="#ffffff" />
  <text x="24" y="34" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="19" font-weight="bold" fill="#4285F4" text-anchor="middle" dominant-baseline="middle">${day}</text>
</svg>
`;
      // スマホのCanvasバグ・セキュリティ汚染防止のため完全にBase64化する
      return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
    }

    // 共有アイコン付きの動的ロゴ（ICS配信用）を生成する関数 (iOSのSafari対応)
    function getShareLogo(day) {
      const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="100" height="100">
  <rect x="2" y="2" width="44" height="44" rx="9" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
  <path d="M2 11 c0-4.9 4.1-9 9-9 h26 c4.9 0 9 4.1 9 9 v6 H2 z" fill="#9333ea" />
  <path d="M28 22v-3l7 4.5-7 4.5v-3c-5 0-8 1.5-10 5 1-5 4-10 10-10z" fill="#ffffff" stroke="#ffffff" stroke-width="1"/>
  <text x="24" y="37" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="12" font-weight="bold" fill="#9333ea" text-anchor="middle" dominant-baseline="middle">${day}日予定</text>
</svg>
`;
      return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
    }

    // フォームの送信時イベント
    document.getElementById('scheduleForm').addEventListener('submit', function(e) {
      e.preventDefault();

      // 1. 各種インプットのバリュー取得
      const title    = document.getElementById('eventTitle').value;
      const fromName = document.getElementById('fromName').value.trim();
      const timezone = document.getElementById('timezone').value;
      const optAutoIcs = document.getElementById('optAutoIcs').checked;
      let startStr = "";
      let endStr = "";
      let renderDay = 1; // QRカレンダーロゴに描画する日付

      // 共有用URL用パラメータ作成用変数
      let shareDateParam = "";
      let shareTimeParam = "";

      if (currentEventType === 'allday') {
        const alldayDate = document.getElementById('alldayDate').value;
        if (!alldayDate) return;

        // 終日イベントの場合、Googleカレンダーでは終了日を「+1日」にする必要がある
        const [year, month, day] = alldayDate.split('-').map(Number);
        const startDate = new Date(year, month - 1, day);
        const endDate = new Date(year, month - 1, day + 1);

        const formatDate = (d) => {
          return d.getFullYear() +
                 String(d.getMonth() + 1).padStart(2, '0') +
                 String(d.getDate()).padStart(2, '0');
        };

        startStr = formatDate(startDate);
        endStr = formatDate(endDate);
        renderDay = startDate.getDate();

        // 共有URL用のフォーマット
        shareDateParam = startStr;
        shareTimeParam = ""; // 終日は空
      } else {
        // 時刻指定イベント
        const sDate = document.getElementById('startDate').value;
        const sTime = document.getElementById('startTime').value;
        const eDate = document.getElementById('endDate').value;
        const eTime = document.getElementById('endTime').value;

        if (!sDate || !sTime || !eDate || !eTime) return;

        // 時刻バリデーション
        const startDt = new Date(`${sDate}T${sTime}`);
        const endDt = new Date(`${eDate}T${eTime}`);

        if (endDt <= startDt) {
          // alert()は禁止事項のため、トースト通知で親切に表示
          showToast("エラー: 終了日時は開始日時より後に設定してください");
          return;
        }

        // Googleカレンダー時間パラメータフォーマット：YYYYMMDDTHHMMSS
        const formatDateTime = (dateVal, timeVal) => {
          const ymd = dateVal.replace(/-/g, '');
          const hms = timeVal.replace(/:/g, '') + "00";
          return `${ymd}T${hms}`;
        };

        startStr = formatDateTime(sDate, sTime);
        endStr = formatDateTime(eDate, eTime);
        renderDay = startDt.getDate();

        // 共有URL用のフォーマット (date=YYYYMMDD, time=HHMM-HHMM)
        shareDateParam = sDate.replace(/-/g, '');
        shareTimeParam = sTime.replace(/:/g, '') + "-" + eTime.replace(/:/g, '');
      }

      // 2. 共有用URLの組み立て (GoogleカレンダーのdetailsにURLを含めるため先に構築)
      const shareBaseUrl = "https://apps.nknighta.me/schedule";
      const shareParamsObj = { date: shareDateParam, time: shareTimeParam, title: title };
      if (fromName) shareParamsObj.from = fromName;
      const shareParams = new URLSearchParams(shareParamsObj);

      // 自動ICSダウンロードオプションの有無をパラメータに反映
      const qrDescEl = document.getElementById('shareQrDesc');
      if (optAutoIcs) {
        shareParams.set('addcaltype', 'ics');
        qrDescEl.textContent = "※中継ページ遷移後、ICSファイルが自動でダウンロードされます";
      } else {
        qrDescEl.textContent = "※中継ページ遷移後、ユーザーが任意の方法（Google/Apple等）で登録できます";
      }

      const finalShareUrl = `${shareBaseUrl}?${shareParams.toString()}`;

      // 3. GoogleカレンダーURLを組み立て
      const baseUrl = "https://calendar.google.com/calendar/render";
      const gCalDetails = (fromName ? `${fromName}より共有された予定です。` : "nknighta スケジュール共有ツールより追加されました。")
        + `\n\n共有ページ: ${finalShareUrl}`;
      const gCalParams = new URLSearchParams({
        action: "TEMPLATE",
        text: title,
        dates: `${startStr}/${endStr}`,
        ctz: timezone,
        details: gCalDetails
      });

      const finalGoogleCalUrl = `${baseUrl}?${gCalParams.toString()}`;

      // 4. 各種直接登録リンクボタンのhref更新
      document.getElementById('calendarDirectLink').href = finalGoogleCalUrl;
      document.getElementById('shareDirectLink').href = finalShareUrl;

      // 5. キャンバス合成（ロゴ入りQR）の生成
      generateLogoQR(finalGoogleCalUrl, renderDay, 'qrCanvas', 'hidden-qr', getGoogleCalendarLogo);
      generateLogoQR(finalShareUrl, renderDay, 'shareQrCanvas', 'hidden-share-qr', getShareLogo);

      // モーダルを開いて、結果を画面中央に美しくポップアップ表示
      openModal();
    });

    // ロゴ入りのQRコードをCanvas上で合成して生成する共通ロジック (スマホ環境対応版)
    function generateLogoQR(url, day, canvasId, hiddenContainerId, logoGeneratorFunc) {
      const finalCanvas = document.getElementById(canvasId);
      const ctx = finalCanvas.getContext('2d');
      const hiddenDiv = document.getElementById(hiddenContainerId);
      
      // QRコードを一時領域で裏生成
      hiddenDiv.innerHTML = '';
      const qrcode = new QRCode(hiddenDiv, {
        text: url,
        width: 256,
        height: 256,
        correctLevel: QRCode.CorrectLevel.H // 真ん中にロゴを重ねても読めるように最高レベルに設定
      });

      // qrcode.jsがスマホとPCで吐き出すタグの違い(canvas vs img)を両方カバーする監視ポーリング
      let attempts = 0;
      const checkInterval = setInterval(() => {
        attempts++;
        if (attempts > 80) { // 最大約4秒でタイムアウト
          clearInterval(checkInterval);
          console.error("QR Code Generation Timeout on element:", canvasId);
          return;
        }

        const qrCanvas = hiddenDiv.querySelector('canvas');
        const qrImg = hiddenDiv.querySelector('img');

        let sourceElement = null;
        let isImgType = false;

        // スマホでは qrImg の src にBase64が書き込まれる
        if (qrImg && qrImg.src && qrImg.src.startsWith('data:image')) {
          sourceElement = qrImg;
          isImgType = true;
        } else if (qrCanvas && qrCanvas.getContext) {
          // PCブラウザ等では canvas要素にそのままレンダリングされる
          sourceElement = qrCanvas;
          isImgType = false;
        }

        if (sourceElement) {
          clearInterval(checkInterval);

          const drawAndMergeLogo = (resolvedSource) => {
            // 1. メインCanvasにQRコードを丸ごと転写
            ctx.clearRect(0, 0, 220, 220); // サイズをモーダルに合わせて調整
            ctx.drawImage(resolvedSource, 0, 0, 220, 220);

            // 2. 中央にロゴを配置するための白い背景(背景座)を描画
            const logoSize = 42; // ロゴの描画サイズ
            const bgSize = 48;   // 白い土台のサイズ
            const x = (220 - bgSize) / 2;
            const y = (220 - bgSize) / 2;

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(x, y, bgSize, bgSize, 10);
            } else {
              ctx.rect(x, y, bgSize, bgSize);
            }
            ctx.fill();

            // 3. 動的ロゴSVGを読み込んでCanvasの中央に描画 (Base64化済みのためiOS Safari等でも100%確実に描画される)
            const logoImg = new Image();
            logoImg.crossOrigin = "anonymous";
            logoImg.onload = function() {
              const lx = (220 - logoSize) / 2;
              const ly = (220 - logoSize) / 2;
              ctx.drawImage(logoImg, lx, ly, logoSize, logoSize);
            };
            logoImg.src = logoGeneratorFunc(day);
          };

          if (isImgType) {
            // imgタグの場合はロード完了させてから描画
            const tempImg = new Image();
            tempImg.onload = function() {
              drawAndMergeLogo(tempImg);
            };
            tempImg.src = sourceElement.src;
          } else {
            // canvasの場合は即座に描画
            drawAndMergeLogo(sourceElement);
          }
        }
      }, 50);
    }

    // QRコード画像をPNG形式でダウンロード保存する処理
    function downloadQRCode(canvasId, defaultFilename) {
      const canvas = document.getElementById(canvasId);
      const title = document.getElementById('eventTitle').value || 'calendar';
      
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.download = `${title}_${defaultFilename}.png`;
      link.href = image;
      link.click();
    }
