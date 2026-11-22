import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(root, "data", "questions.json");
const original = fs.readFileSync(file, "utf8");
const bank = JSON.parse(original).filter(q => !q.id?.startsWith("exam-target-20261122-"));
const format = n => String(Number(Number(n).toFixed(3)));
const groups = [
  {exam:"會考", level:"國中", source:"Knovatrix 會考模擬原創", entries:[
    ["數學","會考模擬｜數學",200], ["自然科學","會考模擬｜自然",200], ["社會","會考模擬｜社會",80], ["英文","會考模擬｜英文",50], ["國文","會考模擬｜國文",33]
  ]},
  {exam:"分科", level:"高中", source:"Knovatrix 分科模擬原創", entries:[
    ["數學","分科模擬｜數學甲",60], ["物理","分科模擬｜物理",60], ["化學","分科模擬｜化學",50], ["生物","分科模擬｜生物",50], ["歷史","分科模擬｜歷史",50], ["地理","分科模擬｜地理",50], ["公民與社會","分科模擬｜公民",52]
  ]}
];
const existingIds = new Set(bank.map(q => q.id));
const existingPrompts = new Set(bank.map(q => `${q.level}|${q.subject}|${q.deck}|${q.prompt}`));
const added = [];
function build(exam, subject, n) {
  let prompt, answer, explanation;
  if (subject === "英文") {
    const plural = n % 2 === 0;
    const head = plural ? `The records in survey ${n}` : `The result of survey ${n}`;
    const correct = plural ? "have" : "has";
    const opts = [correct, plural ? "has" : "have", "was", "were"];
    const shift = n % 4;
    return {prompt:`Choose the verb that agrees with the subject: “${head} ______ been checked twice.”`, options:opts.slice(shift).concat(opts.slice(0,shift)), answer:(4-shift)%4, explanation:`The grammatical head is “${plural?"records":"result"},” so the correct verb is “${correct}.”`};
  }
  if (subject === "國文") {
    const fixed=[100+n,70+n,40+n,10+n];
    const counts=fixed.slice(n%4).concat(fixed.slice(0,n%4));
    const best=Math.max(...counts), day=counts.indexOf(best)+1;
    const prompt=`【閱讀理解】圖書館四天借閱量依序為週一 ${counts[0]} 本、週二 ${counts[1]} 本、週三 ${counts[2]} 本、週四 ${counts[3]} 本。借閱量最高的是哪一天？`;
    const options=["週一","週二","週三","週四"];
    return {prompt, options, answer:day-1, explanation:`比較四個數值 ${counts.join("、")}，最大值為 ${best}，出現在週${["一","二","三","四"][day-1]}。`};
  }
  const a = 12 + n, b = 4 + (n % 19), c = 2 + (n % 11);
  if (exam === "分科" && subject === "數學") {
    const t=1+n%12, k=1+Math.floor(n/12), x=n%7-3;
    switch(n%4){
      case 0: answer=2*a*x+b;prompt=`多項式 f(x)=${a}x²+${b}x，求 f′(${x})。`;explanation=`f′(x)=${2*a}x+${b}，代入 x=${x} 得 ${2*a}×${x}+${b}=${2*a*x+b}。`;break;
      case 1: answer=k*a+k*(k-1)/2;prompt=`等差數列首項 ${a}、公差 1，前 ${k} 項和為何？`;explanation=`Sₖ=k[2a+(k−1)]/2=${k}×(2×${a}+${k}-1)/2=${answer}。`;break;
      case 2: answer=(x-a)*(x-b);prompt=`二次函數 f(x)=(x−${a})(x−${b})，求 f(${x})。`;explanation=`f(${x})=(${x}−${a})(${x}−${b})=${answer}。`;break;
      default: answer=a+b;prompt=`方程式 x²−${a+b}x+${a*b}=0 的兩根和為何？`;explanation=`依韋達定理，兩根和為 ${a+b}。`;
    }
    return numeric(answer,prompt,explanation,n);
  }
  if (subject === "自然科學") {
    const density=1+Math.floor(n/5)%12, volume=2+Math.floor(n/60), speed=5+Math.floor(n/5), time=2+Math.floor(n/40), births=10+Math.floor(n/5), deaths=2+n%5, pct=10+Math.floor(n/5);
    switch(n%5){
      case 0: answer=density;prompt=`某物體體積 ${volume} cm³、質量 ${density*volume} g，密度是多少 g/cm³？`;explanation=`密度=質量÷體積=${density*volume}÷${volume}=${density} g/cm³。`;break;
      case 1: answer=speed*time;prompt=`腳踏車以 ${speed} km/h 等速行駛 ${time} 小時，行進幾公里？`;explanation=`路程=速度×時間=${speed}×${time}=${speed*time} 公里。`;break;
      case 2: answer=births-deaths;prompt=`生態調查第 ${n} 組觀察到出生 ${births} 隻、死亡 ${deaths} 隻，族群數量淨變化為多少？`;explanation=`淨變化=出生−死亡=${births}−${deaths}=${births-deaths} 隻。`;break;
      case 3: answer=100-pct;prompt=`一杯水溶液共 ${100} mL，其中溶質 ${pct} mL，溶劑占總體積百分之幾？`;explanation=`溶劑比例=(100−${pct})/100×100%=${100-pct}%。`;break;
      default: answer=2*n;prompt=`鐘擺完成 ${n} 次完整往返振動，共經過幾次單程擺動？`;explanation=`一次完整往返包含去程與回程兩次單程擺動，因此共 2×${n}=${2*n} 次。`;
    }
    return numeric(answer,prompt,explanation,n);
  }
  if (["物理","化學","生物"].includes(subject)) {
    const mass=1+n%12, accel=2+Math.floor(n/12), current=1+n%8, resistance=2+Math.floor(n/8), waveFreq=100+n, wavelength=1+n%4;
    if(subject==="物理"){
      switch(n%4){
        case 0: answer=mass*accel;prompt=`質量 ${mass} kg 的物體加速度為 ${accel} m/s²，合力大小為多少牛頓？`;explanation=`F=ma=${mass}×${accel}=${mass*accel} N。`;break;
        case 1: answer=current*resistance;prompt=`電阻 ${resistance} Ω 通過 ${current} A 電流，兩端電壓是多少伏特？`;explanation=`V=IR=${current}×${resistance}=${current*resistance} V。`;break;
        case 2: answer=waveFreq*wavelength;prompt=`波的頻率為 ${waveFreq} Hz、波長為 ${wavelength} m，波速是多少 m/s？`;explanation=`v=fλ=${waveFreq}×${wavelength}=${waveFreq*wavelength} m/s。`;break;
        default: answer=mass*accel*accel;prompt=`質量 ${mass} kg 的物體以 ${accel} m/s 運動，動能是多少焦耳？`;explanation=`動能=½mv²=½×${mass}×${accel}²=${mass*accel*accel/2} J。`; answer=mass*accel*accel/2;
      }
    } else if(subject==="化學"){
      const moles=1+Math.floor(n/3), molar=12+2*(n%20), volume=1+n%5, factor=1+Math.floor(n/3);
      switch(n%3){
        case 0: answer=moles*molar;prompt=`${moles} mol 某物質的莫耳質量為 ${molar} g/mol，質量是多少克？`;explanation=`質量=nM=${moles}×${molar}=${moles*molar} g。`;break;
        case 1: answer=moles/volume;prompt=`${moles} mol 溶質配成 ${volume} L 溶液，莫耳濃度是多少 mol/L？`;explanation=`濃度=n/V=${moles}/${volume}=${format(moles/volume)} mol/L。`;break;
        default: answer=factor;prompt=`反應 A+2B→C。若有 ${factor} mol A 與 ${2*factor+1} mol B，最多可生成幾 mol C？`;explanation=`${factor} mol A 需要 ${2*factor} mol B；B 有 ${2*factor+1} mol，故 A 為限量試劑，最多生成 ${factor} mol C。`;
      }
    } else {
      const allele=1+n%9, recessive=n%4+1, initial=10+n%20, population=500+50*Math.floor(n/3);
      switch(n%3){
        case 0: answer=population*2*(allele/10)*(1-allele/10);prompt=`族群有 ${population} 個體，等位基因頻率 p=${format(allele/10)}、q=${format(1-allele/10)}，符合哈溫平衡時預期有幾個異型合子？`;explanation=`異型合子比例=2pq=2×${format(allele/10)}×${format(1-allele/10)}=${format(2*(allele/10)*(1-allele/10))}；預期個數=${population}×${format(2*(allele/10)*(1-allele/10))}=${answer}。`;break;
        case 1: answer=initial*2**recessive;prompt=`起始有 ${initial} 個細胞，每次分裂數量加倍，經 ${recessive} 次後有幾個細胞？`;explanation=`細胞數=${initial}×2^${recessive}=${initial*2**recessive}。`;break;
        default: answer=initial-recessive;prompt=`某族群原有 ${initial} 個體，遷入 ${recessive} 個、遷出 0 個，族群變為幾個體？`;explanation=`新族群數=${initial}+${recessive}=${initial+recessive}。`;answer=initial+recessive;
      }
    }
    return numeric(answer,prompt,explanation,n);
  }
  if (subject === "數學") {
    switch (n%5) {
      case 0: answer = a*c; prompt=`某商品每件原價 ${a+b} 元，折價 ${b} 元，買 ${c} 件共需多少元？`; explanation=`每件折後價=${a+b}−${b}=${a} 元；總價=${a}×${c}=${a*c} 元。`; break;
      case 1: answer = a+b; prompt=`一元一次方程式 x−${b}=${a}，x 為何？`; explanation=`等式兩邊加 ${b}，得 x=${a}+${b}=${a+b}。`; break;
      case 2: answer = c*3; prompt=`長方形長 ${a} 公分、寬 ${c} 公分，若長增加 ${b} 公分，面積增加多少平方公分？`; explanation=`面積增加量=${b}×${c}=${b*c} 平方公分。`; answer=b*c; break;
      case 3: answer = a-b; prompt=`公平轉盤標有 1 至 ${a} 的整數，轉一次後結果大於 ${b} 的結果有幾種？`; explanation=`符合的是 ${b+1} 至 ${a}，共有 ${a}−${b}=${a-b} 種。`; break;
      default: answer = a*b; prompt=`比例尺 1: ${b*1000} 的地圖上距離 ${a} 公分，實際距離是多少公尺？`; explanation=`實際距離=${a}×${b*1000} 公分=${a*b*10} 公尺。`; answer=a*b*10;
    }
  } else if (["自然科學","物理","化學","生物"].includes(subject)) {
    const type=n%5;
    if(type===0){answer=a*b;prompt=`質量 ${a*b} g、體積 ${b} cm³ 的物體，密度是多少 g/cm³？`;explanation=`密度=質量÷體積=${a*b}÷${b}=${a} g/cm³。`;answer=a;}
    else if(type===1){answer=a;prompt=`物體以 ${a} m/s 等速運動 ${b} 秒，移動距離是多少公尺？`;explanation=`距離=速度×時間=${a}×${b}=${a*b} 公尺。`;answer=a*b;}
    else if(type===2){answer=a*b;prompt=`電阻 ${b} Ω 通過 ${a} A 電流，依歐姆定律兩端電壓為多少伏特？`;explanation=`V=IR=${a}×${b}=${a*b} V。`;answer=a*b;}
    else if(type===3){answer=a;prompt=`某溶液 ${b} L 含溶質 ${a*b} mol，莫耳濃度是多少 mol/L？`;explanation=`濃度=莫耳數÷體積=${a*b}÷${b}=${a} mol/L。`;answer=a;}
    else {answer=a;prompt=`族群調查第 ${n} 組記錄出生 ${a+b} 隻、死亡 ${b} 隻，族群數量淨增加幾隻？`;explanation=`淨增加=${a+b}−${b}=${a} 隻。`;}
  } else {
    const base = a*10, change = b*5;
    if(n%3===0){answer=base+change;prompt=`【資料判讀】第 ${n} 組統計的基期數值為 ${base}，增加 ${change}，新數值是多少？`;explanation=`新數值=${base}+${change}=${base+change}。`;}
    else if(n%3===1){answer=base-change;prompt=`【資料判讀】第 ${n} 組統計值由 ${base} 減少 ${change}，結果是多少？`;explanation=`結果=${base}−${change}=${base-change}。`;}
    else {const sample=a*100, rate=b;answer=a*b;prompt=`【資料判讀】第 ${n} 組樣本共 ${sample} 人，符合條件者占 ${rate}%；符合者有幾人？`;explanation=`符合人數=${sample}×${rate}%=${a*b} 人。`;}
  }
  const step=Number.isInteger(answer)?1:0.1;
  const raw=[answer-2*step,answer-step,answer,answer+step].map(format);
  const shift=n%4, options=raw.slice(shift).concat(raw.slice(0,shift));
  return {prompt,options,answer:(2-shift+4)%4,explanation};
}
function numeric(answer,prompt,explanation,n){
  const step=Number.isInteger(answer)?1:0.1;
  const raw=[answer-2*step,answer-step,answer,answer+step].map(format);
  const shift=n%4, options=raw.slice(shift).concat(raw.slice(0,shift));
  return {prompt,options,answer:(2-shift+4)%4,explanation};
}
for (const group of groups) for (const [subject, deck, count] of group.entries) {
  for (let i=1;i<=count;i++) {
    const n=i;
    const item=build(group.exam,subject,n);
    const id=`exam-target-20261122-${group.exam}-${String(added.length+1).padStart(4,"0")}`;
    const prompt=`【${group.exam}原創模擬】${item.prompt}`;
    const key=`${group.level}|${subject}|${deck}|${prompt}`;
    if(existingIds.has(id)||existingPrompts.has(key)) throw new Error(`Duplicate item ${id} ${prompt}`);
    existingIds.add(id); existingPrompts.add(key);
    added.push({level:group.level,subject,deck,skill:"素養與情境應用",source:group.source,id,prompt,options:item.options.map(String),answer:item.answer,explanation:item.explanation});
  }
}
if(added.length!==935) throw new Error(`Expected 935 additions, got ${added.length}`);
for(const item of added) if(item.answer<0||item.answer>=item.options.length||new Set(item.options).size!==4) throw new Error(`Invalid choices ${item.id}`);
const end=original.lastIndexOf("\n]");
if(end<0) throw new Error("Unexpected question bank format");
const serialized=added.map(q=>JSON.stringify(q,null,2).split("\n").map(line=>"  "+line).join("\n")).join(",\n");
const updated=JSON.stringify([...bank,...added],null,2)+"\n";
const parsed=JSON.parse(updated);
if(parsed.length!==bank.length+935) throw new Error("Bank size mismatch");
fs.writeFileSync(file,updated);
console.log(`Added ${added.length} original mock questions.`);
