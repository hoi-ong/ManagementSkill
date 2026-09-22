(function(){
  "use strict";
  const LETTERS = ["A","B","C","D"];
  const $ = function(id){ return document.getElementById(id); };

  const ALL = QUESTIONS;
  const SET = (window.QUIZ_PICK ? window.QUIZ_PICK.map(function(i){ return ALL[i]; }) : ALL);
  const total = SET.length;
  const PASS = window.QUIZ_PASS || Math.ceil(total * 0.6);

  let student = null, answers = new Array(total).fill(null), startedAt = null, timerId = null, result = null;

  $("title").textContent = CONFIG.quizTitle;
  $("subtitle").textContent = window.QUIZ_SUBTITLE || CONFIG.quizSubtitle;
  $("totalNum").textContent = "/" + total;
  $("rules").textContent = "Bài gồm " + total + " câu, mỗi câu đúng 1 điểm. "
    + (CONFIG.timeLimitMinutes > 0 ? "Thời gian làm bài " + CONFIG.timeLimitMinutes + " phút. " : "Không giới hạn thời gian. ")
    + "Điểm đạt: " + PASS + "/" + total + ".";
  if (CONFIG.requireEmail) { $("emailOpt").textContent = "(bắt buộc)"; $("email").required = true; }

  $("infoForm").addEventListener("submit", function(ev){
    ev.preventDefault();
    const name = $("name").value.trim(), clazz = $("clazz").value.trim(), email = $("email").value.trim();
    const err = $("infoErr"); err.style.display = "none";
    if (!name || !clazz) { err.textContent = "Vui lòng nhập họ tên và lớp."; err.style.display = "block"; return; }
    if ((CONFIG.requireEmail && !email) || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
      err.textContent = "Email chưa hợp lệ."; err.style.display = "block"; return;
    }
    student = {name:name, clazz:clazz, email:email};
    startQuiz();
  });

  function startQuiz(){
    $("screen-info").classList.add("hidden");
    $("screen-quiz").classList.remove("hidden");
    $("whoami").textContent = student.name + " • " + student.clazz;
    renderQuestions(); updateProgress();
    startedAt = new Date();
    if (CONFIG.timeLimitMinutes > 0) startTimer();
    window.scrollTo(0,0);
  }

  function renderQuestions(){
    const box = $("questions"); box.innerHTML = "";
    SET.forEach(function(q, i){
      const el = document.createElement("div");
      el.className = "q"; el.id = "q" + i;
      const opts = q.o.map(function(text, j){
        return '<label class="opt" data-q="'+i+'" data-o="'+j+'">'
             + '<input type="radio" name="q'+i+'" value="'+j+'">'
             + '<span><b>'+LETTERS[j]+'.</b> '+esc(text)+'</span></label>';
      }).join("");
      el.innerHTML = '<div class="qhead"><span class="badge">Câu '+(i+1)+'/'+total+'</span>'
        + '<span class="badge">'+esc(q.g)+'</span></div>'
        + '<div class="qtext">'+esc(q.q)+'</div>' + opts;
      box.appendChild(el);
    });
    box.addEventListener("change", function(ev){
      const lab = ev.target.closest(".opt"); if (!lab) return;
      const qi = +lab.dataset.q;
      answers[qi] = +lab.dataset.o;
      const card = $("q"+qi);
      card.classList.remove("unanswered");
      card.querySelectorAll(".opt").forEach(function(o){ o.classList.remove("sel"); });
      lab.classList.add("sel");
      updateProgress();
    });
  }

  function updateProgress(){
    const done = answers.filter(function(a){ return a !== null; }).length;
    $("progressText").textContent = done + "/" + total + " câu đã trả lời";
    $("progressBar").style.width = (done/total*100) + "%";
  }

  function startTimer(){
    let left = CONFIG.timeLimitMinutes * 60;
    timerId = setInterval(function(){
      left--;
      const m = String(Math.floor(left/60)).padStart(2,"0"), s = String(left%60).padStart(2,"0");
      $("timer").textContent = "⏱ " + m + ":" + s;
      if (left <= 0){ clearInterval(timerId); finish(true); }
    }, 1000);
  }

  $("submitBtn").addEventListener("click", function(){ finish(false); });

  function finish(auto){
    const missing = [];
    answers.forEach(function(a,i){ if (a === null) missing.push(i); });
    if (!auto && missing.length){
      missing.forEach(function(i){ $("q"+i).classList.add("unanswered"); });
      const e = $("quizErr");
      e.textContent = "Bạn còn " + missing.length + " câu chưa trả lời (đã đánh dấu màu vàng).";
      e.style.display = "block";
      $("q"+missing[0]).scrollIntoView({behavior:"smooth", block:"center"});
      return;
    }
    if (timerId) clearInterval(timerId);
    showResult();
  }

  function showResult(){
    let score = 0; const byGroup = {};
    SET.forEach(function(q,i){
      const ok = answers[i] === q.a;
      if (ok) score++;
      if (!byGroup[q.g]) byGroup[q.g] = {ok:0, n:0};
      byGroup[q.g].n++; if (ok) byGroup[q.g].ok++;
    });
    const minutes = Math.max(1, Math.round((Date.now() - startedAt.getTime())/60000));
    result = {score:score, total:total, minutes:minutes, at:new Date()};

    $("screen-quiz").classList.add("hidden");
    $("screen-result").classList.remove("hidden");
    $("scoreNum").textContent = score;
    const pct = Math.round(score/total*100);
    $("resultLine").textContent = student.name + " • " + student.clazz + " • "
      + pct + "% • " + (score >= PASS ? "ĐẠT ✅" : "CHƯA ĐẠT — nên ôn lại ❗");

    $("breakdown").innerHTML = Object.keys(byGroup).map(function(g){
      const b = byGroup[g];
      return "<tr><td>"+esc(g)+"</td><td>"+b.ok+"/"+b.n+"</td><td>"+Math.round(b.ok/b.n*100)+"%</td></tr>";
    }).join("");

    if (CONFIG.showReview) renderReview(); else $("reviewCard").classList.add("hidden");
    window.scrollTo(0,0);
    saveToGithub();
  }

  function renderReview(){
    $("review").innerHTML = SET.map(function(q,i){
      const opts = q.o.map(function(t,j){
        let cls = "opt";
        if (j === q.a) cls += " correct";
        else if (j === answers[i]) cls += " wrong";
        return '<div class="'+cls+'"><span><b>'+LETTERS[j]+'.</b> '+esc(t)+'</span></div>';
      }).join("");
      const ok = answers[i] === q.a;
      return '<div class="q"><div class="qhead"><span class="badge">Câu '+(i+1)+'</span>'
        + '<span class="badge">'+esc(q.g)+'</span>'
        + '<span class="badge '+(ok?"right":"wrongb")+'">'+(ok ? "Đúng" : "Sai")+'</span></div>'
        + '<div class="qtext">'+esc(q.q)+'</div>'+opts
        + '<div class="exp"><b>Giải thích:</b> '+esc(q.e)+'</div></div>';
    }).join("");
  }

  $("retryBtn").addEventListener("click", function(){
    answers = new Array(total).fill(null); result = null;
    $("quizErr").style.display = "none";
    $("screen-result").classList.add("hidden");
    startQuiz();
  });

  const HEADER = ["Thời gian nộp","Họ tên","Lớp","Email","Lần làm","Điểm","Tổng câu","Tỷ lệ %","Kết quả","Số phút làm bài"];

  function rowOf(attempt){
    return [fmtTime(result.at), student.name, student.clazz, student.email || "", attempt,
            result.score, result.total, Math.round(result.score/result.total*100),
            result.score >= PASS ? "Đạt" : "Chưa đạt", result.minutes];
  }

  function status(kind, html){ const el = $("saveStatus"); el.className = "status " + kind; el.innerHTML = html; }

  async function saveToGithub(){
    if (!CONFIG.token){
      status("warn", "⚠️ Chưa bật lưu tự động. Vui lòng bấm nút bên dưới để tải file kết quả và gửi cho giáo viên.");
      return;
    }
    status("warn", "Đang lưu kết quả lên hệ thống…");
    try {
      const saved = await commitWithRetry();
      status("ok", "✅ Đã lưu kết quả thành công — đây là <b>lần làm thứ " + saved + "</b> của bạn.");
    } catch (e){
      status("err", "❌ Không lưu được lên hệ thống (" + esc(String(e.message || e)) + "). Vui lòng tải file kết quả bên dưới và gửi cho giáo viên.");
    }
  }

  async function commitWithRetry(){
    for (let t = 0; t < 3; t++){
      try { return await commitOnce(); }
      catch (e){
        if (t === 2 || !/409|conflict|sha/i.test(String(e.message))) throw e;
        await new Promise(function(r){ setTimeout(r, 600 + Math.random()*900); });
      }
    }
  }

  const api = function(p){ return "https://api.github.com/repos/" + CONFIG.owner + "/" + CONFIG.repo + "/contents/" + p; };
  const headers = function(){ return {Authorization:"Bearer " + CONFIG.token, Accept:"application/vnd.github+json"}; };

  async function commitOnce(){
    let sha = null, rows = [HEADER];
    const res = await fetch(api(CONFIG.path) + "?ref=" + encodeURIComponent(CONFIG.branch) + "&t=" + Date.now(), {headers: headers()});
    if (res.status === 200){
      const j = await res.json();
      sha = j.sha;
      const bytes = b64ToBytes(j.content.replace(/\n/g, ""));
      const wb = XLSX.read(bytes, {type:"array"});
      rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {header:1, raw:false});
      if (!rows.length) rows = [HEADER];
    } else if (res.status !== 404){
      throw new Error("HTTP " + res.status);
    }
    const key = (student.email || student.name + "|" + student.clazz).toLowerCase();
    let attempt = 1;
    rows.slice(1).forEach(function(r){
      const k = ((r[3] || "") ? String(r[3]) : String(r[1] || "") + "|" + String(r[2] || "")).toLowerCase();
      if (k === key) attempt++;
    });
    rows.push(rowOf(attempt));
    const wb2 = XLSX.utils.book_new();
    const ws2 = XLSX.utils.aoa_to_sheet(rows);
    ws2["!cols"] = [{wch:19},{wch:24},{wch:16},{wch:26},{wch:9},{wch:7},{wch:9},{wch:9},{wch:11},{wch:14}];
    XLSX.utils.book_append_sheet(wb2, ws2, "KetQua");
    const out = XLSX.write(wb2, {bookType:"xlsx", type:"array"});
    const body = {
      message: "Ket qua: " + student.name + " (" + student.clazz + ") - " + result.score + "/" + result.total + " - lan " + attempt,
      content: bytesToB64(new Uint8Array(out)),
      branch: CONFIG.branch
    };
    if (sha) body.sha = sha;
    const put = await fetch(api(CONFIG.path), {method:"PUT", headers: Object.assign({"Content-Type":"application/json"}, headers()), body: JSON.stringify(body)});
    if (!put.ok) throw new Error("HTTP " + put.status + (put.status === 409 ? " conflict" : ""));
    return attempt;
  }

  $("downloadBtn").addEventListener("click", function(){
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([HEADER, rowOf(1)]);
    XLSX.utils.book_append_sheet(wb, ws, "KetQua");
    XLSX.writeFile(wb, "ketqua_" + slug(student.name) + "_" + result.score + "diem.xlsx");
  });

  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]; }); }
  function slug(s){ return s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/gi,"d").replace(/[^a-zA-Z0-9]+/g,"_"); }
  function fmtTime(d){
    const p = function(n){ return String(n).padStart(2,"0"); };
    return p(d.getDate())+"/"+p(d.getMonth()+1)+"/"+d.getFullYear()+" "+p(d.getHours())+":"+p(d.getMinutes());
  }
  function b64ToBytes(b64){ const bin = atob(b64); const a = new Uint8Array(bin.length); for (let i=0;i<bin.length;i++) a[i]=bin.charCodeAt(i); return a; }
  function bytesToB64(bytes){ let s=""; for (let i=0;i<bytes.length;i++) s += String.fromCharCode(bytes[i]); return btoa(s); }

  window.addEventListener("beforeunload", function(e){
    if (startedAt && !result){ e.preventDefault(); e.returnValue = ""; }
  });
})();