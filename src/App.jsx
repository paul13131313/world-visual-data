import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { THEMES } from "./data/themes";
import WorldMap from "./components/WorldMap";
import ThemeSelector from "./components/ThemeSelector";
import DetailPanel from "./components/DetailPanel";
import RankingBar from "./components/RankingBar";
import ParticlesBg from "./components/ParticlesBg";

const SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";
const MONO = "'JetBrains Mono', 'SF Mono', 'Fira Code', 'Courier New', monospace";

export default function App() {
  const [themeIndex, setThemeIndex] = useState(0);
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const theme = THEMES[themeIndex];
  const activeCode = selected || hovered;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleThemeChange = (index) => {
    setThemeIndex(index);
    setSelected(null);
  };

  return (
    <div style={{
      height: "100vh",
      overflow: "hidden",
      position: "relative",
      display: "flex",
      flexDirection: "column",
    }}>
      <ParticlesBg color={theme.color} />

      {/* Ambient neon glow */}
      <div style={{
        position: "fixed", top: "-15%", left: "20%", width: "60%", height: "45%",
        background: `radial-gradient(ellipse, ${theme.color}08, transparent 65%)`,
        pointerEvents: "none", transition: "background 1.2s ease", zIndex: 0,
      }} />

      <div style={{
        maxWidth: 1400,
        width: "100%",
        margin: "0 auto",
        padding: "12px 20px 8px",
        position: "relative",
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}>
        {/* ── Header (compact) ── */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            marginBottom: 8,
            paddingBottom: 8,
            borderBottom: `1px solid ${theme.color}18`,
            transition: "border-color 0.8s",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: theme.color,
              boxShadow: `0 0 8px ${theme.color}, 0 0 20px ${theme.color}50`,
              transition: "all 0.5s",
            }} />
            <h1 style={{
              fontFamily: SERIF,
              fontSize: "clamp(18px, 2.5vw, 26px)",
              fontWeight: 400, fontStyle: "italic", color: "#222",
              margin: 0, letterSpacing: "0.06em",
            }}>
              World Visual Data
            </h1>
            <span style={{
              fontFamily: MONO, fontSize: 9, color: theme.color,
              letterSpacing: "0.18em", textTransform: "uppercase",
              opacity: 0.55, transition: "color 0.6s", marginLeft: 6,
            }}>
              Interactive Global Dashboard
            </span>
          </div>
          <span style={{
            fontFamily: MONO, fontSize: 8, color: "#bbb", letterSpacing: "0.1em",
          }}>
            Source: World Bank, UNESCO, IEA, UNDP (2020–2024)
          </span>
        </motion.header>

        {/* ── Theme Selector (compact) ── */}
        <div style={{ flexShrink: 0 }}>
          <ThemeSelector activeIndex={themeIndex} onChange={handleThemeChange} />
        </div>

        {/* ── Main content: Map + Ranking side by side ── */}
        <div style={{
          display: "flex",
          gap: 14,
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
        }}>
          {/* Left: Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              flex: 1,
              minWidth: 0,
              background: "rgba(255,255,255,0.45)",
              borderTop: `1px solid ${theme.color}15`,
              borderBottom: `1px solid ${theme.color}15`,
              borderRadius: 0,
              margin: 0,
              padding: "6px 0 6px",
              position: "relative",
              overflow: "hidden",
              backdropFilter: "blur(10px)",
              transition: "border-color 0.8s",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Top neon line */}
            <div style={{
              position: "absolute", top: 0, left: "5%", right: "5%", height: 1,
              background: `linear-gradient(90deg, transparent, ${theme.color}35, transparent)`,
              transition: "background 0.8s",
            }} />

            <div style={{ flex: 1, minHeight: 0 }}>
              <WorldMap
                theme={theme}
                hovered={hovered}
                selected={selected}
                onHover={setHovered}
                onSelect={setSelected}
                isLoaded={isLoaded}
              />
            </div>

            {/* Legend + Detail inline */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 4,
              paddingTop: 4,
              padding: "4px 10px 0",
              flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontFamily: MONO, fontSize: 8, color: "#999", letterSpacing: "0.1em" }}>LOW</span>
                <div style={{
                  width: 80, height: 4, borderRadius: 2,
                  background: `linear-gradient(90deg, ${theme.lo}, ${theme.color})`,
                  boxShadow: `0 0 6px ${theme.color}20`, transition: "all 0.6s",
                }} />
                <span style={{ fontFamily: MONO, fontSize: 8, color: "#999", letterSpacing: "0.1em" }}>HIGH</span>
              </div>
              {/* Inline detail for hovered country */}
              {activeCode && (
                <DetailPanel code={activeCode} activeThemeIndex={themeIndex} theme={theme} inline />
              )}
            </div>
          </motion.div>

          {/* Right: Ranking */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{
              width: 340,
              flexShrink: 0,
              overflow: "auto",
              paddingRight: 4,
            }}
          >
            <RankingBar
              theme={theme}
              hovered={hovered}
              selected={selected}
              onHover={setHovered}
              onSelect={setSelected}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
