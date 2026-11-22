import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(root, "data", "questions.json");
const original = fs.readFileSync(dataPath, "utf8");
const bank = JSON.parse(original);
const batchNumber = Number(process.argv[2] || 1);
if (!Number.isInteger(batchNumber) || batchNumber < 1) throw new Error("Pass a positive batch number.");
const variantOffset = (batchNumber - 1) * 50;
const batchLabel = String(batchNumber * 2000);
const fmt = n => String(Number(Number(n).toFixed(3)));
const q = (prompt, answer, explanation) => ({ prompt, answer: Number(fmt(answer)), explanation });
const families = [
  ["數學", "學測模擬｜數學 A/B", i => { const a=i+2,d=3,n=i+4,v=n*(2*a+(n-1)*d)/2;return q(`等差數列首項為 ${a}、公差為 ${d}，前 ${n} 項和是多少？`,v,`前 n 項和 = n[2a₁+(n−1)d]/2 = ${n}[2×${a}+(${n}−1)×${d}]/2 = ${fmt(v)}。`); }],
  ["數學", "高三選修｜數列與級數", i => { const a=i+1,n=i%8+2,v=a*2**(n-1);return q(`等比數列首項為 ${a}、公比為 2，第 ${n} 項是多少？`,v,`aₙ = a₁rⁿ⁻¹ = ${a}×2^(${n}−1) = ${v}。`); }],
  ["數學", "高一必修｜直線與圓", i => { const x=i+1,y=2*i-3,dx=i%5+1,m=i%7-3,y2=y+m*dx;return q(`直線通過 P(${x}, ${y}) 與 Q(${x+dx}, ${y2})，斜率是多少？`,m,`斜率 = (${y2}−${y})/(${x+dx}−${x}) = ${m}。`); }],
  ["數學", "數學 A｜微分與導數應用", i => { const a=i+1,b=2*i+3,x=i%9-4,v=2*a*x+b;return q(`若 f(x) = ${a}x² + ${b}x + 1，則 f′(${x}) 為何？`,v,`f′(x) = ${2*a}x + ${b}，代入 x=${x} 得 ${2*a}×${x}+${b}=${v}。`); }],
  ["數學", "數學 A｜積分與面積", i => { const a=i+1,b=i%6+1,n=i%10+1,v=a*n*n/2+b*n;return q(`求直線 y = ${a}x + ${b} 與 x 軸、x=0、x=${n} 所圍區域的面積。`,v,`∫₀^${n}(${a}x+${b})dx = ${a}×${n}²/2 + ${b}×${n} = ${fmt(v)}。`); }],
  ["數學", "高二必修｜機率與條件機率", i => { const r=i+1,n=2*i+5,v=100*(r-1)/(n-1);return q(`袋中有 ${r} 顆紅球、${n-r} 顆白球。不放回抽兩球，已知第一球是紅球，第二球也是紅球的條件機率是多少？（答案以百分比表示）`,v,`第一球為紅球後，剩下 ${r-1} 顆紅球與 ${n-1} 顆球；條件機率 = (${r}−1)/(${n}−1)×100% = ${fmt(v)}%。`); }],
  ["數學", "數學 A｜矩陣與線性方程", i => { const a=i+2,b=i+1,c=3,d=i%8+2,v=a*d-b*c;return q(`矩陣 [[${a}, ${b}], [${c}, ${d}]] 的行列式是多少？`,v,`行列式 = ${a}×${d}−${b}×${c} = ${v}。`); }],
  ["數學", "高一必修｜實數、絕對值與式的運算", i => { const a=i+3,b=2*i+1,v=Math.abs(a-b);return q(`數線上 A 點座標為 ${a}、B 點座標為 ${b}，兩點距離是多少？`,v,`距離 = |${a}−${b}| = ${v}。`); }],
  ["數學", "數學 A｜三角函數", i => { const a=3*(i+1),b=4*(i+1),v=5*(i+1);return q(`直角三角形兩股長為 ${a} 與 ${b}，斜邊長是多少？`,v,`依畢氏定理，斜邊 = √(${a}²+${b}²) = ${v}。`); }],
  ["數學", "數學 A｜指數與對數", i => { const a=i+1,b=i%5+1,v=a+b;return q(`已知 log₂(x) = ${a} 且 log₂(y) = ${b}，則 log₂(xy) 為何？`,v,`對數乘法性質：log₂(xy)=log₂x+log₂y=${a}+${b}=${v}。`); }],

  ["物理", "選修 I｜位置、速度與加速度", i => { const u=i+2,a=i%6+1,t=i%8+2,v=u+a*t;return q(`物體初速 ${u} m/s，以 ${a} m/s² 等加速度運動 ${t} 秒，末速是多少？`,v,`v=u+at=${u}+${a}×${t}=${v} m/s。`); }],
  ["物理", "選修 I｜位置、速度與加速度", i => { const a=Math.floor(i/9)+1,t=i%9+2,v=a*t*t/2;return q(`物體由靜止出發，以 ${a} m/s² 等加速度運動 ${t} 秒，位移是多少？`,v,`s=½at²=½×${a}×${t}²=${fmt(v)} m。`); }],
  ["物理", "選修 I｜平面運動與牛頓定律", i => { const m=i+2,a=i%8+1,v=m*a;return q(`質量 ${m} kg 的物體加速度為 ${a} m/s²，所受合力大小是多少？`,v,`F=ma=${m}×${a}=${v} N。`); }],
  ["物理", "選修 I｜功、能量與動量", i => { const m=2*(i+1),v=i%10+2,e=m*v*v/2;return q(`質量 ${m} kg 的物體以 ${v} m/s 運動，動能是多少？`,e,`K=½mv²=½×${m}×${v}²=${e} J。`); }],
  ["物理", "選修 I｜功、能量與動量", i => { const m1=i+1,m2=2*i+3,u1=2*i+4,v=(m1*u1)/(m1+m2);return q(`質量 ${m1} kg、速率 ${u1} m/s 的物體與靜止的 ${m2} kg 物體完全非彈性碰撞，碰後共同速率是多少？`,v,`動量守恆：${m1}×${u1}=(${m1}+${m2})v，故 v=${fmt(v)} m/s。`); }],
  ["物理", "選修 I｜功、能量與動量", i => { const f=5*(i+1),d=i%12+2,w=f*d;return q(`恆力 ${f} N 沿力的方向使物體移動 ${d} m，該力做功多少？`,w,`W=Fd=${f}×${d}=${w} J。`); }],
  ["物理", "選修 IV｜直流電路與磁場", i => { const r=i+2,current=i%9+1,v=r*current;return q(`電阻 ${r} Ω 通過 ${current} A 電流，兩端電壓是多少？`,v,`依歐姆定律 V=IR=${current}×${r}=${v} V。`); }],
  ["物理", "選修 IV｜電磁感應與交流電", i => { const f=i+1,lam=2*(i+2),v=f*lam;return q(`波長為 ${lam} m、頻率為 ${f} Hz 的波，波速是多少？`,v,`波速 v=fλ=${f}×${lam}=${v} m/s。`); }],
  ["物理", "選修 IV｜電磁感應與交流電", i => { const n=i+2,flux=0.02*(i+1),dt=0.1,v=n*flux/dt;return q(`${n} 匝線圈的磁通量在 ${dt} 秒內均勻改變 ${fmt(flux)} Wb，感應電動勢大小是多少？`,v,`|ε|=N|ΔΦ|/Δt=${n}×${fmt(flux)}/${dt}=${fmt(v)} V。`); }],

  ["化學", "必修｜物質分類、分離與化學計量", i => { const m=i+1,M=10+2*i,mass=m*M;return q(`某物質莫耳質量為 ${M} g/mol，取樣 ${mass} g，其物質的量是多少？`,m,`n=m/M=${mass}/${M}=${m} mol。`); }],
  ["化學", "必修｜水溶液、酸鹼與氧化還原", i => { const c=0.1*(i+1),v=100*(i+1),c2=c/2;return q(`${v} mL、${fmt(c)} M 的溶液稀釋至 ${2*v} mL，末濃度是多少？`,c2,`C₁V₁=C₂V₂，C₂=${fmt(c)}×${v}/${2*v}=${fmt(c2)} M。`); }],
  ["化學", "必修｜水溶液、酸鹼與氧化還原", i => { const p=i+1,c=`1×10⁻${p}`;return q(`25°C 水溶液的 [H⁺] = ${c} M，pH 是多少？`,p,`pH=−log₁₀[H⁺]=−log₁₀(10⁻${p})=${p}。`); }],
  ["化學", "必修｜原子結構與週期性", i => { const z=i+6,a=2*z+i%5+1,n=a-z;return q(`某中性原子的原子序為 ${z}、質量數為 ${a}，中子數是多少？`,n,`中子數=質量數−質子數=${a}−${z}=${n}。`); }],
  ["化學", "選修 III｜化學平衡", i => { const a=(i+1)*0.1,b=(i+2)*0.1,k=b/a;return q(`反應 A ⇌ B 在平衡時 [A]=${fmt(a)} M、[B]=${fmt(b)} M，Kc 為多少？`,k,`Kc=[B]/[A]=${fmt(b)}/${fmt(a)}=${fmt(k)}。`); }],
  ["化學", "必修｜物質分類、分離與化學計量", i => { const p=i+1,v=22.4*p;return q(`在標準狀態下，${p} mol 理想氣體體積約為多少公升？`,v,`標準狀態下 1 mol 理想氣體約占 22.4 L，因此 V=22.4×${p}=${fmt(v)} L。`); }],
  ["化學", "選修 IV｜電化學與電解", i => { const I=2*(i+1),t=965*(i+1),m=0.000329*I*t;return q(`以 ${I} A 電流電解 Cu²⁺ 溶液 ${t} 秒，取 F=96500 C/mol、Cu=63.5 g/mol，析出銅約多少克？`,m,`Cu²⁺需 2 mol 電子；m=ItM/(2F)≈${fmt(m)} g。`); }],

  ["生物", "必修｜遺傳與中心法則基礎", i => { const n=4*(i+1),v=n/4;return q(`Aa × Aa 交配，若有 ${n} 名子代，隱性表現型的理論期望人數是多少？`,v,`Aa×Aa 的 aa 比率為 1/4；期望人數=${n}×1/4=${v}。`); }],
  ["生物", "必修｜遺傳與中心法則基礎", i => { const a=10+i,g=5+i,total=2*(a+g),v=g;return q(`一段雙股 DNA 共 ${total} 個核苷酸，其中 A 有 ${a} 個；依互補配對原則，G 有多少個？`,v,`A=T，因此 G+C=${total}−2×${a}；又 G=C，故 G=${v}。`); }],
  ["生物", "選修 IV｜族群、群集、生態系與環境", i => { const marked=20+2*i,sample=40+i%10,recap=10,v=marked*sample/recap;return q(`標放再捕法中首次標記 ${marked} 隻，第二次捕獲 ${sample} 隻，其中 ${recap} 隻有標記，估計族群數是多少？`,v,`N≈MC/R=${marked}×${sample}/${recap}=${fmt(v)} 隻。`); }],
  ["生物", "必修｜細胞構造、膜與能量", i => { const side=i+1,v=6/side;return q(`邊長 ${side} cm 的立方體細胞模型，其表面積與體積比 S/V 為多少 cm⁻¹？`,v,`S/V=6a²/a³=6/a=6/${side}=${fmt(v)} cm⁻¹。`); }],
  ["生物", "選修 I｜細胞代謝、呼吸與光合", i => { const gross=20+2*i,resp=3+i%6,v=gross-resp;return q(`某植物每小時光合作用總產氧量為 ${gross} mL、呼吸作用耗氧量為 ${resp} mL，淨釋氧量是多少？`,v,`淨釋氧量=總產氧量−呼吸耗氧量=${gross}−${resp}=${v} mL。`); }],
  ["生物", "選修 III｜神經、內分泌與防禦免疫", i => { const c=1024+128*i,t=i%10+1,v=c/2**t;return q(`某抗體濃度初始為 ${c} 單位，半衰期為 1 天，經過 ${t} 天後剩多少單位？`,v,`經過 ${t} 個半衰期，剩餘量=${c}/2^${t}=${fmt(v)} 單位。`); }],
  ["生物", "選修 IV｜族群、群集、生態系與環境", i => { const p=(i+1)/100,qfreq=1-p,hetero=2*p*qfreq;return q(`某族群中等位基因 A 頻率 p=${fmt(p)}、a 頻率 q=${fmt(qfreq)}，符合哈溫平衡時異型合子頻率是多少？（答案以百分比表示）`,100*hetero,`異型合子頻率=2pq=2×${fmt(p)}×${fmt(qfreq)}=${fmt(100*hetero)}%。`); }],

  ["地球科學", "必修｜固體地球、板塊與地質紀錄", i => { const speed=i+2,years=i%9+1,v=speed*years*10;return q(`板塊以 ${speed} cm/年移動 ${years} 百萬年，累積位移約多少公里？`,v,`每 1 cm/年持續 100 萬年約移動 10 km；位移=${speed}×${years}×10=${v} km。`); }],
  ["地球科學", "必修｜固體地球、板塊與地質紀錄", i => { const d=100+10*i,vp=6,vs=3,t=d*(1/vs-1/vp);return q(`地震 P 波速率為 ${vp} km/s、S 波速率為 ${vs} km/s，兩波到時差為 ${fmt(t)} 秒，震源距測站約多少公里？`,d,`到時差 Δt=d(1/Vs−1/Vp)，故 d=${fmt(t)}/(1/3−1/6)=${d} km。`); }],
  ["地球科學", "必修｜大氣、海洋與氣候", i => { const sat=20+2*i,actual=(i+1)*0.2,v=100*actual/sat;return q(`空氣飽和水氣量為 ${sat} g/m³、實際水氣量為 ${fmt(actual)} g/m³，相對溼度是多少百分比？`,v,`相對溼度=實際水氣量/飽和水氣量×100%=${fmt(actual)}/${sat}×100%=${fmt(v)}%。`); }],
  ["地球科學", "選修｜地層、化石與定年", i => { const half=100+20*i,n=i%6+1,remaining=100/2**n,age=half*n;return q(`放射性同位素半衰期為 ${half} 年，樣本剩餘 ${fmt(remaining)}%，估計經過多少年？`,age,`剩餘比例 ${fmt(remaining)}% = (1/2)^${n}；經過 ${n} 個半衰期，年代=${half}×${n}=${age} 年。`); }],
  ["地球科學", "選修｜赫羅圖、恆星演化與星系", i => { const d=i+2,v=1/(d*d);return q(`若觀測距離增為原來的 ${d} 倍，恆星本徵光度不變，接收通量成為原來的幾分之幾？`,v,`通量與距離平方成反比，比例=1/${d}²=${fmt(v)}。`); }],
  ["地球科學", "選修｜大氣熱力學、斜溫圖與天氣分析", i => { const t=30+i,h=i%5+1,v=t-10*h;return q(`未飽和氣塊由地面 ${t}°C 上升 ${h} km，依乾絕熱直減率 10°C/km，溫度約為多少？`,v,`溫度下降 10×${h}=${10*h}°C；末溫=${t}−${10*h}=${v}°C。`); }],

  ["地理", "分科模擬｜地理", i => { const area=20+i,pop=area*(300+5*i),v=pop/area;return q(`某地區面積 ${area} km²、人口 ${pop} 人，人口密度是多少人/km²？`,v,`人口密度=人口/面積=${pop}/${area}=${v} 人/km²。`); }],
  ["公民與社會", "分科模擬｜公民", i => { const income=10000+1000*i,rate=5+i%16,v=income*rate/100;return q(`應稅所得為 ${income} 元，假設適用單一稅率 ${rate}%，應納稅額是多少元？`,v,`稅額=應稅所得×稅率=${income}×${rate}%=${v} 元。`); }],
  ["歷史", "分科模擬｜歷史", i => { const year1=1200+20*i,year2=year1+30+i;return q(`若某事件發生於西元 ${year1} 年，另一事件發生於西元 ${year2} 年，兩者相隔幾年？`,year2-year1,`相隔年數=${year2}−${year1}=${year2-year1} 年。`); }],
  ["英文", "學測模擬｜英文", i => { const entries=[["scarce","limited in amount"],["accurate","correct and exact"],["maintain","keep in good condition"],["reveal","make something known"],["prevent","stop something from happening"],["approach","a way of dealing with something"],["benefit","a good result or advantage"],["consume","use up"],["indicate","show or suggest"],["require","need something"],["adapt","change to suit new conditions"],["establish","set up or prove"],["significant","important or large enough to matter"],["available","ready for use"],["obvious","easy to see or understand"],["reduce","make smaller in amount"],["expand","become larger"],["respond","answer or react"],["analyze","examine in detail"],["contribute","give or add something"],["efficient","working well without waste"],["essential","completely necessary"],["previous","happening before"],["specific","clearly identified or exact"],["temporary","lasting for a limited time"],["assume","accept something as true without proof"],["achieve","succeed in doing something"],["compare","examine similarities and differences"],["determine","find out or decide"],["emerge","appear or become known"],["enable","make something possible"],["occur","happen"],["persuade","cause someone to agree or act"],["recognize","identify from previous knowledge"],["remain","continue to be"],["remove","take away"],["replace","put something else in its place"],["represent","stand for or describe"],["suggest","put forward an idea"],["vary","be different or change"],["confirm","show that something is true"],["decline","become smaller or refuse"],["depend","be decided by something else"],["distribute","give or spread among people"],["encourage","give support or confidence"],["examine","inspect carefully"],["increase","become greater"],["influence","affect how something develops"],["observe","watch or notice"],["provide","make something available"],["acquire","gain or obtain"],["allocate","distribute for a particular purpose"],["cease","come to an end"],["compensate","make up for a loss"],["conduct","organize or carry out"],["consecutive","following one after another"],["conventional","following what is generally accepted"],["controversial","causing public disagreement"],["crucial","extremely important"],["dedicate","give time or effort to a purpose"],["demonstrate","show clearly with evidence"],["diverse","including many different kinds"],["domestic","relating to a home or one country"],["eliminate","remove completely"],["encounter","meet or experience"],["exceed","be greater than a limit"],["flexible","able to change or adapt"],["frequent","happening often"],["generate","produce or create"],["implement","put a plan into action"],["inhibit","slow down or prevent"],["interpret","explain the meaning of"],["justify","show a good reason for"],["modify","change slightly"],["negotiate","discuss to reach an agreement"],["obtain","get or acquire"],["precise","exact and accurate"],["prohibit","officially forbid"],["reliable","able to be trusted"],["reluctant","unwilling or hesitant"],["restore","bring back to an earlier condition"],["retain","continue to have or keep"],["sufficient","enough for a purpose"],["transform","change greatly in form"],["undergo","experience or be subjected to"],["valid","based on sound reasoning or evidence"],["widespread","existing over a large area"],["ambiguous","having more than one possible meaning"],["anticipate","expect something to happen"],["collapse","fall down or fail suddenly"],["derive","obtain something from a source"],["diminish","become smaller or less important"],["expose","make visible or leave unprotected"],["imitate","copy the behavior or appearance of"],["persist","continue despite difficulty"],["scarcity","a shortage of something"],["substitute","use one thing in place of another"],["abstract","existing as an idea rather than a physical object"],["accumulate","gather or collect over time"],["acknowledge","accept or admit that something is true"],["advocate","publicly support an idea"],["alter","change or modify"],["assess","judge the quality or importance of"],["attain","succeed in reaching a goal"],["authority","the power or right to give orders"],["clarify","make an idea easier to understand"],["compile","collect information into one source"],["comprehensive","including all or nearly all details"],["conceive","form an idea or plan"],["considerable","large enough to be noticed"],["constrain","limit or restrict"],["consult","seek advice or information"],["convert","change from one form to another"],["cooperate","work together toward a shared goal"],["correspond","match or be similar"],["criteria","standards used to make a judgment"],["debate","a formal discussion of opposing views"],["detect","discover or notice something"],["devise","plan or invent a method"],["distinct","clearly different"],["element","a basic part of something"],["estimate","calculate approximately"],["evaluate","judge after careful study"],["evidence","information that supports a conclusion"],["exclude","leave out or prevent from entering"],["facilitate","make an action easier"],["framework","a basic structure for organizing ideas"],["identify","recognize or name"],["illustrate","explain with examples"],["imply","suggest without stating directly"],["incorporate","include as part of a whole"],["insight","a clear understanding of a situation"],["isolate","separate from others"],["outcome","the result of an action"],["participate","take part in an activity"],["perceive","notice or understand"],["potential","possible but not yet actual"],["principle","a basic rule or belief"],["prior","coming before in time"],["promote","support or encourage development"],["pursue","continue trying to achieve"],["range","the limits or extent of something"],["regulate","control according to a rule"],["relevant","closely connected to the topic"],["resolve","find a solution to"],["resource","a useful supply or source"],["strategy","a plan for achieving a goal"],["structure","the way parts are arranged"],["trend","a general direction of change"],["ultimate","final or most important"],["unique","being the only one of its kind"],["whereas","while in contrast"]];const [word,definition]=entries[i];const distractors=[entries[(i+7)%50][0],entries[(i+19)%50][0],entries[(i+31)%50][0]];const shift=i%4;const options=[word,...distractors];return {prompt:`Choose the word closest in meaning to “${word}”: ${definition}.`,answerIndex:(4-shift)%4,options:options.slice(shift).concat(options.slice(0,shift)),explanation:`“${word}” means ${definition}.`}; }],
  ["英文", "學測模擬｜英文", i => { const n=i+1,correct=i%2===0?"has":"have",subj=i%2===0?`The collection of research papers from archive box ${n}`:`The research papers in archive box ${n}`;return {prompt:`Choose the verb that agrees with the subject: “${subj} ______ been updated this year.”`,answerIndex:0,options:[correct,correct==="has"?"have":"has","were","are"],explanation:`Match the verb to the grammatical head: “collection” is singular; “papers” is plural. The correct form here is “${correct}.”`}; }],
];

const knownIds = new Set(bank.map(item => item.id));
const added = [];
for (let familyIndex=0; familyIndex<families.length; familyIndex++) {
  const [subject,deck,make] = families[familyIndex];
  const count=familyIndex<20?46:45;
  for (let localIndex=0;localIndex<count;localIndex++) {
    const i=localIndex+variantOffset;
    const item=make(i);
    const id=`batch-20261122-${batchLabel}-${String(added.length+1).padStart(4,"0")}`;
    if (knownIds.has(id)) throw new Error(`Duplicate id ${id}`);
    const options = item.options || (() => {
      const step=Number.isInteger(item.answer)?1:(Math.abs(item.answer)<1?0.1:0.5);
      return [item.answer-2*step,item.answer-step,item.answer,item.answer+step].map(fmt);
    })();
    let answerIndex = item.answerIndex;
    if (answerIndex === undefined) {
      const correct = item.options ? String(item.answer) : fmt(item.answer);
      const correctIndex=options.findIndex(value=>String(value)===correct);
      if (correctIndex<0) throw new Error(`Correct choice missing: ${id}`);
      const shift=i%4;
      const rotated=options.slice(shift).concat(options.slice(0,shift));
      answerIndex=(correctIndex-shift+options.length)%options.length;
      item.options=rotated;
    }
    if (!Array.isArray(item.options) && !item.options) item.options=options;
    if (item.options.length<4 || new Set(item.options.map(String)).size!==item.options.length || answerIndex<0 || answerIndex>=item.options.length) throw new Error(`Invalid answer choices: ${id}`);
    added.push({level:"高中",subject,deck,skill:"情境應用",source:"Knovatrix 原創練習題（非歷屆原題）",id,prompt:`【原創練習】${item.prompt}`,options:item.options.map(String),answer:answerIndex,explanation:item.explanation});
  }
}
if (added.length!==2000) throw new Error(`Expected exactly 2000 items, got ${added.length}`);
const promptKeys=new Set(bank.map(item=>`${item.subject}|${item.deck}|${item.prompt}`));
for (const item of added) {const key=`${item.subject}|${item.deck}|${item.prompt}`;if(promptKeys.has(key))throw new Error(`Duplicate prompt: ${key}`);promptKeys.add(key);}
const at=original.lastIndexOf("\n]");
if(at<0)throw new Error("Unexpected JSON layout");
const serialized=added.map(item=>JSON.stringify(item,null,2).split("\n").map(line=>"  "+line).join("\n")).join(",\n");
const updated=original.slice(0,at)+",\n"+serialized+"\n]\n";
if(JSON.parse(updated).length!==bank.length+2000)throw new Error("Final bank size mismatch");
fs.writeFileSync(dataPath,updated);
console.log(`Added ${added.length} original practice questions across ${families.length} high-school topic families.`);
