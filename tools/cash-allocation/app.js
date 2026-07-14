const ids=["gross","vatRate","incomeRate","directCost","runwayMonths","personalMonthly","personalCash","companyMonthly","companyCash","debtMonthly","debtMonths"];
const defaults={gross:9350000,vatRate:10,incomeRate:10,directCost:0,runwayMonths:3,personalMonthly:1000000,personalCash:1500000,companyMonthly:500000,companyCash:0,debtMonthly:0,debtMonths:0};
const money=new Intl.NumberFormat("ko-KR",{style:"currency",currency:"KRW",maximumFractionDigits:0});
const colors={vat:"#596cff",income:"#8b5cf6",direct:"#ea884d",runway:"#1f6f5f",debt:"#4aa37d",asset:"#d8b24c"};

function value(id){
  const number=Number(document.getElementById(id).value);
  return Number.isFinite(number)&&number>0?number:0;
}

function compactWon(amount){
  if(amount>=100000000)return `₩${(amount/100000000).toFixed(amount%100000000?1:0)}억`;
  if(amount>=10000)return `₩${Math.round(amount/10000).toLocaleString("ko-KR")}만`;
  return money.format(amount);
}

function allocate(total,targets){
  let remaining=Math.max(0,total);
  const result={};
  for(const [key,wanted] of targets){
    result[key]=Math.min(remaining,Math.max(0,wanted));
    remaining-=result[key];
  }
  result.asset=Math.max(0,remaining);
  return result;
}

function row(color,title,sub,amount,gross){
  const percent=gross>0?amount/gross*100:0;
  return `<div class="row"><span class="dot" style="background:${color}"></span><div><div class="row-title">${title}</div><div class="row-sub">${sub}</div></div><div class="row-value">${money.format(Math.round(amount))}<small>${percent.toFixed(1)}%</small></div></div>`;
}

function calculate(){
  const gross=value("gross");
  const vatRate=value("vatRate")/100;
  const incomeRate=value("incomeRate")/100;
  const direct=value("directCost");
  const months=value("runwayMonths");
  const supply=vatRate>0?gross/(1+vatRate):gross;
  const vat=Math.max(0,gross-supply);
  const income=supply*incomeRate;

  const personalTarget=value("personalMonthly")*months;
  const companyTarget=value("companyMonthly")*months;
  const personalGap=Math.max(0,personalTarget-value("personalCash"));
  const companyGap=Math.max(0,companyTarget-value("companyCash"));
  const runwayGap=personalGap+companyGap;
  const debt=value("debtMonthly")*value("debtMonths");

  const allocation=allocate(gross,[
    ["vat",vat],
    ["income",income],
    ["direct",direct],
    ["runway",runwayGap],
    ["debt",debt]
  ]);

  const personalAllocated=Math.min(personalGap,allocation.runway||0);
  const companyAllocated=Math.max(0,(allocation.runway||0)-personalAllocated);
  const shortage=Math.max(0,vat+income+direct+runwayGap+debt-gross);

  document.getElementById("grossShort").textContent=compactWon(gross);
  document.getElementById("assetSeed").textContent=money.format(Math.round(allocation.asset));
  document.getElementById("rows").innerHTML=[
    row(colors.vat,"부가세 준비금","입금액에서 공급가액을 분리",allocation.vat,gross),
    row(colors.income,"종합소득세 준비금","공급가액 × 설정한 준비율",allocation.income,gross),
    row(colors.direct,"확정 직접원가","프로젝트 수행에 반드시 필요한 비용",allocation.direct,gross),
    row(colors.runway,"개인 런웨이",`${months}개월 목표 · 현재 보유액을 제외한 부족분`,personalAllocated,gross),
    row(colors.runway,"회사 런웨이",`${months}개월 목표 · 현재 보유액을 제외한 부족분`,companyAllocated,gross),
    row(colors.debt,"상환 재개 대비금","신속채무조정 납입 재개에 대비",allocation.debt,gross),
    row(colors.asset,"자산 종잣돈","보호금액을 모두 분리한 뒤 남는 금액",allocation.asset,gross)
  ].join("");

  const status=document.getElementById("status");
  if(gross===0){
    status.className="status warn";
    status.textContent="입금액을 입력하면 분배안이 계산됩니다.";
  }else if(shortage>0){
    status.className="status bad";
    status.textContent=`보호 목표까지 ${money.format(Math.round(shortage))} 부족합니다.`;
  }else if(allocation.asset>0){
    status.className="status good";
    status.textContent=`${months}개월 런웨이를 채우고도 잔액이 남습니다.`;
  }else{
    status.className="status warn";
    status.textContent="보호 목표는 충족하지만 자산 종잣돈은 남지 않습니다.";
  }

  const base=Math.max(1,gross);
  let cumulative=0;
  const points=[];
  ["vat","income","direct","runway","debt"].forEach(key=>{
    cumulative+=(allocation[key]||0)/base*100;
    points.push(Math.min(100,cumulative));
  });
  const donut=document.getElementById("donut");
  points.forEach((point,index)=>donut.style.setProperty(`--p${index+1}`,`${point}%`));

  const text=[
    `입금액: ${money.format(Math.round(gross))}`,
    `공급가액: ${money.format(Math.round(supply))}`,
    "",
    "[추천 분배]",
    `부가세: ${money.format(Math.round(allocation.vat))}`,
    `종소세 준비금: ${money.format(Math.round(allocation.income))}`,
    `직접원가: ${money.format(Math.round(allocation.direct))}`,
    `개인 런웨이: ${money.format(Math.round(personalAllocated))}`,
    `회사 런웨이: ${money.format(Math.round(companyAllocated))}`,
    `상환 재개 대비금: ${money.format(Math.round(allocation.debt))}`,
    `자산 종잣돈: ${money.format(Math.round(allocation.asset))}`,
    shortage>0?`보호 목표 부족액: ${money.format(Math.round(shortage))}`:"보호 목표 부족액: 없음"
  ].join("\n");
  document.getElementById("copyText").textContent=text;

  const state={};
  ids.forEach(id=>state[id]=document.getElementById(id).value);
  localStorage.setItem("cash-allocation-state",JSON.stringify(state));
}

function restore(){
  try{
    const saved=JSON.parse(localStorage.getItem("cash-allocation-state")||"{}");
    ids.forEach(id=>{if(saved[id]!==undefined)document.getElementById(id).value=saved[id];});
  }catch(error){console.warn("Saved state could not be restored",error);}
}

function reset(){
  ids.forEach(id=>document.getElementById(id).value=defaults[id]);
  localStorage.removeItem("cash-allocation-state");
  calculate();
}

function showToast(message){
  const toast=document.getElementById("toast");
  toast.textContent=message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer=setTimeout(()=>toast.classList.remove("show"),1800);
}

async function copyPlan(){
  const text=document.getElementById("copyText").textContent;
  try{
    await navigator.clipboard.writeText(text);
  }catch(error){
    const area=document.createElement("textarea");
    area.value=text;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
  showToast("분배안을 복사했습니다.");
}

ids.forEach(id=>document.getElementById(id).addEventListener("input",calculate));
document.getElementById("reset").addEventListener("click",reset);
document.getElementById("copyBtn").addEventListener("click",copyPlan);
restore();
calculate();
