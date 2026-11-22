import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(root, "data", "questions.json");
const original = fs.readFileSync(dataPath, "utf8");
const bank = JSON.parse(original);
const fmt = n => String(Number(Number(n).toFixed(3)));
const item = (prompt, answer, explanation) => ({ prompt, answer: Number(fmt(answer)), explanation });
const gcd = (a,b) => b ? gcd(b,a%b) : Math.abs(a);
const choose = (n,k) => { let v=1; for(let j=1;j<=k;j++) v=v*(n-j+1)/j; return v; };
const families = [
  ["資優數學主題","先修｜整除、質數與同餘",i=>{const n=i+1,a=12*n+7,b=18*n+11,v=gcd(a,b);return item(`求 ${a} 與 ${b} 的最大公因數。`,v,`輾轉相除法：${a}=${Math.floor(a/b)}×${b}+${a%b}，再反覆取餘數可得最大公因數 ${v}。`);} ],
  ["資優數學主題","先修｜整除、質數與同餘",i=>{const n=i+1,m=7+n%13,a=11*n+5,v=a%m;return item(`將 ${a} 除以 ${m}，所得餘數是多少？`,v,`${a}=${Math.floor(a/m)}×${m}+${v}，餘數為 ${v}。`);} ],
  ["資優數學主題","先修｜整除、質數與同餘",i=>{const n=i+1,b=2+n%7,m=9+n%11;let v=1;for(let j=0;j<n;j++)v=v*b%m;return item(`求 ${b} 的 ${n} 次方除以 ${m} 的餘數。`,v,`逐次取模計算：${b}^${n} ≡ ${v} (mod ${m})。`);} ],
  ["資優數學主題","先修｜整除、質數與同餘",i=>{const n=i+1,a=n,b=n%5+2,v=(a+1)*(b+1);return item(`正整數 N = 2^${a} × 3^${b}，N 的正因數共有幾個？`,v,`若 N = p^a q^b，正因數個數為 (a+1)(b+1)；此處為 (${a}+1)(${b}+1)=${v}。`);} ],
  ["資優數學主題","先修｜整除、質數與同餘",i=>{const n=10+i,v=Array.from({length:n+1},(_,x)=>x).filter(x=>2*x+3*(n-x)===n).length;let sols=[];for(let x=0;x<=n;x++)for(let y=0;y<=n;y++)if(2*x+3*y===n)sols.push([x,y]);return item(`非負整數 x、y 滿足 2x+3y=${n}，共有幾組解？`,sols.length,`逐一令 y=0,1,…,⌊${n}/3⌋，檢查 ${n}−3y 是否為非負偶數，共有 ${sols.length} 組。`);} ],
  ["資優數學主題","先修｜多項式、方程與不等式",i=>{const n=i+1,x=n%9-4,a=n%5+2,b=n%7-3,v=a*x*x+b*x+1;return item(`多項式 P(x)=${a}x²+${b}x+1，求 P(${x})。`,v,`代入 x=${x}：${a}×(${x})²+${b}×(${x})+1=${v}。`);} ],
  ["資優數學主題","先修｜多項式、方程與不等式",i=>{const n=i+1,a=n+2,b=2*n+1,r=a-b;return item(`多項式 f(x)=x²+${a}x+${b} 除以 x−1，餘數是多少？`,1+a+b,`餘式定理：餘數為 f(1)=1+${a}+${b}=${1+a+b}。`);} ],
  ["資優數學主題","先修｜多項式、方程與不等式",i=>{const n=i+1,a=n+2,b=2*n+3,v=a+b;return item(`一元二次方程 x²−${v}x+${a*b}=0 的兩根和是多少？`,v,`依韋達定理，兩根和為 −(−${v})/1=${v}。`);} ],
  ["資優數學主題","先修｜多項式、方程與不等式",i=>{const n=i+1,x=n+2,v=2*x+1;return item(`若 3x+2y=${3*x+2*(x+1)} 且 x−y=−1，則 x+y 為何？`,v,`由 x−y=−1 得 y=x+1；代入第一式可得 x=${x}、y=${x+1}，所以 x+y=${v}。`);} ],
  ["資優數學主題","先修｜函數、數列與遞迴",i=>{const n=i+1,a=n+1,d=n%8+2,k=n%12+5,v=k*a+d*k*(k-1)/2;return item(`等差數列首項為 ${a}、公差為 ${d}，前 ${k} 項和是多少？`,v,`Sₖ=k a₁+d·k(k−1)/2=${k}×${a}+${d}×${k}×${k-1}/2=${v}。`);} ],
  ["資優數學主題","先修｜函數、數列與遞迴",i=>{const n=i+1,a=n+1,b=n%5+2,k=8;let x=a,y=b;for(let j=3;j<=k;j++){[x,y]=[y,x+y];}return item(`數列滿足 a₁=${a}、a₂=${b}、aₙ=aₙ₋₁+aₙ₋₂，求 a₈。`,y,`依遞迴逐項計算：${a}, ${b}, …，第 8 項為 ${y}。`);} ],
  ["資優數學主題","先修｜函數、數列與遞迴",i=>{const n=i+1,a=n+2,b=n%6+2,x=n%11-5,v=a*x+b;return item(`函數 f(x)=${a}x+${b}，求 f(${x})。`,v,`f(${x})=${a}×${x}+${b}=${v}。`);} ],
  ["資優數學主題","先修｜三角形、圓與相似",i=>{const n=i+1,k=n+1,a=3*k,b=4*k,v=5*k;return item(`直角三角形兩股長為 ${a}、${b}，斜邊長是多少？`,v,`畢氏定理：c=√(${a}²+${b}²)=√(${a*a+b*b})=${v}。`);} ],
  ["資優數學主題","先修｜三角形、圓與相似",i=>{const n=i+1,r=n+2,s=2*r,areaRatio=(s/r)**2;return item(`兩相似三角形對應邊長比為 1:${s/r}，小三角形面積為 ${r*r}，大三角形面積是多少？`,r*r*areaRatio,`面積比等於邊長比平方：1:(${s/r})²；大三角形面積=${r*r}×${areaRatio}=${r*r*areaRatio}。`);} ],
  ["資優數學主題","先修｜三角形、圓與相似",i=>{const n=i+1,sides=n+3,v=(sides-2)*180;return item(`正 ${sides} 邊形的內角和是多少度？`,v,`內角和=(n−2)×180°=(${sides}−2)×180°=${v}°。`);} ],
  ["資優數學主題","先修｜排列組合與機率",i=>{const n=i+1,a=n+2,b=n%7+3,k=4,v=choose(a,k);return item(`從 ${a} 位學生中選出 ${k} 位組成小組，有幾種選法？`,v,`不計順序，選法為 C(${a},${k})=${v}。`);} ],
  ["資優數學主題","先修｜排列組合與機率",i=>{const n=i+1,r=n%8+2,b=2*n+7;const v=100*r*(r-1)/(b*(b-1));return item(`袋中有 ${r} 顆紅球與 ${b-r} 顆藍球，不放回連抽兩球，兩球皆紅的機率是多少百分比？`,v,`機率=${r}/${b}×(${r}−1)/(${b}−1)=${fmt(v)}%。`);} ],
  ["資優數學主題","先修｜排列組合與機率",i=>{const n=i+1,k=n+1,v=k+1;return item(`至少要從 ${k} 種顏色的球中取幾顆，才能保證有兩顆同色？`,v,`最壞情況先取 ${k} 顆、每色各一顆；再取一顆必與其中一色重複，共 ${k+1} 顆。`);} ],
  ["資優數學主題","進階｜不定方程與數論函數",i=>{const n=i+1,a=n+4,b=n+7,d=gcd(a,b),v=d===1?1:0;return item(`判斷 ${a}x+${b}y=1 是否有整數解；有解填 1，無解填 0。`,v,`gcd(${a},${b})=${d}。線性不定方程 ax+by=1 有整數解的充要條件是 gcd(a,b)=1，因此本題答案為 ${v}。`);} ],
  ["資優數學主題","進階｜不定方程與數論函數",i=>{const n=i+1,a=n%9+2,b=n%7+2,v=a*b;return item(`正整數 m、n 互質且 mn=${v}。若 m=${a}，n 為何？`,b,`由 mn=${v} 且 m=${a}，得 n=${v}/${a}=${b}；gcd(${a},${b})=1。`);} ],
  ["資優數學主題","進階｜不等式與函數方程",i=>{const n=i+1,a=n+2,v=2*a;return item(`正數 x、y 滿足 xy=${a*a}，求 x+y 的最小值。`,v,`由 AM-GM，x+y≥2√(xy)=2√(${a*a})=${v}，等號於 x=y=${a} 成立。`);} ],
  ["資優數學主題","進階｜不等式與函數方程",i=>{const n=i+1,a=n+2,x=a+1,v=x*x-a*a;return item(`函數 f(x)=x²−${a}²，求 f(${x})−f(${a})。`,v,`f(${x})−f(${a})=(${x}²−${a}²)−0=${v}。`);} ],
  ["資優數學主題","進階｜幾何變換與軌跡",i=>{const n=i+1,x=n-20,y=2*n-30,dx=n%9+1,v=(x+dx)**2+y*y;return item(`點 P(${x},${y}) 平移向量 (${dx},0) 到 Q，原點到 Q 的距離平方是多少？`,v,`Q=(${x+dx},${y})，OQ²=(${x+dx})²+(${y})²=${v}。`);} ],
  ["資優數學主題","進階｜幾何變換與軌跡",i=>{const n=i+1,a=n+3,v=2*a;return item(`線段 AB 長 ${a}，以其中點為中心旋轉 180° 後，A 點到其像點 A′ 的距離是多少？`,v,`中點到 A 的距離為 ${a}/2；旋轉 180° 後像點在另一側，因此 AA′=${a}。`);} ],
  ["資優數學主題","進階｜圖論、遞迴與不變量",i=>{const n=i+1,v=3*n;return item(`一個圖有 ${n+2} 個頂點，其中每個頂點的度數總和為 ${6*n}。依握手定理，邊數是多少？`,v,`所有頂點度數總和=2|E|，所以邊數=${6*n}/2=${v}。`);} ],
  ["資優數學主題","進階｜圖論、遞迴與不變量",i=>{const n=i+1,k=n+3,v=choose(k+2,2);return item(`棋盤每一步只能向右或向上移動，從 (0,0) 到 (${k},2) 共有幾條最短路徑？`,v,`最短路徑共 ${k+2} 步，其中選 2 步向上：C(${k+2},2)=${v}。`);} ],

  ["資優自然主題","物理｜進階力學與能量",i=>{const n=i+1,m=n+2,a=n%8+2,f=m*a;return item(`質量 ${m} kg 的物體受水平推力 ${f+3} N 與反向摩擦力 3 N，合力造成的加速度是多少？`,a,`合力=${f+3}−3=${f} N；a=F/m=${f}/${m}=${a} m/s²。`);} ],
  ["資優自然主題","物理｜進階力學與能量",i=>{const n=i+1,u=n+1,t=n%8+2,v=u+10*t;return item(`物體以 ${u} m/s 向下運動，之後自由落下 ${t} 秒，取 g=10 m/s²，末速是多少？`,v,`v=u+gt=${u}+10×${t}=${v} m/s。`);} ],
  ["資優自然主題","物理｜熱學、流體與氣體",i=>{const n=i+1,m=n+2,v=2*m;return item(`液體密度為 2 g/cm³，體積 ${m} cm³，質量是多少？`,v,`m=ρV=2×${m}=${v} g。`);} ],
  ["資優自然主題","物理｜熱學、流體與氣體",i=>{const n=i+1,m1=n+1,t1=20+n%15,m2=n+3,t2=40+n%20,v=(m1*t1+m2*t2)/(m1+m2);return item(`兩份相同液體比熱、無熱散失混合：${m1} g、${t1}°C 與 ${m2} g、${t2}°C，平衡溫度是多少 °C？`,v,`熱平衡：m₁(T−t₁)=m₂(t₂−T)，故 T=(${m1}×${t1}+${m2}×${t2})/(${m1}+${m2})=${fmt(v)}°C。`);} ],
  ["資優自然主題","物理｜波動、光學與電磁",i=>{const n=i+1,f=n+2,lam=n%9+2,v=f*lam;return item(`頻率 ${f} Hz、波長 ${lam} m 的波，傳播速率是多少？`,v,`v=fλ=${f}×${lam}=${v} m/s。`);} ],
  ["資優自然主題","物理｜波動、光學與電磁",i=>{const n=i+1,r=n+4,I=n%7+2,v=I*I*r;return item(`電阻 ${r} Ω 通過 ${I} A 電流，電功率是多少？`,v,`P=I²R=${I}²×${r}=${v} W。`);} ],
  ["資優自然主題","化學｜定量化學與氣體",i=>{const n=i+1,m=n+2,M=12*n+16,v=m*M;return item(`某化合物莫耳質量為 ${M} g/mol，取 ${v} g，物質的量是多少 mol？`,m,`n=m/M=${v}/${M}=${m} mol。`);} ],
  ["資優自然主題","化學｜定量化學與氣體",i=>{const n=i+1,v=n+3,m=n+1,c=m/v;return item(`${v} L 溶液含溶質 ${m} mol，莫耳濃度是多少 M？`,c,`C=n/V=${m}/${v}=${fmt(c)} M。`);} ],
  ["資優自然主題","化學｜酸鹼、氧化還原與平衡",i=>{const n=i+1,c=0.01*(n+1),vol=0.05,v=c*vol;return item(`${vol} L、${fmt(c)} M 的一元酸溶液加水稀釋至 1 L，末濃度是多少 M？`,v,`C₁V₁=C₂V₂，C₂=${fmt(c)}×${vol}/1=${fmt(v)} M。`);} ],
  ["資優自然主題","化學｜酸鹼、氧化還原與平衡",i=>{const n=i+1,c=0.1*(n+1),acidVol=10,baseC=0.1,v=c*acidVol/baseC;return item(`${acidVol} mL、${fmt(c)} M 的一元酸以 0.1 M NaOH 滴定至中和，需 NaOH 幾 mL？`,v,`一元酸鹼中和時 CₐVₐ=CᵦVᵦ；Vᵦ=${fmt(c)}×${acidVol}/0.1=${fmt(v)} mL。`);} ],
  ["資優自然主題","化學｜未知物鑑別",i=>{const n=i+1,m=n+1;return item(`未知溶液加入硝酸銀後生成白色沉澱；若另取 ${m} mL 樣品以蒸發法確認溶質質量為 ${2*m} mg，質量濃度是多少 mg/mL？`,2,`質量濃度=溶質質量/溶液體積=${2*m}/${m}=2 mg/mL。鑑別操作應分取樣品並記錄觀察。`);} ],
  ["資優自然主題","化學｜未知物鑑別",i=>{const n=i+1,s=n+2,v=s*3;return item(`鑑別實驗中，${s} 種待測離子各需做 3 種獨立確認反應，至少要安排幾次反應？`,v,`每種離子做 3 種確認反應，總數=${s}×3=${v} 次；實際操作仍需設置空白與陽性對照。`);} ],
  ["資優自然主題","生物｜顯微、遺傳與生理實驗",i=>{const n=i+1,cal=n+2,div=2*(n%6+2),v=cal/div;return item(`以物測微尺校正後，目測微尺 ${div} 格相當於 ${cal} μm；樣本長 ${div*5} 格，實際長度是多少 μm？`,5*cal,`每格=${cal}/${div} μm；樣本長度=${div*5}×(${cal}/${div})=${5*cal} μm。`);} ],
  ["資優自然主題","生物｜顯微、遺傳與生理實驗",i=>{const n=i+1,parents=4*(n+2),v=parents/4;return item(`單因子完全顯性遺傳中，Aa×Aa 產生 ${parents} 個子代，理論上隱性表現型子代數是多少？`,v,`aa 機率為 1/4，期望數=${parents}×1/4=${v}。`);} ],
  ["資優自然主題","地科｜地質、氣象與天文推理",i=>{const n=i+1,speed=n+2,years=n%8+1,km=speed*years*10;return item(`板塊以 ${speed} cm/年移動 ${years} 百萬年，累積位移約多少公里？`,km,`1 cm/年持續 100 萬年約移動 10 km；位移=${speed}×${years}×10=${km} km。`);} ],
  ["資優自然主題","地科｜地質、氣象與天文推理",i=>{const n=i+1,vp=6,vs=3,dt=n+2,d=dt/(1/vs-1/vp);return item(`測得 S 波比 P 波晚 ${dt} 秒抵達；已知 P 波速率 6 km/s、S 波速率 3 km/s，震源距測站約多少公里？`,d,`Δt=d(1/Vs−1/Vp)，故 d=${dt}/(1/3−1/6)=${fmt(d)} km。`);} ],
  ["資優自然主題","跨科｜誤差分析與不確定度",i=>{const n=i+1,truev=20+3*n,meas=truev+(n%2?2:-2),err=100*Math.abs(meas-truev)/truev;return item(`真值為 ${truev}，測量值為 ${meas}，百分誤差是多少？（四捨五入至小數第 2 位）`,err,`百分誤差=|測量值−真值|/真值×100%=|${meas}−${truev}|/${truev}×100%=${fmt(err)}%。`);} ],
  ["資優自然主題","跨科｜誤差分析與不確定度",i=>{const n=i+1,base=10*n,delta=n%4+1,v=base;return item(`同一長度重複量測 ${n+2} 次，讀值分別為 ${base-delta}、${base}、${base+delta}（其餘讀值皆為 ${base}），平均值是多少？`,v,`偏低與偏高各 ${delta} 的讀值互相抵消，平均值仍為 ${base}。`);} ],
  ["資優自然主題","跨科｜誤差分析與不確定度",i=>{const n=i+1,step=n%9+1,lo=10*n,hi=lo+step,v=step/2;return item(`某量測值報告為 ${lo} 至 ${hi}，以區間半寬表示其不確定度，是多少？`,v,`區間半寬=(${hi}−${lo})/2=${fmt(v)}。`);} ],
  ["資優自然主題","跨科｜科學閱讀、圖表與實驗設計",i=>{const n=i+1,groups=n+2,reps=n%4+3,v=groups*reps;return item(`實驗有 ${groups} 組處理條件，每組重複 ${reps} 次，最少需要幾筆觀測資料？`,v,`觀測資料筆數=${groups}×${reps}=${v}；重複測量有助辨認偶然變異。`);} ],
  ["資優自然主題","跨科｜科學閱讀、圖表與實驗設計",i=>{const n=i+1,treat=n%5+2,control=treat+1,each=n+3,v=each*(treat+control);return item(`設 ${treat} 個處理組與 ${control} 個對照組，每組各觀察 ${each} 個樣本，總樣本數是多少？`,v,`總樣本數=(${treat}+${control})×${each}=${v}。`);} ],
];

if(families.length!==47) throw new Error(`Expected 47 question families; found ${families.length}`);
const knownIds=new Set(bank.map(x=>x.id));
const knownPrompts=new Set(bank.map(x=>`${x.level}|${x.subject}|${x.deck}|${x.prompt}`));
const added=[];
for(let f=0;f<families.length;f++){
  const [subject,deck,make]=families[f];
  if(!bank.some(x=>x.level==="國中資優"&&x.subject===subject&&x.deck===deck)) throw new Error(`Unknown unit: ${subject} ${deck}`);
  const familyCount=f<26?43:42;
  for(let i=0;i<familyCount;i++){
    const row=make(i),id=`junior-gifted-growth-20261122-${String(added.length+1).padStart(4,"0")}`;
    const p=`【國中資優原創】${row.prompt}`;
    const promptKey=`國中資優|${subject}|${deck}|${p}`;
    if(knownIds.has(id)||knownPrompts.has(promptKey)) throw new Error(`Duplicate question: ${id}`);
    knownIds.add(id);knownPrompts.add(promptKey);
    if(!Number.isFinite(row.answer)) throw new Error(`Invalid answer: ${id}`);
    const step=Number.isInteger(row.answer)?1:(Math.abs(row.answer)<1?0.1:0.5);
    const raw=[row.answer-2*step,row.answer-step,row.answer,row.answer+step].map(fmt);
    const shift=i%4,options=raw.slice(shift).concat(raw.slice(0,shift));
    const answer=(2-shift+4)%4;
    added.push({level:"國中資優",subject,deck,skill:subject==="資優數學主題"?"競賽思維":"資優探究",source:"Knovatrix 國中資優原創練習（非歷屆原題）",id,prompt:p,options,answer,explanation:row.explanation});
  }
}
if(added.length!==2000)throw new Error(`Expected 2000 questions; got ${added.length}`);
const at=original.lastIndexOf("\n]");
if(at<0)throw new Error("Unexpected JSON layout");
const serialized=added.map(x=>JSON.stringify(x,null,2).split("\n").map(line=>"  "+line).join("\n")).join(",\n");
const output=original.slice(0,at)+",\n"+serialized+"\n]\n";
if(JSON.parse(output).length!==bank.length+2000)throw new Error("Question count mismatch");
fs.writeFileSync(dataPath,output);
console.log(`Added ${added.length} junior gifted questions across ${families.length} problem families.`);
