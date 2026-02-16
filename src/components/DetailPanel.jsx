import { motion, AnimatePresence } from "framer-motion";
import { COUNTRIES } from "../data/countries";

const SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";
const MONO = "'JetBrains Mono', 'SF Mono', 'Fira Code', 'Courier New', monospace";

export default function DetailPanel({ code, activeThemeIndex, theme, inline }) {
  const country = code ? COUNTRIES[code] : null;
  if (!country) return null;

  const val = country[theme.field];
  const formatted = val !== undefined && val !== null ? val.toLocaleString() : "—";

  // Inline mode: compact single-line display for map footer
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={code}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        transition={{ duration: 0.2 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{
          fontFamily: SERIF,
          fontSize: 13,
          fontStyle: "italic",
          color: "#333",
        }}>
          {country.nameJa}
        </span>
        <span style={{
          fontFamily: MONO,
          fontSize: 9,
          color: theme.color,
          opacity: 0.6,
        }}>
          {code}
        </span>
        <span style={{
          fontFamily: MONO,
          fontSize: 14,
          fontWeight: 700,
          color: "#222",
          textShadow: `0 0 8px ${theme.color}20`,
        }}>
          {formatted}
          <span style={{ fontSize: 9, color: "#888", marginLeft: 3, fontWeight: 400 }}>
            {theme.unit}
          </span>
        </span>
      </motion.div>
    </AnimatePresence>
  );
}
