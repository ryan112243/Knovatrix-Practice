import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(root, "data", "questions.json");
const original = fs.readFileSync(dataPath, "utf8");
const existing = JSON.parse(original);
const format = value => String(Number(Number(value).toFixed(3)));
const question = (prompt, answer, explanation, unit = "") => ({ prompt, answer: Number(format(answer)), explanation, unit });
const specs = [
  ["數學", "高一必修｜實數、絕對值與式的運算", [
    i => { const a = -12 + i, b = 3 + 2 * i, v = Math.abs(a - b); return question("數線上 A 點座標為 " + a + "，B 點座標為 " + b + "，兩點距離是多少？", v, "距離 = |" + a + " - " + b + "| = " + v + "。", "單位"); },
    i => { const c = i + 2, r = i + 2, v = 2 * r + 1; return question("滿足 |x - " + c + "| ≤ " + r + " 的整數 x 共有幾個？", v, "從 " + (c - r) + " 到 " + (c + r) + " 都符合，整數個數 = 2 × " + r + " + 1 = " + v + "。", "個"); }
  ]],
  ["數學", "高一必修｜直線與圓", [
    i => { const x = i - 3, y = 2 * i - 5, d = i % 3 + 1, m = i - 5, y2 = y + m * d; return question("直線通過 (" + x + ", " + y + ") 與 (" + (x + d) + ", " + y2 + ")，斜率是多少？", m, "斜率 = (" + y2 + " - " + y + ") / (" + (x + d) + " - " + x + ") = " + m + "。"); },
    i => { const a = i + 1, b = i + 2, r = i + 2; return question("圓 (x - " + a + ")² + (y - " + b + ")² = " + (r * r) + " 的半徑是多少？", r, "標準式右側為半徑平方；r = √" + (r * r) + " = " + r + "。", "單位"); }
  ]],
  ["數學", "數學 A｜微分與導數應用", [
    i => { const a = i + 1, b = i + 2, t = i - 4, v = 2 * a * t + b; return question("f(x) = " + a + "x² + " + b + "x + 3，在 x = " + t + " 時的導數值是多少？", v, "f′(x) = " + (2 * a) + "x + " + b + "；代入 x = " + t + " 得 " + v + "。"); },
    i => { const a = i % 3 + 1, b = i + 1, t = i - 3, v = 3 * a * t * t + b; return question("g(x) = " + a + "x³ + " + b + "x，在 x = " + t + " 時的瞬時變化率是多少？", v, "g′(x) = " + (3 * a) + "x² + " + b + "；代入 x = " + t + " 得 " + v + "。"); }
  ]],
  ["數學", "數學 A｜積分與面積", [
    i => { const a = 2 * (i % 4 + 1), b = i + 1, n = i + 2, v = a * n * n / 2 + b * n; return question("求函數 f(x) = " + a + "x + " + b + " 在 x = 0 到 x = " + n + " 下方的面積。", v, "定積分為 " + a + " × " + n + "² / 2 + " + b + " × " + n + " = " + v + "。", "平方單位"); },
    i => { const a = i % 4 + 1, n = i + 2, v = a * n ** 3; return question("求曲線 y = " + (3 * a) + "x² 與 x 軸在 x = 0 至 x = " + n + " 之間圍成的面積。", v, "∫0^" + n + " " + (3 * a) + "x² dx = " + a + " × " + n + "³ = " + v + "。", "平方單位"); }
  ]],
  ["數學", "高二必修｜機率與條件機率", [
    i => { const red = i + 1, v = (red - 1) * 10; return question("袋中共有 11 球，其中 " + red + " 球為紅球。不放回抽兩球，已知第一球是紅球，第二球為紅球的條件機率是多少？", v, "第一球已是紅球，剩 " + (red - 1) + " 個紅球與 10 球，所以機率 = " + (red - 1) + "/10 = " + v + "%。", "%"); },
    i => { const red = i + 1, green = 10 - red, v = red * 10; return question("袋中有紅球 " + red + " 顆、綠球 " + green + " 顆、藍球 5 顆。已知抽出的球不是藍球，紅球的條件機率是多少？", v, "非藍球共有 10 顆，其中紅球 " + red + " 顆，所以機率 = " + red + "/10 = " + v + "%。", "%"); }
  ]],
  ["物理", "選修 I｜位置、速度與加速度", [
    i => { const u = i + 1, a = i % 3 + 2, t = i + 2, v = u + a * t; return question("物體初速 " + u + " m/s，以 " + a + " m/s² 等加速度運動 " + t + " 秒，末速是多少？", v, "末速 v = u + at = " + u + " + " + a + " × " + t + " = " + v + " m/s。", "m/s"); },
    i => { const a = 2 * (i % 4 + 1), t = i + 2, v = a * t * t / 2; return question("物體由靜止出發，以 " + a + " m/s² 等加速度運動 " + t + " 秒，位移是多少？", v, "位移 s = 1/2 at² = 1/2 × " + a + " × " + t + "² = " + v + " m。", "m"); }
  ]],
  ["物理", "選修 I｜平面運動與牛頓定律", [
    i => { const m = i + 2, a = i % 5 + 2, v = m * a; return question("質量 " + m + " kg 的物體產生 " + a + " m/s² 加速度，合力大小是多少？", v, "依牛頓第二定律 F = ma = " + m + " × " + a + " = " + v + " N。", "N"); },
    i => { const m = i + 3, a = i % 4 + 1, f = i + 2, push = m * a + f; return question("水平推動 " + m + " kg 物體，推力 " + push + " N、反向摩擦力 " + f + " N，加速度是多少？", a, "合力 = " + push + " - " + f + " = " + (m * a) + " N；a = F/m = " + a + " m/s²。", "m/s²"); }
  ]],
  ["物理", "選修 I｜功、能量與動量", [
    i => { const f = 5 * (i + 2), d = i + 1, v = f * d; return question("水平恆力 " + f + " N 沿力的方向使物體移動 " + d + " m，此力做功多少？", v, "W = Fd = " + f + " × " + d + " = " + v + " J。", "J"); },
    i => { const m = 2 * (i % 4 + 1), speed = i + 2, v = m * speed ** 2 / 2; return question("質量 " + m + " kg 的物體以 " + speed + " m/s 運動，動能是多少？", v, "動能 K = 1/2 mv² = 1/2 × " + m + " × " + speed + "² = " + v + " J。", "J"); }
  ]],
  ["物理", "選修 IV｜直流電路與磁場", [
    i => { const r = i + 2, current = i % 4 + 2, v = r * current; return question("電阻 " + r + " Ω 通過 " + current + " A 電流，兩端電壓是多少？", v, "歐姆定律 V = IR = " + current + " × " + r + " = " + v + " V。", "V"); },
    i => { const r1 = i + 1, r2 = i + 3, current = i % 3 + 2, v = (r1 + r2) * current; return question("電阻 " + r1 + " Ω 與 " + r2 + " Ω 串聯，流經 " + current + " A 電流，總電壓是多少？", v, "串聯總電阻為 " + (r1 + r2) + " Ω；V = IR = " + current + " × " + (r1 + r2) + " = " + v + " V。", "V"); }
  ]],
  ["物理", "選修 IV｜電磁感應與交流電", [
    i => { const delta = format(0.05 * (i + 1)), v = i + 1; return question("10 匝線圈的單匝磁通量在 0.5 秒內均勻改變 " + delta + " Wb，感應電動勢大小是多少？", v, "法拉第定律 |ε| = N|ΔΦ|/Δt = 10 × " + delta + " / 0.5 = " + v + " V。", "V"); },
    i => { const rms = 10 * (i + 1); return question("正弦交流電壓峰值為 " + rms + "√2 V，有效值是多少？", rms, "正弦波有效值 = 峰值/√2 = " + rms + " V。", "V"); }
  ]],
  ["化學", "必修｜物質分類、分離與化學計量", [
    i => { const molar = 20 + 2 * i, n = i + 1, mass = molar * n; return question("某物質莫耳質量為 " + molar + " g/mol，取 " + mass + " g，物質的量是多少？", n, "n = m/M = " + mass + "/" + molar + " = " + n + " mol。", "mol"); },
    i => { const solute = 2 * (i + 3), v = i + 3; return question("將 " + solute + " g 溶質配成 200 g 溶液，重量百分濃度是多少？", v, "重量百分濃度 = " + solute + "/200 × 100% = " + v + "%。", "%"); }
  ]],
  ["化學", "必修｜原子結構與週期性", [
    i => { const z = 8 + i, a = 2 * z + i % 3, v = a - z; return question("某中性原子的原子序為 " + z + "、質量數為 " + a + "，中子數是多少？", v, "中子數 = 質量數 - 質子數 = " + a + " - " + z + " = " + v + "。", "個"); },
    i => { const z = 12 + i, v = z - 2; return question("假設原子序為 " + z + " 的原子形成 2+ 陽離子，該離子有多少電子？", v, "中性原子有 " + z + " 個電子；失去 2 個後剩 " + v + " 個。", "個"); }
  ]],
  ["化學", "必修｜水溶液、酸鹼與氧化還原", [
    i => { const pH = i + 2; return question("25°C 水溶液中氫離子濃度為 1×10^-" + pH + " M，pH 是多少？", pH, "pH = -log[H⁺] = -log(10^-" + pH + ") = " + pH + "。"); },
    i => { const acidVolume = 5 * (i + 1), baseVolume = acidVolume * 2; return question("用 0.1 M NaOH 完全中和 " + acidVolume + " mL 的 0.2 M HCl，需 NaOH 幾 mL？", baseVolume, "一元酸鹼依 MₐVₐ = MᵦVᵦ；0.2 × " + acidVolume + " = 0.1 × V，V = " + baseVolume + " mL。", "mL"); }
  ]],
  ["化學", "選修 III｜化學平衡", [
    i => { const a = Number(format(0.05 * (i + 2))), k = i + 1, b = Number(format(a * k)); return question("反應 A ⇌ B 的平衡濃度 [A] = " + a + " M、[B] = " + b + " M，Kc 為多少？", k, "Kc = [B]/[A] = " + b + "/" + a + " = " + k + "。"); },
    i => { const b = Number(format(0.1 * (i + 1))), k = i + 2, c = Number(format(0.1 * b * k)); return question("反應 A + B ⇌ C 的平衡濃度為 [A] = 0.1 M、[B] = " + b + " M、[C] = " + c + " M，Kc 為多少？", k, "Kc = [C]/([A][B]) = " + c + "/(0.1 × " + b + ") = " + k + "。"); }
  ]],
  ["化學", "選修 IV｜電化學與電解", [
    i => { const cath = Number(format(0.2 + 0.1 * i)), an = -0.4, v = Number(format(cath - an)); return question("某原電池陰極還原電位為 " + cath + " V、陽極還原電位為 " + an + " V，標準電池電位是多少？", v, "E°cell = E°cathode - E°anode = " + cath + " - (" + an + ") = " + v + " V。", "V"); },
    i => { const t = 965 * (i + 1), mass = Number(format(0.635 * (i + 1))); return question("以 2 A 電流電解 Cu²⁺ 溶液 " + t + " 秒，陰極析出銅多少克？取 F = 96500 C/mol、Cu = 63.5 g/mol。", mass, "Cu²⁺ + 2e⁻ → Cu；m = ItM/(2F) = 2 × " + t + " × 63.5/(2 × 96500) = " + mass + " g。", "g"); }
  ]],
  ["生物", "必修｜細胞構造、膜與能量", [
    i => { const side = i + 1, v = Number(format(6 / side)); return question("邊長 " + side + " cm 的立方體細胞模型，其表面積與體積比 S/V 是多少？答案四捨五入到小數第三位。", v, "立方體 S = 6a²、V = a³，所以 S/V = 6/a = 6/" + side + " ≈ " + v + " cm⁻¹。", "cm⁻¹"); },
    i => { const mass = 100 + 10 * i, loss = 5 + i, v = Number(format(mass * (1 - loss / 100))); return question("細胞模型置於高張溶液後失水，質量由 " + mass + " g 減少 " + loss + "%，最後質量是多少？", v, "高張溶液使水分外移；最後質量 = " + mass + " × (1 - " + loss + "/100) = " + v + " g。", "g"); }
  ]],
  ["生物", "必修｜遺傳與中心法則基礎", [
    i => { const offspring = 4 * (i + 1), v = i + 1; return question("單基因完全顯性且 Aa × Aa 交配，若有 " + offspring + " 名子代，隱性表現型的理論期望人數是多少？", v, "Aa × Aa 的 aa 比率為 1/4；期望值 = " + offspring + " × 1/4 = " + v + " 人。", "人"); },
    i => { const a = 10 + 2 * i, g = 5 + i, total = 2 * (a + g); return question("一段雙股 DNA 共有 " + total + " 個核苷酸，其中 A 有 " + a + " 個，G 有多少個？", g, "雙股 DNA 中 A = T、G = C；G = (" + total + " - 2 × " + a + ")/2 = " + g + "。", "個"); }
  ]],
  ["生物", "選修 I｜細胞代謝、呼吸與光合", [
    i => { const gross = 20 + 2 * i, resp = 3 + i % 3, v = gross - resp; return question("某植物每小時光合作用產生氧氣 " + gross + " mL、呼吸作用消耗氧氣 " + resp + " mL，淨釋氧量是多少？", v, "淨釋氧量 = 光合總產氧 - 呼吸耗氧 = " + gross + " - " + resp + " = " + v + " mL。", "mL"); },
    i => { const glucose = i + 1, v = 6 * glucose; return question("完全有氧呼吸分解 " + glucose + " mol 葡萄糖，依 C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O，產生幾 mol CO₂？", v, "每 1 mol 葡萄糖產生 6 mol CO₂；" + glucose + " × 6 = " + v + " mol。", "mol"); }
  ]],
  ["生物", "選修 III｜神經、內分泌與防禦免疫", [
    i => { const speed = 20 + 2 * i, ms = 10 * (i + 1), distance = Number(format(speed * ms / 1000)); return question("神經衝動以 " + speed + " m/s 傳導 " + distance + " m，所需時間是多少毫秒？", ms, "t = d/v = " + distance + "/" + speed + " 秒 = " + ms + " 毫秒。", "毫秒"); },
    i => { const days = 7 * (i + 1), v = 1024 / 2 ** (i + 1); return question("某抗體濃度初始為 1024 單位，半衰期為 7 天，經過 " + days + " 天後約剩多少單位？", v, "經過 " + (i + 1) + " 個半衰期，剩 1024/(2^" + (i + 1) + ") = " + v + " 單位。", "單位"); }
  ]],
  ["生物", "選修 IV｜族群、群集、生態系與環境", [
    i => { const marked = 20 + 2 * i, sample = 40, recaptured = 10, v = marked * sample / recaptured; return question("標放再捕法中，首次標記 " + marked + " 隻，第二次捕到 " + sample + " 隻且其中 " + recaptured + " 隻有標記，估計族群數是多少？", v, "依 M/N ≈ R/C，N ≈ MC/R = " + marked + " × " + sample + "/" + recaptured + " = " + v + " 隻。", "隻"); },
    i => { const recessive = (i + 1) ** 2, q = (i + 1) * 10; return question("族群符合哈溫平衡，隱性表現型占 " + recessive + "%，隱性等位基因頻率 q 是多少？", q, "q² = " + recessive + "%；q = √(" + recessive + "/100) = " + q + "%。", "%"); }
  ]],
  ["地球科學", "必修｜固體地球、板塊與地質紀錄", [
    i => { const speed = i + 2, millionYears = i % 3 + 1, v = speed * millionYears * 10; return question("板塊以 " + speed + " cm/年移動，持續 " + millionYears + " 百萬年，累積位移約多少公里？", v, "1 cm/年持續 100 萬年為 10 km；" + speed + " × " + millionYears + " × 10 = " + v + " km。", "km"); },
    i => { const speed = i + 5, seconds = 10 * (i + 1), distance = speed * seconds; return question("P 波速率為 " + speed + " km/s，若震源到測站距離 " + distance + " km，走時是多少？", seconds, "t = d/v = " + distance + "/" + speed + " = " + seconds + " 秒。", "秒"); }
  ]],
  ["地球科學", "必修｜大氣、海洋與氣候", [
    i => { const sea = 30 - i, height = i % 5 + 1, v = sea - 6 * height; return question("某地海平面氣溫 " + sea + "°C，若環境直減率為 6°C/km，高 " + height + " km 處氣溫約多少？", v, "氣溫約下降 6 × " + height + " = " + (6 * height) + "°C，因此為 " + v + "°C。", "°C"); },
    i => { const saturation = 20 + 2 * i, actual = Number(format(saturation * (i + 1) / 10)), v = 10 * (i + 1); return question("空氣飽和水氣量為 " + saturation + " g/m³、實際水氣量為 " + actual + " g/m³，相對溼度是多少？", v, "相對溼度 = 實際/飽和 × 100% = " + actual + "/" + saturation + " × 100% = " + v + "%。", "%"); }
  ]],
  ["地球科學", "選修｜地層、化石與定年", [
    i => { const halfLife = 100 + 20 * i, times = i % 4 + 1, denominator = 2 ** times, v = halfLife * times; return question("某放射性同位素半衰期 " + halfLife + " 年，標本剩原始量的 1/" + denominator + "，估計經過多少年？", v, "1/" + denominator + " = (1/2)^" + times + "，經過 " + times + " 個半衰期，年齡為 " + halfLife + " × " + times + " = " + v + " 年。", "年"); },
    i => { const rate = i + 2, thickness = rate * (i + 1), v = 1000 * (i + 1); return question("地層以每千年 " + rate + " cm 的固定速率沉積，厚 " + thickness + " cm 約需多少年？", v, "所需千年數 = " + thickness + "/" + rate + " = " + (i + 1) + "；換算為 " + v + " 年。", "年"); }
  ]],
  ["地球科學", "選修｜大氣熱力學、斜溫圖與天氣分析", [
    i => { const surface = 28 + i, height = i % 4 + 1, v = surface - 10 * height; return question("未飽和氣塊由地面 " + surface + "°C 上升 " + height + " km，按乾絕熱直減率 10°C/km，溫度約為多少？", v, "溫度 = " + surface + " - 10 × " + height + " = " + v + "°C。", "°C"); },
    i => { const surface = 30 + i, height = i % 4 + 2, v = surface - 10 - 6 * (height - 1); return question("氣塊由地面 " + surface + "°C 上升 " + height + " km，前 1 km 以乾絕熱 10°C/km 冷卻，其後以溼絕熱 6°C/km 冷卻，最後溫度約多少？", v, "先降 10°C，再降 6 × " + (height - 1) + "°C；最後為 " + surface + " - 10 - " + (6 * (height - 1)) + " = " + v + "°C。", "°C"); }
  ]],
  ["地球科學", "選修｜赫羅圖、恆星演化與星系", [
    i => { const factor = i + 2, v = factor ** 2; return question("恆星光度不變，觀測距離變成原來的 " + factor + " 倍，接收通量變成原來的 1/n；n 為多少？", v, "光通量與距離平方成反比；n = " + factor + "² = " + v + "。"); },
    i => { const distance = i + 2; return question("某恆星的年周視差為 1/" + distance + " 角秒，依 d(pc) = 1/p(角秒)，距離是多少秒差距？", distance, "d = 1/(1/" + distance + ") = " + distance + " pc。", "pc"); }
  ]]
];

const knownIds = new Set(existing.map(item => item.id));
const knownDecks = new Set(existing.map(item => item.level + "|" + item.subject + "|" + item.deck));
const generated = [];
const seenPrompts = new Set();
for (const [subject, deck, families] of specs) {
  if (!knownDecks.has("高中|" + subject + "|" + deck)) throw new Error("Unknown deck: " + subject + " " + deck);
  for (let family = 0; family < families.length; family += 1) {
    for (let i = 0; i < 10; i += 1) {
      const item = families[family](i);
      if (!Number.isFinite(item.answer) || !item.explanation.includes(format(item.answer))) throw new Error("Invalid answer/explanation");
      const promptKey = subject + "|" + deck + "|" + item.prompt;
      if (seenPrompts.has(promptKey)) throw new Error("Duplicate prompt: " + promptKey);
      seenPrompts.add(promptKey);
      const step = Math.abs(item.answer) < 1 ? 0.1 : Math.abs(item.answer) < 10 ? 1 : Math.max(1, Math.round(Math.abs(item.answer) / 10));
      const low = item.answer >= 0 && item.answer - 2 * step < 0 ? item.answer : item.answer - 2 * step;
      const choices = [low, low + step, low + 2 * step, low + 3 * step].map(format);
      const correct = format(item.answer);
      if (!choices.includes(correct) || new Set(choices).size !== 4) throw new Error("Invalid choices: " + promptKey);
      const shift = i % 4;
      const options = choices.slice(shift).concat(choices.slice(0, shift));
      const base = "senior-expansion-" + specs.indexOf(specs.find(s => s[0] === subject && s[1] === deck)).toString().padStart(2, "0") + "-" + family + "-" + String(i + 1).padStart(2, "0");
      const common = { level: "高中", subject, deck, skill: "情境計算", source: "Knovatrix 原創題庫", explanation: item.explanation };
      const stem = item.prompt + (item.unit ? "（答案單位：" + item.unit + "）" : "");
      const mcq = { ...common, id: base + "-mcq", prompt: stem + " 請選出正確數值。", options, answer: options.indexOf(correct) };
      const short = { ...common, id: base + "-short", prompt: stem + " 請只填數值，不用寫單位。", answer: correct };
      generated.push(mcq, short);
    }
  }
}
if (generated.length !== 1000) throw new Error("Unexpected count: " + generated.length);
const presentCount = generated.filter(item => knownIds.has(item.id)).length;
if (presentCount === generated.length) {
  console.log("All generated questions are already present.");
  process.exit(0);
}
if (presentCount > 0) throw new Error("Partial generated question set already present: " + presentCount);
const lastBracket = original.lastIndexOf("\n]");
if (lastBracket < 0) throw new Error("Unexpected JSON layout");
const serialized = generated.map(item => JSON.stringify(item, null, 2).split("\n").map(line => "  " + line).join("\n")).join(",\n");
const next = original.slice(0, lastBracket) + ",\n" + serialized + "\n]\n";
const parsed = JSON.parse(next);
if (parsed.length !== existing.length + generated.length) throw new Error("Output count mismatch");
fs.writeFileSync(dataPath, next);
console.log("Added " + generated.length + " questions across " + specs.length + " high-school decks.");
