# 涔夊姟鏁欒偛鏍囧噯鍖栧鏍＄洃娴嬫暟鎹彲瑙嗗寲鐪嬫澘

> 2026骞存俯宸炲競绗簩灞婃暀鑲叉暟鎹彲瑙嗗寲鎶€鑳藉ぇ璧?路 鎸囧畾鏁版簮璧涢亾

## 鍦ㄧ嚎璁块棶

| 鐜 | 鍦板潃 |
|------|------|
| GitHub Pages锛堢敓浜э級 | https://xiangguangling.github.io/test/ |
| 鏈湴寮€鍙?| http://localhost:5173/ |

## 蹇€熷紑濮?
```bash
# 瀹夎渚濊禆
npm install

# 寮€鍙戞ā寮?npm run dev

# 涓€閿惎鍔紙鍙€夛級
# Windows: scripts\start.bat
# macOS/Linux: scripts/start.sh

# 鐢熶骇鏋勫缓
npm run build

# 鏈湴棰勮鏋勫缓缁撴灉
npm run preview
```

鏋勫缓浜х墿浣嶄簬 `dist/`锛屽彲閮ㄧ讲鍒颁换鎰忛潤鎬佹墭绠★紙Nginx銆丟itHub Pages銆乂ercel 绛夛級銆?
## 閮ㄧ讲璇存槑

### GitHub Pages锛堟帹鑽愶級

1. 鍦ㄤ粨搴撴牴鐩綍鍒涘缓 `.github/workflows/deploy.yml`锛堝唴瀹硅 [`docs/deploy-workflow.yml`](docs/deploy-workflow.yml)锛?2. 鎵撳紑 **Settings 鈫?Pages**锛?*Source** 閫夋嫨 **GitHub Actions**
3. 鎺ㄩ€佸埌 `master` 鍚?Actions 鑷姩鏋勫缓骞跺彂甯?
> 鑻ユ湰鍦?`git push` 鎻愮ず缂哄皯 `workflow` 鏉冮檺锛岃鍦?GitHub 缃戦〉绔柊寤?workflow 鏂囦欢锛屾垨涓?Personal Access Token 鍕鹃€?`workflow` scope銆?
**Base 璺緞锛?* `vite.config.ts` 鍦?CI 鐜浣跨敤 `base: '/test/'`锛屼笌浠撳簱鍚?`xiangguangling/test` 瀵瑰簲銆傝嫢鏇存崲浠撳簱鍚嶏紝闇€鍚屾淇敼 `base`銆?
### 鎵嬪姩閮ㄧ讲

```bash
npm ci
npm run build
# 灏?dist/ 鐩綍鍐呭涓婁紶鑷抽潤鎬佹湇鍔″櫒鏍圭洰褰?```

## 鐪嬫澘缁撴瀯

搴旂敤閲囩敤 **5 涓富棰橀〉绛?*锛岄《閮ㄥ鑸垏鎹紱銆屾€讳綋姒傝銆嶄负绾靛悜 snap 婊氬姩澶氬睆甯冨眬锛屽叾浣欓〉涓?KPI + 鍥捐〃缃戞牸銆?
| 椤电 | 妯″潡 | 涓昏鍥捐〃 / 缁勪欢 | 璇存槑 |
|------|------|-----------------|------|
| **鎬讳綋姒傝** | KPI 鎸囨爣鏉?| 鍔ㄧ敾 StatCard 脳 6 | 瀛︽牎鎬绘暟銆佸潎鍒嗐€佸緱鍒嗙巼銆佹弧鍒嗘牎銆佹渶浣庡垎銆佲墺40 鍒嗗崰姣?|
| | 鍏ㄥ眬缁熻 | 鐜舰杩涘害 + 鍚屽績寰勫悜鍥?| 涓夊ぇ缁村害寰楀垎姒傝 |
| | 瓒嬪娍涓庣被鍨?| 闈㈢Н鍥?+ 瀛︽牎绫诲瀷寰楀垎鐜?| 鍒嗘暟鍒嗗竷涓庣被鍨嬪姣?|
| | 鏍稿績闆疯揪 | 鐜懓鍥?+ 16 椤规寚鏍囬浄杈?| 澶氱被瀛︽牎鎸囨爣瀵规瘮 |
| | 娴佸悜鍒嗘瀽 | 妗戝熀鍥?+ 鍏宠仈缃戠粶鍥?| 缁村害鈫掓寚鏍団啋涓嶈揪鏍囨祦鍚?|
| | 缁撴瀯瀵规瘮 | 鍫嗗彔鏌辩姸鍥?+ 涓夌被脳缁村害鍒嗙粍鏌?| 瀛︽牎绫诲瀷涓庣淮搴︿氦鍙?|
| | 澶囩敤鍥捐〃鍖?| 绠辩嚎鍥俱€佺儹鍔涘浘銆佺煭鏉挎潯褰㈢瓑 | 鎬诲垎鍒嗗竷銆佸煄涔″樊寮傘€佷綆鍒嗘牎鐩戞祴 |
| **鍖哄煙鍒嗘瀽** | 鍩庝埂瀵规瘮 | 鏌辩姸鍥俱€侀浄杈俱€佺儹鍔涘浘銆佹暎鐐广€佹姌绾?| 鍩庡競 / 鍘块晣 / 鍐滄潙澶氱淮瀵规瘮 |
| **瀹夊叏绠＄悊** | A 绫绘寚鏍?| 妯悜鏉″舰鍥?+ 瀹夊叏鎸囨爣缃戞牸 | 11 椤圭鐞嗕笌瀹夊叏鎸囨爣鐩戞祴 |
| **纭欢璁炬柦** | B 绫绘寚鏍?| 鏉″舰鍥?+ 瀛︽牎绫诲瀷鐑姏鍥?+ 璁炬柦缃戞牸 | 20 椤圭‖浠朵笌鐜鎸囨爣 |
| **甯堣祫闃熶紞** | C 绫绘寚鏍?| 闆疯揪銆佺儹鍔涘浘銆佹妫掔硸鍥?+ 甯堣祫缃戞牸 | 13 椤瑰笀璧勪笌鍙戝睍鎸囨爣 |

## 鎶€鏈爤

| 绫诲埆 | 閫夊瀷 |
|------|------|
| 妗嗘灦 | React 19 + TypeScript |
| 鏋勫缓 | Vite 6 |
| 鍥捐〃 | ECharts 5 / echarts-gl锛堟煴鐘躲€佺绾裤€侀浄杈俱€佹鍩恒€佺儹鍔涖€佷华琛ㄧ洏銆佺帿鐟般€佺綉缁滅瓑锛?|
| 鏍峰紡 | Tailwind CSS 4锛堣璁′护鐗岃 `src/index.css`锛?|
| 鍔ㄧ敾 | GSAP锛堝姞杞藉睆銆佹暟瀛楁粴鍔ㄣ€佸浘琛ㄥ叆鍦猴級 |
| 3D / 鐗规晥 | Three.js銆丱GL锛堥儴鍒嗚儗鏅笌鍙鍖栵級 |

## 椤圭洰缁撴瀯

```
鈹溾攢鈹€ index.html
鈹溾攢鈹€ package.json
鈹溾攢鈹€ vite.config.ts              # base 璺緞銆佹瀯寤鸿緭鍑?鈹溾攢鈹€ tsconfig.json
鈹溾攢鈹€ .github/workflows/deploy.yml # GitHub Pages 鑷姩閮ㄧ讲
鈹溾攢鈹€ public/
鈹?  鈹溾攢鈹€ dashboard_data.json     # 杩愯鏃跺姞杞界殑棰勫鐞嗘暟鎹?鈹?  鈹斺攢鈹€ campus-3d-bg.png
鈹溾攢鈹€ data/
鈹?  鈹斺攢鈹€ dashboard_dataset.csv   # 鍘熷 CSV锛堝紑鍙戝弬鑰冿紝涓嶅弬涓庤繍琛屾椂鍔犺浇锛?鈹溾攢鈹€ scripts/
鈹?  鈹溾攢鈹€ start.bat / start.sh    # 鏈湴涓€閿惎鍔?鈹?  鈹溾攢鈹€ sync-github.bat         # 鎺ㄩ€佽嚦 GitHub 杈呭姪鑴氭湰
鈹?  鈹溾攢鈹€ sync-to-github.ps1
鈹?  鈹斺攢鈹€ analyze_data.py         # 鏁版嵁鍒嗘瀽鑴氭湰
鈹斺攢鈹€ src/
    鈹溾攢鈹€ main.tsx
    鈹溾攢鈹€ App.tsx                 # 椤电璺敱銆佸姞杞芥€?    鈹溾攢鈹€ index.css               # 鍏ㄥ眬鏍峰紡 + @theme 璁捐浠ょ墝
    鈹溾攢鈹€ types/index.ts          # DashboardData 绛夌被鍨?    鈹溾攢鈹€ hooks/
    鈹?  鈹溾攢鈹€ useData.ts          # 鍔犺浇 public/dashboard_data.json
    鈹?  鈹溾攢鈹€ useChart.ts / useEcharts.ts
    鈹?  鈹斺攢鈹€ useChartViewportReveal.ts
    鈹溾攢鈹€ contexts/OverviewScrollContext.tsx
    鈹溾攢鈹€ utils/
    鈹?  鈹溾攢鈹€ chartResize.ts      # ECharts 鎸傝浇銆佸搷搴斿紡銆丼ankey 鍏ュ満
    鈹?  鈹溾攢鈹€ heatmapVisualMap.ts
    鈹?  鈹斺攢鈹€ lightChartTheme.ts
    鈹斺攢鈹€ components/
        鈹溾攢鈹€ PageTitle.tsx       # 椤舵爮 + 浜旈〉瀵艰埅
        鈹溾攢鈹€ LoadingScreen.tsx
        鈹溾攢鈹€ OverviewPage.tsx    # 姒傝 snap 甯冨眬
        鈹溾攢鈹€ RegionalPage.tsx
        鈹溾攢鈹€ SafetyPage.tsx
        鈹溾攢鈹€ FacilityPage.tsx
        鈹溾攢鈹€ FacultyPage.tsx
        鈹溾攢鈹€ TabPageLayout.tsx
        鈹溾攢鈹€ StatCard.tsx / ChartCard.tsx / FlipCard.tsx
        鈹溾攢鈹€ SankeyPassFlow.tsx / IndicatorRadar.tsx / ...
        鈹斺攢鈹€ figma/              # Figma 瀵归綈鐨勫彲瑙嗗寲瀛愮粍浠?```

## 鏁版嵁璇存槑

| 椤圭洰 | 鍐呭 |
|------|------|
| 鏁版嵁鏉ユ簮 | 娓╁窞甯傛暀鑲插眬鑴辨晱鏁版嵁闆嗭紙鎶€鑳藉ぇ璧涙寚瀹氭暟婧愶級 |
| 鏁版嵁瑙勬ā | 855 鎵€瀛︽牎 脳 44 椤圭洃娴嬫寚鏍?|
| 涓夊ぇ缁村害 | A 瀛︽牎绠＄悊涓庡畨鍏紙11 鍒嗭級銆丅 鍔炲纭欢涓庣幆澧冿紙20 鍒嗭級銆丆 甯堣祫闃熶紞涓庡彂灞曪紙13 鍒嗭級 |
| 鍒嗙被缁村害 | 鍔炲绫诲瀷锛堝皬瀛?/ 鍒濅腑 / 涔濆勾鍒讹級銆佸煄涔″垎缁勶紙鍩庡競 / 鍘块晣 / 鍐滄潙锛?|
| 杩愯鏃舵暟鎹?| `public/dashboard_data.json`锛堢敱 CSV 棰勫鐞嗙敓鎴愶級 |

## 鍙鍖栬В璇绘枃妗?
### 涓婚

鍩轰簬涔夊姟鏁欒偛鏍囧噯鍖栧鏍＄洃娴嬫暟鎹殑澶氱淮搴﹀彲瑙嗗寲鍒嗘瀽鐪嬫澘銆?
### 搴旂敤鍦烘櫙

闈㈠悜鏁欒偛涓荤閮ㄩ棬锛屽杈栧尯鍐呬箟鍔℃暀鑲插鏍℃爣鍑嗗寲寤鸿杩涜鐩戞祴璇勪及涓庡喅绛栨敮鎸侊紱鏀寔浠庢€讳綋銆佸尯鍩熴€佸畨鍏ㄣ€佺‖浠躲€佸笀璧勪簲涓瑙掑揩閫熷畾浣嶇煭鏉裤€?
### 鏍稿績浜偣

1. **澶氶〉澶氱淮**锛? 涓富棰橀〉 + 姒傝椤?10+ 绉嶅浘琛紝瑕嗙洊鎬婚噺銆佺粨鏋勩€佹祦鍚戙€佸姣斻€侀璀︺€?2. **鏁版嵁椹卞姩娲炲療**锛氬悇鍥捐〃閰嶅 `ChartInsights` 鏂囨锛屽疄鐜般€岀湅鍥捐璇濄€嶃€?3. **Snap 婊氬姩姒傝**锛氭瑙堥〉鎸?KPI 鈫?鑻遍泟鍖?鈫?妗戝熀/缃戠粶 鈫?鍫嗗彔瀵规瘮鍒嗘鍛堢幇锛岄€傞厤澶у睆灞曠ず銆?4. **缁熶竴瑙嗚浣撶郴**锛歍ailwind 璁捐浠ょ墝 + Figma 瀵归綈缁勪欢锛孭oppins / Open Sans 瀛椾綋鍒嗗眰銆?5. **鑷姩鍖栭儴缃?*锛氭帹閫佸嵆鏋勫缓锛孏itHub Pages 鎸佺画鍙戝竷銆?
### 鏁欒偛鏁呬簨锛堜笁鏉″彊浜嬬嚎锛?
1. **鍏叡鏁欏鐢ㄦ埧鐨勩€岄殣褰㈠嵄鏈恒€?* 鈥?瓒呰繃鍗婃暟瀛︽牎鏈揪鏍囷紝鍒剁害绱犺川鏁欒偛绌洪棿淇濋殰銆?2. **甯堣祫缁撴瀯鎬х煭鏉?* 鈥?缂栧埗銆佽亴绉般€侀煶浣撶編涓撲换绛夊鎸囨爣鑱斿姩鏆撮湶涓夐噸鍥板銆?3. **鍩庝埂涓庣被鍨嬪樊寮?* 鈥?涔濆勾鍒?> 鍒濅腑 > 灏忓锛涘煄甯傛€讳綋浼樹簬鍘块晣銆佸啘鏉戯紝閮ㄥ垎纭欢鎸囨爣鍩庝埂宸窛鏄捐憲銆?
### 鍙傝禌鏉愭枡娓呭崟

| 鏉愭枡 | 鐘舵€?|
|------|------|
| 浣滃搧鍏紑閾炬帴 | 鉁?https://xiangguangling.github.io/test/ |
| 浣滃搧鍏ㄥ睆鎴浘 | 猬?寰呰ˉ鍏?|
| 鍙鍖栬В璇绘枃妗?| 鉁?瑙佹湰鏂囥€屽彲瑙嗗寲瑙ｈ鏂囨。銆嶇珷鑺?|
| 婕旂ず瑙嗛 | 猬?鍙€?|
| 鏁版嵁瀹夊叏淇濇姢鎵胯涔?| 猬?寰呰ˉ鍏?|

## 浠撳簱璇存槑

| 浠撳簱 | 鐢ㄩ€?|
|------|------|
| [xiangguangling/test](https://github.com/xiangguangling/test) | 涓诲伐绋?+ GitHub Pages 绾夸笂閮ㄧ讲 |
| [xiangguangling/dashboard](https://github.com/xiangguangling/dashboard) | 鍘嗗彶鐗堟湰澶囦唤褰掓。 |

## 寮€鍙戝娉?
- 鏈湴 `npm run dev` 浣跨敤鐩稿璺緞 `base: './'`锛汣I 鏋勫缓浣跨敤 `base: '/test/'`銆?- 鍥捐〃瀹瑰櫒闇€鏈夋槑纭楂橈紱`chartResize.ts` 璐熻矗 resize 涓庤鍙ｅ叆鍦哄姩鐢汇€?- 鑷姩鍚屾鑴氭湰 `scripts/sync-to-github.ps1` 鍙敤浜庢湰鍦板彉鏇存壒閲忔帹閫侊紙闇€閰嶇疆 Git 鍑嵁锛夈€?
## 璁稿彲璇?
鏈」鐩负鎶€鑳藉ぇ璧涘弬璧涗綔鍝侊紝鏁版嵁宸茶劚鏁忥紝璇峰嬁鐢ㄤ簬鍟嗕笟鐢ㄩ€斻€?
