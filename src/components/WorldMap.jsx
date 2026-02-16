import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import * as d3 from "d3";
import { feature } from "topojson-client";
import worldData from "world-atlas/countries-110m.json";
import { COUNTRIES } from "../data/countries";

// Known coordinates for small countries that are hard to find on the map
// [longitude, latitude]
const SMALL_COUNTRY_COORDS = {
  SG: [103.8, 1.35],    // Singapore
  QA: [51.5, 25.3],     // Qatar
  KW: [47.5, 29.3],     // Kuwait
  BN: [114.9, 4.9],     // Brunei
  LU: [6.1, 49.6],      // Luxembourg
  CY: [33.4, 35.1],     // Cyprus
  LB: [35.5, 33.9],     // Lebanon
  JM: [-77.3, 18.1],    // Jamaica
  TT: [-61.2, 10.5],    // Trinidad and Tobago
  SZ: [31.5, -26.3],    // Eswatini
  LS: [28.2, -29.6],    // Lesotho
  GM: [-15.4, 13.5],    // Gambia
  SI: [14.5, 46.1],     // Slovenia
  IL: [34.8, 31.0],     // Israel
  AE: [54.0, 24.0],     // UAE
  JO: [36.2, 31.0],     // Jordan
};

// ISO numeric → ISO alpha-2 mapping
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
  "010": "AQ", // Antarctica - to filter out
};

// Antarctica ID to filter
const ANTARCTICA_ID = "010";

function lerpColor(lo, hi, t) {
  t = Math.max(0, Math.min(1, t));
  const p = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const a = p(lo), b = p(hi);
  const m = a.map((v, i) => Math.round(v + (b[i] - v) * (t * t)));
  return `rgb(${m[0]},${m[1]},${m[2]})`;
}

export default function WorldMap({ theme, hovered, selected, onHover, onSelect, isLoaded }) {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 960, height: 460 });
  const containerRef = useRef(null);
  const [animationProgress, setAnimationProgress] = useState(0);

  // Load animation
  useEffect(() => {
    if (!isLoaded) return;
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
  }, [isLoaded]);

  // Responsive sizing
  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect;
      setDimensions({ width, height: width * 0.55 });
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Filter out Antarctica
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

  // Mercator — Pacific-centered (Japanese map style)
  const projection = useMemo(() => {
    return d3.geoMercator()
      .center([0, 15])
      .rotate([-150, 0]) // 150°E center — left: Europe/Africa, right: Americas
      .scale(dimensions.width / 6.8)
      .translate([dimensions.width / 2, dimensions.height / 2])
      .clipExtent([[0, 0], [dimensions.width, dimensions.height]]);
  }, [dimensions]);

  const pathGenerator = useMemo(() => d3.geoPath().projection(projection), [projection]);

  // Compute max for normalization
  const maxVal = useMemo(() => {
    const vals = Object.values(COUNTRIES).map(c => Math.abs(c[theme.field] ?? 0));
    return Math.max(...vals);
  }, [theme]);

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

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          opacity: animationProgress,
          transition: "opacity 0.3s",
        }}
      >
        <defs>
          <filter id="mapGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ocean background */}
        <rect width={dimensions.width} height={dimensions.height} fill="#d8dbe2" />

        {/* Graticule */}
        <path
          d={pathGenerator(d3.geoGraticule10())}
          fill="none"
          stroke="rgba(0,0,0,0.03)"
          strokeWidth={0.5}
        />

        {/* Countries */}
        {countries.features.map((feat, idx) => {
          const code = getCountryCode(feat);
          const countryData = code ? COUNTRIES[code] : null;
          const val = countryData ? Math.abs(countryData[theme.field] ?? 0) : 0;
          const t = maxVal > 0 ? val / maxVal : 0;
          const isHovered = code === hovered;
          const isSelected = code === selected;
          const isActive = isHovered || isSelected;

          // Wave animation delay based on centroid
          const centroid = pathGenerator.centroid(feat);
          const delay = centroid[0] ? (centroid[0] / dimensions.width) * 0.8 : 0;
          const entryProgress = Math.max(0, Math.min(1, (animationProgress - delay) / 0.4));

          const fill = countryData
            ? lerpColor(theme.lo, theme.hi, t * entryProgress)
            : "#c8cad0";

          // Dimming: when a country is hovered/selected, fade others
          const hasFocus = hovered || selected;
          const dimmed = hasFocus && !isActive;

          // Check if this is a small country by path bounding box area
          const pathD = pathGenerator(feat);
          const isSmall = (() => {
            if (!pathD || !code || !countryData) return false;
            const bounds = pathGenerator.bounds(feat);
            const bw = bounds[1][0] - bounds[0][0];
            const bh = bounds[1][1] - bounds[0][1];
            return (bw * bh) < 120; // small threshold in SVG pixels²
          })();

          return (
            <g key={feat.id || idx}>
              <path
                d={pathD}
                fill={dimmed ? "#bfc3ca" : fill}
                stroke="rgba(255,255,255,0.4)"
                strokeWidth={0.3}
                style={{
                  transition: "fill 0.4s ease",
                  cursor: countryData ? "pointer" : "default",
                }}
                onMouseEnter={() => {
                  if (code && countryData) onHover(code);
                }}
                onMouseLeave={() => onHover(null)}
                onMouseMove={handleMouseMove}
                onClick={() => {
                  if (code && countryData) onSelect(code === selected ? null : code);
                }}
              />
              {/* Pulse ring for small countries when active */}
              {isActive && isSmall && (() => {
                const coords = SMALL_COUNTRY_COORDS[code];
                if (!coords) return null;
                const pos = projection(coords);
                if (!pos) return null;
                return (
                  <>
                    <circle
                      cx={pos[0]} cy={pos[1]} r={4}
                      fill={theme.color}
                      opacity={0.8}
                    />
                    <circle
                      cx={pos[0]} cy={pos[1]} r={4}
                      fill="none"
                      stroke={theme.color}
                      strokeWidth={1.5}
                      opacity={0.6}
                    >
                      <animate attributeName="r" from="4" to="18" dur="1.2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.6" to="0" dur="1.2s" repeatCount="indefinite" />
                    </circle>
                    <circle
                      cx={pos[0]} cy={pos[1]} r={4}
                      fill="none"
                      stroke={theme.color}
                      strokeWidth={1}
                      opacity={0.4}
                    >
                      <animate attributeName="r" from="4" to="18" dur="1.2s" begin="0.4s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.4" to="0" dur="1.2s" begin="0.4s" repeatCount="indefinite" />
                    </circle>
                  </>
                );
              })()}
            </g>
          );
        })}
      </svg>

      {/* Floating tooltip with Japanese name */}
      {hovered && COUNTRIES[hovered] && (
        <div
          ref={tooltipRef}
          style={{
            position: "fixed",
            padding: "8px 14px",
            background: "rgba(30,32,40,0.95)",
            border: `1px solid ${theme.color}50`,
            borderRadius: 6,
            boxShadow: `0 4px 20px rgba(0,0,0,0.3), 0 0 15px ${theme.color}15`,
            pointerEvents: "none",
            zIndex: 100,
            backdropFilter: "blur(8px)",
            maxWidth: 240,
          }}
        >
          <div style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 13,
            color: "#fff",
            marginBottom: 3,
            display: "flex",
            alignItems: "baseline",
            gap: 6,
          }}>
            <span style={{ fontWeight: 600 }}>{COUNTRIES[hovered].nameJa}</span>
            <span style={{ fontSize: 10, color: "#888", fontStyle: "italic" }}>{COUNTRIES[hovered].name}</span>
          </div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 16,
            fontWeight: 700,
            color: theme.color,
            textShadow: `0 0 8px ${theme.color}40`,
          }}>
            {(COUNTRIES[hovered][theme.field] ?? 0).toLocaleString()}
            <span style={{ fontSize: 10, color: "#888", marginLeft: 4, fontWeight: 400 }}>{theme.unit}</span>
          </div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            color: "#666",
            marginTop: 2,
          }}>
            {theme.desc}
          </div>
        </div>
      )}
    </div>
  );
}
