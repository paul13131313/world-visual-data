// Theme definitions for World Visual Data

export const THEME_CATEGORIES = {
  economy: { label: "経済" },
  society: { label: "社会" },
  environment: { label: "環境" },
  technology: { label: "テクノロジー" },
  other: { label: "その他" },
};

export const THEMES = [
  // ── 経済 ──
  { key: "gdp", label: "GDP", unit: "兆$", field: "gdp", category: "economy", desc: "国内総生産", color: "#00d4ff", lo: "#0a2a40", hi: "#00d4ff", year: 2023 },
  { key: "gdpPerCapita", label: "1人あたりGDP", unit: "$", field: "gdpPerCapita", category: "economy", desc: "1人あたり国内総生産", help: "GDPを人口で割った値。国民1人あたりの経済的な豊かさの目安", color: "#00b8d4", lo: "#082838", hi: "#00b8d4", year: 2023 },
  { key: "unemployment", label: "失業率", unit: "%", field: "unemployment", category: "economy", desc: "失業率", color: "#ff6b6b", lo: "#3a1515", hi: "#ff6b6b", year: 2023 },
  { key: "inflation", label: "インフレ率", unit: "%", field: "inflation", category: "economy", desc: "インフレ率", help: "消費者物価指数（CPI）の前年比上昇率", color: "#ff4757", lo: "#3a0a15", hi: "#ff4757", year: 2023 },
  { key: "tradeBalance", label: "貿易収支", unit: "B$", field: "tradeBalance", category: "economy", desc: "貿易収支", help: "輸出額−輸入額。プラスは貿易黒字、マイナスは赤字", color: "#ffa502", lo: "#2a1800", hi: "#ffa502", bipolar: true, year: 2023 },

  // ── 社会 ──
  { key: "population", label: "人口", unit: "百万人", field: "population", category: "society", desc: "総人口", color: "#00ff88", lo: "#0a2a14", hi: "#00ff88", year: 2023 },
  { key: "lifeExpectancy", label: "平均寿命", unit: "歳", field: "lifeExpectancy", category: "society", desc: "平均寿命", color: "#7bed9f", lo: "#0a2a1a", hi: "#7bed9f", year: 2023 },
  { key: "birthRate", label: "出生率", unit: "‰", field: "birthRate", category: "society", desc: "出生率（1000人あたり）", help: "人口1000人に対する年間出生数", color: "#ff6348", lo: "#2a1008", hi: "#ff6348", year: 2023 },
  { key: "literacy", label: "識字率", unit: "%", field: "literacy", category: "society", desc: "成人識字率", color: "#70a1ff", lo: "#0a1a30", hi: "#70a1ff", year: 2022 },
  { key: "educationSpend", label: "教育費", unit: "%GDP", field: "educationSpend", category: "society", desc: "教育費（対GDP比）", help: "政府の教育支出がGDPに占める割合", color: "#5352ed", lo: "#12103a", hi: "#5352ed", year: 2022 },
  { key: "gini", label: "ジニ係数", unit: "", field: "gini", category: "society", desc: "ジニ係数（格差指標）", help: "所得の不平等度を0〜100で表す指標。0＝完全平等、100＝1人が全所得を独占。ローレンツ曲線と完全平等線の間の面積から算出。30以下は平等、40以上は格差大", color: "#ff7979", lo: "#2a1414", hi: "#ff7979", year: 2022 },
  { key: "happiness", label: "幸福度", unit: "", field: "happiness", category: "society", desc: "世界幸福度指数", help: "国連の世界幸福度報告書。GDP・健康寿命・社会的支援・自由度・寛容さ・腐敗の少なさの6指標から算出。0〜10のスケール", color: "#ffeaa7", lo: "#2a2800", hi: "#ffeaa7", year: 2024 },
  { key: "suicideRate", label: "自殺率", unit: "/10万人", field: "suicideRate", category: "society", desc: "自殺率（10万人あたり）", help: "WHO推計による年齢標準化自殺率。人口10万人あたりの年間自殺者数", color: "#636e72", lo: "#1a1a1a", hi: "#636e72", year: 2019 },

  // ── 環境 ──
  { key: "co2", label: "CO₂排出量", unit: "Mt", field: "co2", category: "environment", desc: "CO₂排出量（百万トン）", color: "#ffaa00", lo: "#2a1a00", hi: "#ffaa00", year: 2022 },
  { key: "co2PerCapita", label: "1人あたりCO₂", unit: "t", field: "co2PerCapita", category: "environment", desc: "1人あたりCO₂排出量", help: "国全体のCO₂排出量を人口で割った値（トン/人）", color: "#f0932b", lo: "#2a1a05", hi: "#f0932b", year: 2022 },
  { key: "renewableEnergy", label: "再エネ比率", unit: "%", field: "renewableEnergy", category: "environment", desc: "再生可能エネルギー比率", help: "最終エネルギー消費に占める再生可能エネルギー（太陽光・風力・水力・バイオマス等）の割合", color: "#2ed573", lo: "#0a2a10", hi: "#2ed573", year: 2022 },
  { key: "forestArea", label: "森林面積率", unit: "%", field: "forestArea", category: "environment", desc: "森林面積率", color: "#26de81", lo: "#082a0e", hi: "#26de81", year: 2022 },
  { key: "waterResources", label: "水資源量", unit: "km³", field: "waterResources", category: "environment", desc: "再生可能水資源量", help: "降水から蒸発を引いた、毎年更新される利用可能な淡水の総量", color: "#45aaf2", lo: "#0a1a30", hi: "#45aaf2", year: 2020 },

  // ── テクノロジー ──
  { key: "internet", label: "ネット普及率", unit: "%", field: "internet", category: "technology", desc: "インターネット普及率", color: "#00ffc8", lo: "#002828", hi: "#00ffc8", year: 2023 },
  { key: "mobileRate", label: "モバイル普及率", unit: "%", field: "mobileRate", category: "technology", desc: "モバイル契約数（100人あたり）", help: "100人あたりの携帯電話契約数。100%超は1人が複数回線を持つことを意味する", color: "#a29bfe", lo: "#1a1830", hi: "#a29bfe", year: 2023 },
  { key: "rdSpend", label: "R&D支出", unit: "%GDP", field: "rdSpend", category: "technology", desc: "研究開発費（対GDP比）", help: "国全体の研究開発への支出がGDPに占める割合。科学技術への投資度合いの指標", color: "#6c5ce7", lo: "#150e30", hi: "#6c5ce7", year: 2022 },

  // ── その他 ──
  { key: "military", label: "軍事費", unit: "B$", field: "military", category: "other", desc: "軍事費（10億ドル）", color: "#ff2d78", lo: "#3a0a1e", hi: "#ff2d78", year: 2023 },
  { key: "heritage", label: "世界遺産", unit: "件", field: "heritage", category: "other", desc: "ユネスコ世界遺産数", color: "#c850ff", lo: "#1e0a3a", hi: "#c850ff", year: 2024 },
  { key: "tourists", label: "観光客数", unit: "百万人", field: "tourists", category: "other", desc: "国際観光客数", color: "#fd79a8", lo: "#2a0a1a", hi: "#fd79a8", year: 2023 },
  { key: "favorites", label: "好きな国", unit: "位", field: "favorites", category: "other", desc: "制作者の好きな国Top10", help: "個人的に好きな国ランキング。旅の思い出と文化への敬意を込めて", color: "#ff6b6b", lo: "#2a0a0a", hi: "#ff6b6b", isFavorites: true },
  { key: "visited", label: "訪問済み", unit: "", field: "visited", category: "other", desc: "制作者が行ったことのある国", help: "33ヶ国訪問（データ外: 台湾・香港・マカオ・カンボジア・ネパール・カザフスタン・ウズベキスタン・アイスランド・オーストリア・タンザニア・グアテマラ）", color: "#f39c12", lo: "#1a1a1a", hi: "#f39c12", isVisited: true },
];
