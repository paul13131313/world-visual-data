import { useMemo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { COUNTRIES, COUNTRY_CODES } from "../data/countries";

const SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";
const MONO = "'JetBrains Mono', 'SF Mono', 'Fira Code', 'Courier New', monospace";

function CountUpNumber({ value, unit, color, isHovered }) {
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

export default function RankingBar({ theme, hovered, selected, onHover, onSelect }) {
  const { sorted, maxVal } = useMemo(() => {
    const entries = COUNTRY_CODES
      .map(code => ({ code, ...COUNTRIES[code] }))
      .filter(c => c[theme.field] !== undefined);
    entries.sort((a, b) => Math.abs(b[theme.field]) - Math.abs(a[theme.field]));
    const max = Math.max(...entries.map(c => Math.abs(c[theme.field])));
    return { sorted: entries.slice(0, 10), maxVal: max };
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
        Top 10 —{" "}
        <span style={{
          color: theme.color,
          transition: "color 0.5s",
          textShadow: `0 0 8px ${theme.color}25`,
        }}>
          {theme.label}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <AnimatePresence mode="popLayout">
          {sorted.map((c, i) => {
            const val = Math.abs(c[theme.field]);
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
                  value={c[theme.field]}
                  unit={theme.unit}
                  color={theme.color}
                  isHovered={isH}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

    </div>
  );
}
