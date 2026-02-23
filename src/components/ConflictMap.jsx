import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import * as d3 from "d3";
import { feature } from "topojson-client";
import worldData from "world-atlas/countries-110m.json";
import { SEVERITY, COUNTRY_SEVERITY, CONFLICT_ARCS, COUNTRY_COORDS, CONFLICTS } from "../data/conflicts";

const SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";
const MONO = "'JetBrains Mono', 'SF Mono', 'Fira Code', 'Courier New', monospace";

// ISO numeric → ISO alpha-2 mapping (same as WorldMap.jsx)
const NUM_TO_ALPHA2 = {
  "004": "AF", "008": "AL", "012": "DZ", "020": "AD", "024": "AO",
  "031": "AZ", "032": "AR", "036": "AU", "040": "AT", "050": "BD",
  "056": "BE", "064": "BT", "068": "BO", "070": "BA", "072": "BW",
  "076": "BR", "096": "BN", "100": "BG", "104": "MM", "108": "BI",
  "112": "BY", "116": "KH", "120": "CM", "124": "CA", "140": "CF",
  "144": "LK", "148": "TD", "152": "CL", "156": "CN", "170": "CO",
  "178": "CG", "180": "CD", "188": "CR", "191": "HR", "192": "CU",
  "196": "CY", "203": "CZ", "208": "DK", "214": "DO", "218": "EC",
  "222": "SV", "226": "GQ", "231": "ET", "232": "ER", "233": "EE",
  "242": "FJ", "246": "FI", "250": "FR", "266": "GA", "268": "GE",
  "270": "GM", "276": "DE", "288": "GH", "300": "GR", "320": "GT",
  "324": "GN", "328": "GY", "332": "HT", "340": "HN", "348": "HU",
  "352": "IS", "356": "IN", "360": "ID", "364": "IR", "368": "IQ",
  "372": "IE", "376": "IL", "380": "IT", "388": "JM", "392": "JP",
  "398": "KZ", "400": "JO", "404": "KE", "410": "KR", "414": "KW",
  "417": "KG", "418": "LA", "422": "LB", "426": "LS", "430": "LR",
  "434": "LY", "440": "LT", "442": "LU", "450": "MG", "454": "MW",
  "458": "MY", "466": "ML", "478": "MR", "484": "MX", "496": "MN",
  "498": "MD", "504": "MA", "508": "MZ", "512": "OM", "516": "NA",
  "524": "NP", "528": "NL", "540": "NC", "548": "VU", "554": "NZ",
  "558": "NI", "562": "NE", "566": "NG", "578": "NO", "586": "PK",
  "591": "PA", "598": "PG", "600": "PY", "604": "PE", "608": "PH",
  "616": "PL", "620": "PT", "630": "PR", "634": "QA", "642": "RO",
  "643": "RU", "646": "RW", "682": "SA", "686": "SN", "694": "SL",
  "702": "SG", "703": "SK", "704": "VN", "705": "SI", "706": "SO",
  "710": "ZA", "716": "ZW", "724": "ES", "729": "SD", "740": "SR",
  "748": "SZ", "752": "SE", "756": "CH", "760": "SY", "762": "TJ",
  "764": "TH", "768": "TG", "780": "TT", "784": "AE", "788": "TN",
  "792": "TR", "795": "TM", "800": "UG", "804": "UA", "818": "EG",
  "826": "GB", "834": "TZ", "840": "US", "854": "BF", "858": "UY",
  "860": "UZ", "862": "VE", "887": "YE", "894": "ZM",
  "-99": "XK",
  "010": "AQ",
};

const ANTARCTICA_ID = "010";

// 国名（ツールチップ用）
const COUNTRY_NAMES_JA = {
  UA: "ウクライナ", RU: "ロシア", SD: "スーダン", MM: "ミャンマー", PS: "パレスチナ", IL: "イスラエル", IR: "イラン",
  SY: "シリア", MX: "メキシコ", NG: "ナイジェリア", CD: "コンゴ民主共和国", ET: "エチオピア", SO: "ソマリア",
  YE: "イエメン", PK: "パキスタン", IN: "インド", CO: "コロンビア", HT: "ハイチ", EC: "エクアドル", BR: "ブラジル",
  AF: "アフガニスタン", MZ: "モザンビーク", BF: "ブルキナファソ", ML: "マリ", TD: "チャド", CM: "カメルーン",
  IQ: "イラク", NE: "ニジェール", CF: "中央アフリカ", SA: "サウジアラビア",
};

export default function ConflictMap({ isMobile, selectedConflict, onSelectConflict }) {
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 960, height: 460 });
  const [hoveredArc, setHoveredArc] = useState(null);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [animationProgress, setAnimationProgress] = useState(0);

  // Entry animation
  useEffect(() => {
    let frame;
    const start = performance.now();
    const duration = 1500;
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setAnimationProgress(progress);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Responsive sizing
  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect;
      setDimensions({ width, height: width * 0.55 });
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const countries = useMemo(() => {
    const all = feature(worldData, worldData.objects.countries);
    return {
      ...all,
      features: all.features.filter(f => {
        const numId = String(f.id).padStart(3, "0");
        return numId !== ANTARCTICA_ID && f.id !== 10;
      }),
    };
  }, []);

  const projection = useMemo(() => {
    return d3.geoMercator()
      .center([0, 30])
      .rotate([-150, 0])
      .scale(dimensions.width / 6.8)
      .translate([dimensions.width / 2, dimensions.height / 2])
      .clipExtent([[0, 0], [dimensions.width, dimensions.height]]);
  }, [dimensions]);

  const pathGenerator = useMemo(() => d3.geoPath().projection(projection), [projection]);

  const getCountryCode = useCallback((feat) => {
    const numId = String(feat.id).padStart(3, "0");
    return NUM_TO_ALPHA2[numId] || NUM_TO_ALPHA2[feat.id] || null;
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (tooltipRef.current) {
      tooltipRef.current.style.left = `${e.clientX + 14}px`;
      tooltipRef.current.style.top = `${e.clientY - 12}px`;
    }
  }, []);

  // 関係線のSVGパスを生成（quadratic bezier curve）
  const arcPaths = useMemo(() => {
    return CONFLICT_ARCS.map(arc => {
      const fromCoord = COUNTRY_COORDS[arc.from];
      const toCoord = COUNTRY_COORDS[arc.to];
      if (!fromCoord || !toCoord) return null;

      const from = projection(fromCoord);
      const to = projection(toCoord);
      if (!from || !to) return null;

      // Control point: midpoint raised upward proportional to distance
      const mx = (from[0] + to[0]) / 2;
      const my = (from[1] + to[1]) / 2;
      const dist = Math.sqrt((to[0] - from[0]) ** 2 + (to[1] - from[1]) ** 2);
      const curvature = Math.min(dist * 0.3, 60);
      const cy = my - curvature;

      const path = `M ${from[0]},${from[1]} Q ${mx},${cy} ${to[0]},${to[1]}`;
      const labelPos = { x: mx, y: cy - 6 };

      return { ...arc, path, from, to, labelPos };
    }).filter(Boolean);
  }, [projection]);

  // 国をクリックしたときに対応する紛争を選択
  const handleCountryClick = useCallback((code) => {
    if (!code || !COUNTRY_SEVERITY[code]) return;
    // この国が関与する紛争を探す（countries フィールドで検索）
    const conflict = CONFLICTS.find(c =>
      c.countries && c.countries.includes(code)
    );
    if (conflict) {
      onSelectConflict(conflict.id === selectedConflict ? null : conflict.id);
    }
  }, [selectedConflict, onSelectConflict]);

  // 選択中の紛争に関連する国をハイライト
  const selectedConflictData = useMemo(() => {
    if (!selectedConflict) return null;
    return CONFLICTS.find(c => c.id === selectedConflict);
  }, [selectedConflict]);

  const highlightedCountries = useMemo(() => {
    if (!selectedConflict) return new Set();
    const conflict = CONFLICTS.find(c => c.id === selectedConflict);
    if (conflict && conflict.countries) return new Set(conflict.countries);
    // Fallback: arc data
    const arc = CONFLICT_ARCS.find(a => a.conflictId === selectedConflict);
    if (arc) return new Set([arc.from, arc.to]);
    return new Set();
  }, [selectedConflict]);

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <svg
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          opacity: animationProgress,
          transition: "opacity 0.3s",
        }}
      >
        {/* Ocean */}
        <rect
          width={dimensions.width}
          height={dimensions.height}
          fill="#1a1a2e"
          onClick={() => onSelectConflict(null)}
          style={{ cursor: "default" }}
        />

        {/* Graticule */}
        <path
          d={pathGenerator(d3.geoGraticule10())}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={0.5}
        />

        {/* Countries */}
        {countries.features.map((feat, idx) => {
          const code = getCountryCode(feat);
          const severity = code ? COUNTRY_SEVERITY[code] : null;
          const severityData = severity
            ? Object.values(SEVERITY).find(s => s.key === severity)
            : SEVERITY.PEACE;

          const isHighlighted = highlightedCountries.has(code);
          const isHovered = code === hoveredCountry;

          // Wave animation
          const centroid = pathGenerator.centroid(feat);
          const delay = centroid[0] ? (centroid[0] / dimensions.width) * 0.5 : 0;
          const entryProgress = Math.max(0, Math.min(1, (animationProgress - delay) / 0.5));

          // Color: animate from dark to severity color
          let fill;
          if (severity) {
            const r = parseInt(severityData.color.slice(1, 3), 16);
            const g = parseInt(severityData.color.slice(3, 5), 16);
            const b = parseInt(severityData.color.slice(5, 7), 16);
            const t = entryProgress;
            fill = `rgb(${Math.round(26 + (r - 26) * t)},${Math.round(26 + (g - 26) * t)},${Math.round(26 + (b - 26) * t)})`;
          } else {
            fill = SEVERITY.PEACE.color;
          }

          // Dim when a conflict is selected and this country is not involved
          const dimmed = selectedConflict && !isHighlighted;

          let displayFill;
          if (isHighlighted) {
            // Selected conflict's country: bright color with glow
            displayFill = severityData.color;
          } else if (dimmed) {
            // Not involved: darken significantly
            displayFill = severity ? `${severityData.color}30` : "#181822";
          } else if (isHovered && severity) {
            displayFill = severityData.color;
          } else {
            displayFill = fill;
          }

          return (
            <path
              key={feat.id || idx}
              d={pathGenerator(feat)}
              fill={displayFill}
              stroke={isHighlighted ? "#fff" : "rgba(255,255,255,0.12)"}
              strokeWidth={isHighlighted ? 1.5 : 0.3}
              style={{
                transition: "fill 0.4s ease, stroke 0.3s",
                cursor: severity ? "pointer" : "default",
              }}
              onMouseEnter={() => {
                if (severity) setHoveredCountry(code);
              }}
              onMouseLeave={() => setHoveredCountry(null)}
              onMouseMove={handleMouseMove}
              onClick={() => handleCountryClick(code)}
            />
          );
        })}

        {/* Conflict arcs — desktop only */}
        {!isMobile && arcPaths.map((arc, i) => {
          const isSelected = selectedConflict === arc.conflictId;
          const isHoveredArc = hoveredArc === i;
          const opacity = selectedConflict
            ? (isSelected ? 1 : 0.15)
            : (isHoveredArc ? 1 : 0.6);

          return (
            <g key={`arc-${i}`}>
              {/* Hit area (wider invisible path for hover) */}
              <path
                d={arc.path}
                fill="none"
                stroke="transparent"
                strokeWidth={16}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHoveredArc(i)}
                onMouseLeave={() => setHoveredArc(null)}
                onMouseMove={handleMouseMove}
                onClick={() => onSelectConflict(arc.conflictId === selectedConflict ? null : arc.conflictId)}
              />
              {/* Visible arc */}
              <path
                d={arc.path}
                fill="none"
                stroke={arc.color}
                strokeWidth={isHoveredArc || isSelected ? 2.5 : 1.5}
                strokeDasharray={arc.dash ? "6,4" : "none"}
                opacity={opacity * animationProgress}
                style={{
                  transition: "stroke-width 0.2s, opacity 0.3s",
                  pointerEvents: "none",
                  filter: isHoveredArc || isSelected ? `drop-shadow(0 0 4px ${arc.color})` : "none",
                }}
              />
              {/* Arrow at endpoint */}
              <circle
                cx={arc.to[0]}
                cy={arc.to[1]}
                r={isHoveredArc || isSelected ? 4 : 3}
                fill={arc.color}
                opacity={opacity * animationProgress}
                style={{ transition: "r 0.2s, opacity 0.3s", pointerEvents: "none" }}
              />
              {/* Label */}
              {(isHoveredArc || isSelected) && (
                <text
                  x={arc.labelPos.x}
                  y={arc.labelPos.y}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize={10}
                  fontFamily={MONO}
                  style={{
                    textShadow: "0 0 6px rgba(0,0,0,0.8), 0 1px 3px rgba(0,0,0,0.9)",
                    pointerEvents: "none",
                  }}
                >
                  {arc.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend — bottom left */}
      <div style={{
        position: "absolute",
        bottom: isMobile ? 6 : 12,
        left: isMobile ? 6 : 12,
        background: "rgba(10,10,20,0.85)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 6,
        padding: isMobile ? "6px 8px" : "8px 12px",
        backdropFilter: "blur(8px)",
      }}>
        <div style={{
          fontFamily: MONO,
          fontSize: 8,
          color: "#888",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginBottom: 4,
        }}>
          Severity Level
        </div>
        {[SEVERITY.WAR, SEVERITY.ARMED, SEVERITY.LOW, SEVERITY.PEACE].map(s => (
          <div key={s.key} style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 2,
          }}>
            <div style={{
              width: 10, height: 10, borderRadius: 2,
              background: s.color,
              border: s.key === "peace" ? "1px solid rgba(255,255,255,0.2)" : "none",
            }} />
            <span style={{
              fontFamily: MONO,
              fontSize: isMobile ? 8 : 9,
              color: "#ccc",
            }}>
              {s.label}
              <span style={{ color: "#666", marginLeft: 4 }}>({s.desc})</span>
            </span>
          </div>
        ))}
      </div>

      {/* Country tooltip */}
      {hoveredCountry && COUNTRY_SEVERITY[hoveredCountry] && (
        <div
          ref={tooltipRef}
          style={{
            position: "fixed",
            padding: "8px 14px",
            background: "rgba(20,20,30,0.95)",
            border: `1px solid ${Object.values(SEVERITY).find(s => s.key === COUNTRY_SEVERITY[hoveredCountry])?.color || "#666"}50`,
            borderRadius: 6,
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            pointerEvents: "none",
            zIndex: 100,
            backdropFilter: "blur(8px)",
            maxWidth: 260,
          }}
        >
          <div style={{
            fontFamily: SERIF,
            fontSize: 13,
            color: "#fff",
            marginBottom: 3,
            fontWeight: 600,
          }}>
            {COUNTRY_NAMES_JA[hoveredCountry] || hoveredCountry}
          </div>
          <div style={{
            fontFamily: MONO,
            fontSize: 11,
            color: Object.values(SEVERITY).find(s => s.key === COUNTRY_SEVERITY[hoveredCountry])?.color,
            fontWeight: 700,
          }}>
            {Object.values(SEVERITY).find(s => s.key === COUNTRY_SEVERITY[hoveredCountry])?.label}
          </div>
        </div>
      )}

      {/* Arc tooltip */}
      {hoveredArc !== null && !hoveredCountry && (
        <div
          ref={tooltipRef}
          style={{
            position: "fixed",
            padding: "8px 14px",
            background: "rgba(20,20,30,0.95)",
            border: `1px solid ${arcPaths[hoveredArc]?.color || "#666"}50`,
            borderRadius: 6,
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            pointerEvents: "none",
            zIndex: 100,
            backdropFilter: "blur(8px)",
            maxWidth: 280,
          }}
        >
          <div style={{
            fontFamily: SERIF,
            fontSize: 13,
            color: "#fff",
            fontWeight: 600,
            marginBottom: 3,
          }}>
            {arcPaths[hoveredArc]?.label}
          </div>
          {(() => {
            const conflict = CONFLICTS.find(c => c.id === arcPaths[hoveredArc]?.conflictId);
            if (!conflict) return null;
            return (
              <div style={{ fontFamily: MONO, fontSize: 10, color: "#aaa", lineHeight: 1.5 }}>
                {conflict.summary}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
