import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root=path.dirname(fileURLToPath(import.meta.url));
const dataPath=path.join(root,"data","questions.json");
const original=fs.readFileSync(dataPath,"utf8");
const bank=JSON.parse(original);
const fmt=n=>String(Number(Number(n).toFixed(3)));
const make=(prompt,answer,explanation)=>({prompt,answer:Number(fmt(answer)),explanation});
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
const choose=(n,k)=>{let v=1;for(let j=1;j<=k;j++)v=v*(n-j+1)/j;return v;};
const families=[
 ["高中數學競賽高階理論","先修｜整除、質數與同餘",i=>{const n=i+1,b=n%7+5,m=n%13+17;let r=1;for(let j=0;j<n;j++)r=r*b%m;return make(`求 ${b} 的 ${n} 次方除以 ${m} 的餘數。`,r,`反覆取模計算可得 ${b}^${n} ≡ ${r} (mod ${m})。`);} ],
 ["高中數學競賽高階理論","先修｜多項式、方程與不等式",i=>{const n=i+1,a=n+3,b=2*n+5;return make(`方程 x²−${a+b}x+${a*b}=0 的兩根和是多少？`,a+b,`依韋達定理，兩根和=−(−${a+b})/1=${a+b}。`);} ],
 ["高中數學競賽高階理論","先修｜函數、數列與遞迴",i=>{const n=i+1,a=n+1,b=n%5+2;let x=a,y=b;for(let j=3;j<=10;j++)[x,y]=[y,x+y];return make(`數列滿足 a₁=${a}、a₂=${b}、aₙ=aₙ₋₁+aₙ₋₂，求 a₁₀。`,y,`依遞迴關係逐項推得 a₁₀=${y}。`);} ],
 ["高中數學競賽高階理論","先修｜三角形、圓與相似",i=>{const n=i+1,a=30+n%90,b=40+n%80,c=180-a-b,v=180-a-b;return make(`三角形兩內角為 ${a}°、${b}°，第三角是多少度？`,v,`三角形內角和為 180°，第三角=180°−${a}°−${b}°=${v}°。`);} ],
 ["高中數學競賽高階理論","先修｜排列組合與機率",i=>{const n=i+1,m=n+8,v=choose(m,3);return make(`從 ${m} 個不同元素中選出 3 個，不計順序，有幾種選法？`,v,`選法為 C(${m},3)=${v}。`);} ],
 ["高中數學競賽高階理論","進階｜不定方程與數論函數",i=>{const n=i+1,a=3*n+1,b=5*n+2,d=gcd(a,b),v=d===1?1:0;return make(`判斷 ${a}x+${b}y=1 是否有整數解；有解填 1，無解填 0。`,v,`gcd(${a},${b})=${d}；ax+by=1 有整數解恰好在 gcd(a,b)=1 時成立。`);} ],
 ["高中數學競賽高階理論","進階｜不等式與函數方程",i=>{const n=i+1,a=n+2,v=2*a;return make(`正數 x、y 滿足 xy=${a*a}，x+y 的最小值是多少？`,v,`AM-GM 給出 x+y≥2√(xy)=2√${a*a}=${v}，且 x=y=${a} 時取等號。`);} ],
 ["高中數學競賽高階理論","進階｜幾何變換與軌跡",i=>{const n=i+1,x=n-25,y=2*n-40,h=n%7+1,v=(x+h)**2+y*y;return make(`點 P(${x},${y}) 向右平移 ${h} 單位得 Q，原點到 Q 的距離平方是多少？`,v,`Q=(${x+h},${y})，OQ²=(${x+h})²+(${y})²=${v}。`);} ],
 ["高中數學競賽高階理論","進階｜圖論、遞迴與不變量",i=>{const n=i+1,v=n*(n-1)/2;return make(`完全圖 K_${n} 有幾條邊？`,v,`每一對不同頂點恰有一條邊，因此邊數=C(${n},2)=${v}。`);} ],

 ["高中自然科學高階特訓","物理｜進階力學與能量",i=>{const n=i+1,m=n+2,a=n%8+2,f=m*a;return make(`質量 ${m} kg 的物體受推力 ${f+5} N、摩擦力 5 N，物體加速度是多少？`,a,`合力=${f+5}−5=${f} N；a=F/m=${f}/${m}=${a} m/s²。`);} ],
 ["高中自然科學高階特訓","物理｜熱學、流體與氣體",i=>{const n=i+1,h=n+2,p=1000*10*h;return make(`密度 1000 kg/m³ 的液體中，深度 ${h} m 處的表壓是多少 Pa？取 g=10 m/s²。`,p,`液體表壓 p=ρgh=1000×10×${h}=${p} Pa。`);} ],
 ["高中自然科學高階特訓","物理｜波動、光學與電磁",i=>{const n=i+1,f=n+10,lam=n%9+2,v=f*lam;return make(`波的頻率為 ${f} Hz、波長為 ${lam} m，波速是多少 m/s？`,v,`v=fλ=${f}×${lam}=${v} m/s。`);} ],
 ["高中自然科學高階特訓","化學｜定量化學與氣體",i=>{const n=i+1,na=n+2,nb=2*n+1,prod=Math.min(na,nb/2);return make(`反應 A+2B→C。若有 ${na} mol A 與 ${nb} mol B，最多可生成幾 mol C？`,prod,`B 可生成 ${nb}/2 mol C，A 可生成 ${na} mol C；B 為限制試劑，最多生成 ${fmt(prod)} mol。`);} ],
 ["高中自然科學高階特訓","化學｜酸鹼、氧化還原與平衡",i=>{const n=i+1,c=0.02*(n+1),vol=0.05,v=c*vol;return make(`${vol} L、${fmt(c)} M 的一元酸加水稀釋至 1 L，末濃度是多少 M？`,v,`C₁V₁=C₂V₂，C₂=${fmt(c)}×${vol}/1=${fmt(v)} M。`);} ],
 ["高中自然科學高階特訓","化學｜未知物鑑別",i=>{const n=i+1,samples=n+2,reagents=4,v=samples*reagents;return make(`以 ${reagents} 種檢驗試劑逐一檢查 ${samples} 個未知樣本，每次只測一種樣本與一種試劑，需做幾次反應？`,v,`建立樣本×試劑的檢驗矩陣，共 ${samples}×${reagents}=${v} 次反應；另以標準樣本作對照。`);} ],
 ["高中自然科學高階特訓","生物｜顯微、遺傳與生理實驗",i=>{const n=i+1,cal=n+3,div=2*(n%8+2),ticks=div*5,v=cal*5;return make(`校正後目測微尺 ${div} 格相當於 ${cal} μm；細胞長 ${ticks} 格，實際長度是多少 μm？`,v,`每格=${cal}/${div} μm；細胞長度=${ticks}×${cal}/${div}=${v} μm。`);} ],
 ["高中自然科學高階特訓","地科｜地質、氣象與天文推理",i=>{const n=i+1,s=n+2,my=n%8+1,v=s*my*10;return make(`板塊以 ${s} cm/年移動 ${my} 百萬年，累積位移約多少公里？`,v,`1 cm/年持續 100 萬年約移動 10 km，因此位移=${s}×${my}×10=${v} km。`);} ],
 ["高中自然科學高階特訓","跨科｜誤差分析與不確定度",i=>{const n=i+1,t=100+3*n,m=t+(n%2?2:-2),err=100*Math.abs(m-t)/t;return make(`真值 ${t}、測量值 ${m}，百分誤差是多少？`,err,`百分誤差=|${m}−${t}|/${t}×100%=${fmt(err)}%。`);} ],

 ["數學競賽","數論篇",i=>{const n=i+1,a=14*n+3,b=21*n+5;return make(`求 ${a} 與 ${b} 的最大公因數。`,gcd(a,b),`以輾轉相除法計算，gcd(${a},${b})=${gcd(a,b)}。`);} ],
 ["數學競賽","代數篇",i=>{const n=i+1,a=n+2,b=n+5,v=(a*a+b*b)/2,xy=(a*a-b*b)/4;return make(`若 x+y=${a}、xy=${xy}，求 x²+y²。`,v,`x²+y²=(x+y)²−2xy=${a}²−2×(${xy})=${fmt(v)}。`);} ],
 ["數學競賽","幾何篇",i=>{const n=i+1,b=n+3,h=n%10+2,v=b*h/2;return make(`三角形底長 ${b} cm、高 ${h} cm，面積是多少 cm²？`,v,`面積=底×高/2=${b}×${h}/2=${fmt(v)} cm²。`);} ],
 ["數學競賽","組合篇",i=>{const n=i+1,a=n+5,v=choose(a,2);return make(`${a} 人互相握手一次，每一對只握一次，總共握手幾次？`,v,`每次握手對應一組兩人，總數=C(${a},2)=${v}。`);} ],
 ["數學競賽","TRML 與清華盃",i=>{const n=i+1,a=n+1,b=n%5+2,k=6;let x=a,y=b;for(let j=3;j<=k;j++)[x,y]=[y,x+y];return make(`遞迴數列 a₁=${a}、a₂=${b}、aₙ=aₙ₋₁+aₙ₋₂，求 a₆。`,y,`逐項遞推至第六項，a₆=${y}。`);} ],

 ["物理奧賽","進階力學",i=>{const n=i+1,m=n+2,r=n%12+3,v=n+4,f=m*v*v/r;return make(`質量 ${m} kg 的物體以 ${v} m/s 沿半徑 ${r} m 圓周運動，向心力為多少 N？`,f,`F_c=mv²/r=${m}×${v}²/${r}=${fmt(f)} N。`);} ],
 ["物理奧賽","電磁學",i=>{const n=i+1,q1=n+2,q2=2*n+3,r=n%9+2,f=9*q1*q2/(r*r);return make(`兩電荷量 ${q1} μC、${q2} μC 相距 ${r} cm；以比例常數 9 計算，庫侖力大小為多少相對單位？`,f,`F∝q₁q₂/r²；代入比例常數 9，F=9×${q1}×${q2}/${r}²=${fmt(f)}。`);} ],
 ["物理奧賽","熱統計與流體",i=>{const n=i+1,m=n+2,c=4,t=n%15+2,q=m*c*t;return make(`質量 ${m} kg、比熱 4 kJ/(kg·°C) 的物體升溫 ${t}°C，吸收多少 kJ 熱量？`,q,`Q=mcΔT=${m}×4×${t}=${q} kJ。`);} ],
 ["物理奧賽","波動光學",i=>{const n=i+1,u=n+2,v=2*u,f=1/(1/u+1/v);return make(`薄透鏡焦距為 ${fmt(f)} cm，物距 ${u} cm；依 1/f=1/u+1/v，像距 v 為多少 cm？`,v,`1/v=1/f−1/u，代入後 v=${fmt(v)} cm。`);} ],
 ["物理奧賽","近代物理",i=>{const n=i+1,f=n+2,h=6.63,v=h*f;return make(`光子頻率為 ${f}×10¹⁴ Hz，取 h=6.63×10⁻³⁴ J·s；以 10⁻²⁰ J 為單位，光子能量數值為多少？`,v,`E=hf=6.63×${f}×10⁻²⁰ J，因此以 10⁻²⁰ J 為單位的數值為 ${fmt(v)}。`);} ],

 ["化學奧賽","無機與分析化學",i=>{const n=i+1,m=n+2,M=58.5,v=m*M;return make(`${m} mol NaCl 的質量是多少克？取莫耳質量 58.5 g/mol。`,v,`質量=nM=${m}×58.5=${fmt(v)} g。`);} ],
 ["化學奧賽","物理化學",i=>{const n=i+1,a=n+2,b=2*n+3,k=b/a;return make(`反應 A⇌B 的平衡濃度 [A]=${a} M、[B]=${b} M，Kc=[B]/[A] 為多少？`,k,`Kc=${b}/${a}=${fmt(k)}。`);} ],
 ["化學奧賽","有機化學",i=>{const n=i+1,mc=12*n,mh=2*n+2,total=mc+mh,p=100*mc/total;return make(`烴類 C_${n}H_${2*n+2} 中，碳元素質量百分率是多少？取 C=12、H=1。`,p,`碳質量=${n}×12=${mc}；總莫耳質量=${mc}+${mh}=${total}；碳質量百分率=${mc}/${total}×100%=${fmt(p)}%。`);} ],
 ["化學奧賽","實驗化學",i=>{const n=i+1,I=n+1,t=965*n,m=0.000329*I*t;return make(`以 ${I} A 電流電解 Cu²⁺ 溶液 ${t} 秒，取銅的電化學當量 0.000329 g/C，析出銅多少克？`,m,`析出質量=電流×時間×電化學當量=${I}×${t}×0.000329=${fmt(m)} g。`);} ],

 ["生物奧賽","細胞與分子生物",i=>{const n=i+1,base=n+4,cycles=n%8+2,v=base*2**cycles;return make(`某 DNA 片段起始有 ${base} 個分子，經 ${cycles} 次完整 PCR 循環且效率 100%，理論上有幾個分子？`,v,`每一循環分子數加倍，總數=${base}×2^${cycles}=${v}。`);} ],
 ["生物奧賽","植物與動物生理",i=>{const n=i+1,hr=n+2,rate=70+n%30,v=rate*hr;return make(`心輸出量以每分鐘 ${rate} mL 計，${hr} 分鐘輸出多少 mL 血液？`,v,`總輸出量=每分鐘輸出量×時間=${rate}×${hr}=${v} mL。`);} ],
 ["生物奧賽","遺傳演化與生態",i=>{const n=i+1,p=(n+9)/100,q=1-p,v=2*p*q;return make(`族群中等位基因頻率 p=${fmt(p)}、q=${fmt(q)}，符合哈溫平衡時異型合子頻率是多少百分比？`,100*v,`異型合子頻率=2pq=2×${fmt(p)}×${fmt(q)}=${fmt(100*v)}%。`);} ],
 ["生物奧賽","實驗與資料分析",i=>{const n=i+1,control=10*n,treat=control+2*(n%7+1),v=100*(treat-control)/control;return make(`對照組平均值為 ${control}、處理組平均值為 ${treat}，處理組相對增加百分比是多少？`,v,`相對增加=(處理−對照)/對照×100%=(${treat}−${control})/${control}×100%=${fmt(v)}%。`);} ],

 ["地科奧賽","地質與地球物理",i=>{const n=i+1,depth=n+2,vs=4,dt=depth/vs;return make(`剪力波速率為 ${vs} km/s，傳播 ${fmt(dt)} 秒，行進距離是多少公里？`,depth,`距離=速率×時間=${vs}×${fmt(dt)}=${depth} km。`);} ],
 ["地科奧賽","氣象與海洋",i=>{const n=i+1,sat=20+n,actual=0.4*n,rh=100*actual/sat;return make(`飽和水氣量為 ${sat} g/m³、實際水氣量為 ${fmt(actual)} g/m³，相對溼度是多少百分比？`,rh,`相對溼度=實際/飽和×100%=${fmt(actual)}/${sat}×100%=${fmt(rh)}%。`);} ],
 ["地科奧賽","天文與行星科學",i=>{const n=i+1,a=n+2,b=2*a,T=a**1.5;return make(`依克卜勒第三定律 T²∝a³，若行星軌道半長軸為 ${a} AU，週期約為幾年？`,T,`以地球為基準，T²=a³，因此 T=√(${a}³)=${fmt(T)} 年。`);} ],

 ["資訊與 APCS","程式設計基礎",i=>{const n=i+1,start=n+2,stop=start+n,sum=n*(start+stop-1)/2;return make(`程式以 for i from ${start} to ${stop-1}（含）逐一累加 i，最後總和是多少？`,sum,`共有 ${n} 個整數，等差級數和=${n}×(${start}+${stop-1})/2=${sum}。`);} ],
 ["資訊與 APCS","資料結構與演算法",i=>{const n=i+1,len=2*n+5,index=n%len,steps=2*n+3,v=(index+steps)%len;return make(`長度 ${len} 的循環陣列以 0 起始索引，從索引 ${index} 向前移 ${steps} 格（索引增加方向），最後索引是多少？`,v,`循環索引=(${index}+${steps}) mod ${len}=${v}。`);} ],
 ["資訊與 APCS","APCS 實作題型",i=>{const n=i+1,a=n+2,b=n%8+3,steps=a+b;return make(`演算法先走訪 ${a} 個節點，再走訪 ${b} 個新節點；若每次走訪記為一次操作，總操作數是多少？`,steps,`總操作數=${a}+${b}=${steps}。`);} ],
];

if(families.length!==42)throw new Error(`Expected 42 units; got ${families.length}`);
const ids=new Set(bank.map(q=>q.id)),prompts=new Set(bank.map(q=>`${q.level}|${q.subject}|${q.deck}|${q.prompt}`)),added=[];
for(let f=0;f<families.length;f++){
 const [subject,deck,build]=families[f];
 for(const level of ["高中資優"]){
  const count=f<26?48:47;
  for(let i=0;i<count;i++){
   const q=build(i),id=`senior-gifted-20261122-${String(added.length+1).padStart(4,"0")}`,prompt=`【高中資優原創】${q.prompt}`;
   if(ids.has(id)||prompts.has(`${level}|${subject}|${deck}|${prompt}`))throw new Error(`Duplicate question: ${prompt}`);
   ids.add(id);prompts.add(`${level}|${subject}|${deck}|${prompt}`);
   const step=Number.isInteger(q.answer)?1:(Math.abs(q.answer)<1?0.1:0.5);
   const raw=[q.answer-2*step,q.answer-step,q.answer,q.answer+step].map(fmt),shift=i%4,options=raw.slice(shift).concat(raw.slice(0,shift));
   added.push({level,subject,deck,skill:"競賽思維",source:"Knovatrix 高中資優原創練習（非歷屆原題）",id,prompt,options,answer:(2-shift+4)%4,explanation:q.explanation});
  }
 }
}
if(added.length!==2000)throw new Error(`Expected 2000 questions; got ${added.length}`);
const at=original.lastIndexOf("\n]");if(at<0)throw new Error("Unexpected JSON layout");
const serialized=added.map(q=>JSON.stringify(q,null,2).split("\n").map(line=>"  "+line).join("\n")).join(",\n");
const updated=original.slice(0,at)+",\n"+serialized+"\n]\n";
if(JSON.parse(updated).length!==bank.length+2000)throw new Error("Question count mismatch");
fs.writeFileSync(dataPath,updated);
console.log(`Added ${added.length} senior gifted questions across ${families.length} curriculum units.`);
