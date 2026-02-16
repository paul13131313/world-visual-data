import { useMemo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { COUNTRIES, COUNTRY_CODES } from "../data/countries";

const SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";
const MONO = "'JetBrains Mono', 'SF Mono', 'Fira Code', 'Courier New', monospace";

// Favorites ranking for visited theme (includes extra countries not in COUNTRIES data)
const FAVORITES_RANKING = [
  { code: "KZ", nameJa: "カザフスタン", favorites: 10 },
  { code: "FI", nameJa: "フィンランド", favorites: 9 },
  { code: "CZ", nameJa: "チェコ", favorites: 8 },
  { code: "GB", nameJa: "イギリス", favorites: 7 },
  { code: "AR", nameJa: "アルゼンチン", favorites: 6 },
  { code: "IS", nameJa: "アイスランド", favorites: 5 },
  { code: "TZ", nameJa: "タンザニア", favorites: 4 },
  { code: "TR", nameJa: "トルコ", favorites: 3 },
  { code: "MX", nameJa: "メキシコ", favorites: 2 },
  { code: "TW", nameJa: "台湾", favorites: 1 },
];

function CountUpNumber({ value, unit, color, isHovered, isVisitedTheme }) {
  const [displayVal, setDisplayVal] = useState(0);

  useEffect(() => {
    const duration = 600;
    const start = performance.now();
    const from = displayVal;
    const to = value;

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * eased;
      setDisplayVal(current);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);

  if (isVisitedTheme) {
    return (
      <span style={{
        fontFamily: MONO,
        fontSize: 10,
        color: isHovered ? color : "#555",
        width: 70,
        textAlign: "right",
        fontVariantNumeric: "tabular-nums",
        transition: "color 0.3s",
        textShadow: isHovered ? `0 0 8px ${color}25` : "none",
      }}>
        ♥
      </span>
    );
  }

  const formatted = displayVal >= 1000
    ? displayVal.toLocaleString(undefined, { maximumFractionDigits: 0 })
    : displayVal.toLocaleString(undefined, { maximumFractionDigits: 1 });

  return (
    <span style={{
      fontFamily: MONO,
      fontSize: 10,
      color: isHovered ? color : "#555",
      width: 70,
      textAlign: "right",
      fontVariantNumeric: "tabular-nums",
      transition: "color 0.3s",
      textShadow: isHovered ? `0 0 8px ${color}25` : "none",
    }}>
      {formatted} {unit}
    </span>
  );
}

export default function RankingBar({ theme, hovered, selected, onHover, onSelect, onOpenAllPhotos }) {
  const { sorted, maxVal, isVisitedRanking } = useMemo(() => {
    if (theme.isVisited) {
      // Visited theme: show favorites ranking (hardcoded Top 10)
      const max = Math.max(...FAVORITES_RANKING.map(c => c.favorites));
      return { sorted: FAVORITES_RANKING, maxVal: max, isVisitedRanking: true };
    }
    const entries = COUNTRY_CODES
      .map(code => ({ code, ...COUNTRIES[code] }))
      .filter(c => c[theme.field] !== undefined);
    entries.sort((a, b) => Math.abs(b[theme.field]) - Math.abs(a[theme.field]));
    const max = Math.max(...entries.map(c => Math.abs(c[theme.field])));
    return { sorted: entries.slice(0, 10), maxVal: max, isVisitedRanking: false };
  }, [theme]);

  return (
    <div>
      <div style={{
        fontFamily: SERIF,
        fontSize: 13,
        fontStyle: "italic",
        fontWeight: 400,
        color: "#666",
        marginBottom: 10,
      }}>
        {isVisitedRanking ? "Favorites —" : "Top 10 —"}{" "}
        <span style={{
          color: theme.color,
          transition: "color 0.5s",
          textShadow: `0 0 8px ${theme.color}25`,
        }}>
          {isVisitedRanking ? "好きな国" : theme.label}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <AnimatePresence mode="popLayout">
          {sorted.map((c, i) => {
            const val = isVisitedRanking ? c.favorites : Math.abs(c[theme.field]);
            const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
            const isH = hovered === c.code || selected === c.code;

            return (
              <motion.div
                key={c.code}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                onMouseEnter={() => onHover(c.code)}
                onMouseLeave={() => onHover(null)}
                onClick={() => onSelect(c.code === selected ? null : c.code)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
                  padding: "3px 0",
                }}
              >
                <span style={{
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontSize: 11,
                  color: isH ? theme.color : "#bbb",
                  width: 18,
                  textAlign: "right",
                  transition: "color 0.3s",
                  textShadow: isH ? `0 0 6px ${theme.color}30` : "none",
                }}>
                  {i + 1}
                </span>

                <span style={{
                  fontFamily: SERIF,
                  fontSize: 11,
                  fontStyle: "italic",
                  color: isH ? "#222" : "#777",
                  width: 100,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  transition: "color 0.3s",
                }}>
                  {c.nameJa}
                </span>

                <div style={{
                  flex: 1,
                  height: 14,
                  background: "rgba(0,0,0,0.03)",
                  borderRadius: 2,
                  overflow: "hidden",
                  position: "relative",
                }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    style={{
                      height: "100%",
                      borderRadius: 2,
                      background: `linear-gradient(90deg, ${theme.lo}, ${theme.color})`,
                      boxShadow: isH ? `0 0 12px ${theme.color}25` : "none",
                      transition: "background 0.6s, box-shadow 0.3s",
                    }}
                  />
                  {isH && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{
                        position: "absolute",
                        top: 0,
                        right: `${100 - pct}%`,
                        width: 2,
                        height: "100%",
                        background: theme.color,
                        boxShadow: `0 0 8px ${theme.color}`,
                      }}
                    />
                  )}
                </div>

                <CountUpNumber
                  value={isVisitedRanking ? c.favorites : c[theme.field]}
                  unit={theme.unit}
                  color={theme.color}
                  isHovered={isH}
                  isVisitedTheme={isVisitedRanking}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* All Photos button for visited theme */}
      {isVisitedRanking && onOpenAllPhotos && (
        <button
          onClick={onOpenAllPhotos}
          style={{
            marginTop: 14,
            width: "100%",
            padding: "8px 0",
            background: "none",
            border: `1px solid ${theme.color}30`,
            borderRadius: 4,
            color: theme.color,
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: "0.08em",
            cursor: "pointer",
            transition: "all 0.3s",
            opacity: 0.7,
          }}
          onMouseEnter={e => { e.target.style.opacity = "1"; e.target.style.borderColor = theme.color; }}
          onMouseLeave={e => { e.target.style.opacity = "0.7"; e.target.style.borderColor = `${theme.color}30`; }}
        >
          All Photos →
        </button>
      )}
    </div>
  );
}
