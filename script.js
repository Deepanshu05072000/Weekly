// Cut-offs (no category)
const OVERALL_CUTOFF = 112;

const SECTIONAL_CUTOFF = {
  weeklyH: 35,
  weeklyCA: 40,
  hindu: 8,
  ca: 8,
  desc: 12
};

const SUBJECTS = {
  weeklyH: { total:60 },
  weeklyCA: { total:70 },
  hindu: { total:20 },
  ca: { total:20 },
  desc: { total:30 }
};

// Students data
const USERS = {
  "9151701": { password:"91517001", dob:"05-07-2000", name:"Deepanshu Yadav", weeklyH:45, weeklyCA:45, hindu:10, ca:11, desc:20.5 },
  "8504002": { password:"85040002", dob:"25-11-2004", name:"Nikita Soni", weeklyH:39, weeklyCA:40, hindu:0, ca:0, desc:0 },
  "8756203": { password:"87562003", dob:"10-08-2002", name:"Jyoti Yadav", weeklyH:40, weeklyCA:47, hindu:13, ca:16, desc:17 },
  "6001104": { password:"60011004", dob:"29-11-1999", name:"Priyanka Dev", weeklyH:41, weeklyCA:40, hindu:12, ca:11, desc:15.5 },
  "6205705": { password:"62057005", dob:"25-12-2003", name:"Priyanka Verma", weeklyH:5, weeklyCA:0, hindu:8, ca:0, desc:0 },
  "8303906": { password:"83039006", dob:"27-07-2003", name:"Adweta Sen", weeklyH:15, weeklyCA:34, hindu:0, ca:0, desc:0 },
  "7878107": { password:"78781007", dob:"02-02-2002", name:"Shivani Jha", weeklyH:0, weeklyCA:0, hindu:0, ca:0, desc:0 },
  "8534808": { password:"85348008", dob:"06-06-2002", name:"Shweta Yadav", weeklyH:32, weeklyCA:44, hindu:0, ca:16, desc:0 }
};

// Captcha
let a = Math.floor(Math.random()*9)+1;
let b = Math.floor(Math.random()*9)+1;
document.getElementById("captchaQ").textContent = `${a} + ${b} = ?`;

function getTotal(u){
  return u.weeklyH + u.weeklyCA + u.hindu + u.ca + u.desc;
}

function maskRoll(roll){
  return "*****" + roll.slice(-2);
}

function getIndicatorClass(score, cutoff){
  if(score >= cutoff) return "indicator-green";
  if(score >= cutoff * 0.9) return "indicator-orange";
  return "indicator-red";
}

function getBadge(score, cutoff){
  if(score >= cutoff) return '<span class="badge-green">Above Cut-off</span>';
  if(score >= cutoff * 0.9) return '<span class="badge-orange">Near Cut-off</span>';
  return '<span class="badge-red">Below Cut-off</span>';
}

function renderSection(idScore, idCut, scored, total, cutoff){
  const cls = getIndicatorClass(scored, cutoff);
  const badge = getBadge(scored, cutoff);
  document.getElementById(idScore).innerHTML =
    `<span class="${cls}">${scored}/${total}${scored >= cutoff ? "" : " *"}</span> ${badge}`;
  document.getElementById(idCut).textContent = cutoff;
}

function login(){
  const roll = document.getElementById("roll").value.trim();
  const pass = document.getElementById("password").value.trim();
  const dob = document.getElementById("dob").value.trim();
  const cap = document.getElementById("captchaAns").value.trim();
  const err = document.getElementById("error");

  if(!roll || !pass || !dob || !cap){
    err.textContent = "Please fill all fields.";
    return;
  }
  if(parseInt(cap) !== a + b){
    err.textContent = "Invalid captcha.";
    return;
  }
  if(!USERS[roll] || USERS[roll].password !== pass || USERS[roll].dob !== dob){
    err.textContent = "Invalid credentials.";
    return;
  }
  err.textContent = "";
  showResult(roll);
}

let CURRENT_USER = null;
let CURRENT_RANK = null;

function showResult(roll){
  const u = USERS[roll];

  const ranked = Object.entries(USERS)
    .map(([r,x]) => ({ roll:r, ...x, total:getTotal(x) }))
    .sort((a,b)=>b.total-a.total);

  const rank = ranked.findIndex(x=>x.roll===roll) + 1;
  const percentile = (((ranked.length - rank) / ranked.length) * 100).toFixed(2);

  // Top 3
  const top3 = ranked.slice(0,3).map((u,i)=>{
    const medal = ["🥇 Gold","🥈 Silver","🥉 Bronze"][i];
    return `${medal} – ${u.name} (${maskRoll(u.roll)}) – ${u.total} Marks`;
  }).join(" | ");
  document.getElementById("topperInfo").innerHTML = top3;

  document.getElementById("name").textContent = u.name;
  document.getElementById("rollShow").textContent = roll;
  document.getElementById("rank").textContent = rank;
  document.getElementById("percentile").textContent = percentile + "%";

  renderSection("weeklyH","cut_weeklyH",u.weeklyH,SUBJECTS.weeklyH.total,SECTIONAL_CUTOFF.weeklyH);
  renderSection("weeklyCA","cut_weeklyCA",u.weeklyCA,SUBJECTS.weeklyCA.total,SECTIONAL_CUTOFF.weeklyCA);
  renderSection("hindu","cut_hindu",u.hindu,SUBJECTS.hindu.total,SECTIONAL_CUTOFF.hindu);
  renderSection("ca","cut_ca",u.ca,SUBJECTS.ca.total,SECTIONAL_CUTOFF.ca);
  renderSection("desc","cut_desc",u.desc,SUBJECTS.desc.total,SECTIONAL_CUTOFF.desc);

  const total = getTotal(u);
  document.getElementById("total").innerHTML =
    `<span class="${getIndicatorClass(total, OVERALL_CUTOFF)}">${total}</span>`;
  document.getElementById("cutoff").textContent = OVERALL_CUTOFF;

  const qualified =
    u.weeklyH >= SECTIONAL_CUTOFF.weeklyH &&
    u.weeklyCA >= SECTIONAL_CUTOFF.weeklyCA &&
    u.hindu >= SECTIONAL_CUTOFF.hindu &&
    u.ca >= SECTIONAL_CUTOFF.ca &&
    u.desc >= SECTIONAL_CUTOFF.desc &&
    total >= OVERALL_CUTOFF;

  const status = document.getElementById("status");
  status.textContent = qualified ? "Qualified" : "Not Qualified";
  status.className = qualified ? "pass" : "fail";

  // Accuracy (objective sections only)
  const totalQ = 20 + 20 + 60 + 60;
  const correct = u.hindu + u.ca + u.weeklyH + u.weeklyCA;
  const accuracy = ((correct / totalQ) * 100).toFixed(2);
  document.getElementById("accuracy").textContent = accuracy + "%";

  CURRENT_USER = u;
  CURRENT_RANK = rank;
  document.getElementById("certBtn").style.display = rank <= 3 ? "inline-block" : "none";

  document.getElementById("loginCard").style.display = "none";
  document.getElementById("resultCard").style.display = "block";
}

function downloadMarksheet(){
  html2pdf().from(document.getElementById("resultCard")).save("Marksheet.pdf");
}

function downloadCertificate(){
  const cert = document.createElement("div");
  cert.style.padding = "40px";
  cert.style.fontFamily = "Georgia, serif";
  cert.style.border = "10px double #1e3a8a";
  cert.style.textAlign = "center";

  const titles = ["🥇 Rank 1 – Certificate of Excellence","🥈 Rank 2 – Certificate of Excellence","🥉 Rank 3 – Certificate of Excellence"];
  const messages = [
    "by demonstrating outstanding performance, exceptional accuracy, and top-level analytical skills at a moderate to difficult (SBI PO standard) level.",
    "by showcasing excellent conceptual clarity, strong current affairs command, and disciplined preparation at SBI PO examination level.",
    "by delivering a commendable performance and maintaining high standards of accuracy and understanding at a competitive SBI PO level."
  ];

  cert.innerHTML = `
    <h1>${titles[CURRENT_RANK-1]}</h1>
    <p>This is to certify that</p>
    <h2>${CURRENT_USER.name}</h2>
    <p>has secured Rank ${CURRENT_RANK}</p>
    <p>in the Weekly & Daily Assessment Programme<br>
    (The Hindu Editorial • Current Affairs • Descriptive Writing)</p>
    <p>conducted on 09 February 2026</p>
    <p>${messages[CURRENT_RANK-1]}</p>
    <p><b>Score Obtained:</b> ${getTotal(CURRENT_USER)} / 200</p>
    <p><b>Overall Rank:</b> ${CURRENT_RANK}</p>
    <br><br>
    <div style="font-family:cursive; font-size:28px;">Deepanshu Yaduvanshi</div>
    <div>Authorized Signatory</div>
    <div><b>Organization Name</b></div>
  `;

  html2pdf().from(cert).save("Certificate_of_Excellence.pdf");
}

function logout(){
  location.reload();
}
