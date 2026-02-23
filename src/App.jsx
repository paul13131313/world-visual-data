import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { THEMES } from "./data/themes";
import WorldMap from "./components/WorldMap";
import ThemeSelector from "./components/ThemeSelector";
import DetailPanel from "./components/DetailPanel";
import RankingBar from "./components/RankingBar";
import PhotoPanel from "./components/PhotoPanel";
import ParticlesBg from "./components/ParticlesBg";
import ConflictMap from "./components/ConflictMap";
import ConflictPanel from "./components/ConflictPanel";

const SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";
const MONO = "'JetBrains Mono', 'SF Mono', 'Fira Code', 'Courier New', monospace";

const CONFLICT_COLOR = "#ff2d55";

export default function App() {
  const [themeIndex, setThemeIndex] = useState(0);
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [viewMode, setViewMode] = useState("data"); // "data" | "conflict"
  const [selectedConflict, setSelectedConflict] = useState(null);

  const theme = THEMES[themeIndex];
  const activeCode = selected || hovered;
  const isConflict = viewMode === "conflict";
  const accentColor = isConflict ? CONFLICT_COLOR : theme.color;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleThemeChange = (index) => {
    setThemeIndex(index);
    setSelected(null);
  };

  const handleSelect = (code) => {
    const newCode = code === selected ? null : code;
    setSelected(newCode);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setSelected(null);
    setHovered(null);
    setSelectedConflict(null);
  };

  return (
    <div style={{
      minHeight: "100vh",
      overflow: isMobile ? "auto" : "hidden",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      background: isConflict ? "#0a0a14" : undefined,
      transition: "background 0.6s",
    }}>
      {!isMobile && <ParticlesBg color={accentColor} />}

      {/* Ambient neon glow */}
      <div style={{
        position: "fixed", top: "-15%", left: "20%", width: "60%", height: "45%",
        background: `radial-gradient(ellipse, ${accentColor}08, transparent 65%)`,
        pointerEvents: "none", transition: "background 1.2s ease", zIndex: 0,
      }} />

      <div style={{
        maxWidth: 1400,
        width: "100%",
        margin: "0 auto",
        padding: isMobile ? "8px 10px 16px" : "12px 20px 8px",
        position: "relative",
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: isMobile ? "auto" : "100vh",
        height: isMobile ? "auto" : "100vh",
        overflow: isMobile ? "visible" : "hidden",
      }}>
        {/* ── Header ── */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            marginBottom: 8,
            paddingBottom: 8,
            borderBottom: `1px solid ${accentColor}18`,
            transition: "border-color 0.8s",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            flexWrap: "wrap",
            gap: 4,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 6 : 10 }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: accentColor,
              boxShadow: `0 0 8px ${accentColor}, 0 0 20px ${accentColor}50`,
              transition: "all 0.5s",
            }} />
            <h1 style={{
              fontFamily: SERIF,
              fontSize: isMobile ? "16px" : "clamp(18px, 2.5vw, 26px)",
              fontWeight: 400, fontStyle: "italic",
              color: isConflict ? "#eee" : "#222",
              margin: 0, letterSpacing: "0.06em",
              transition: "color 0.5s",
            }}>
              World Visual Data
            </h1>

            {/* ── View mode tabs ── */}
            <div style={{
              display: "flex",
              gap: 2,
              marginLeft: isMobile ? 4 : 12,
              background: isConflict ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
              borderRadius: 4,
              padding: 2,
              transition: "background 0.5s",
            }}>
              {[
                { key: "data", label: "Data", icon: "\ud83d\udcca" },
                { key: "conflict", label: "\u7d1b\u4e89\u30de\u30c3\u30d7", icon: "\u2694\ufe0f" },
              ].map(tab => {
                const isActive = viewMode === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => handleViewModeChange(tab.key)}
                    style={{
                      fontFamily: MONO,
                      fontSize: isMobile ? 9 : 10,
                      padding: isMobile ? "3px 6px" : "3px 10px",
                      borderRadius: 3,
                      color: isActive
                        ? (tab.key === "conflict" ? CONFLICT_COLOR : theme.color)
                        : (isConflict ? "#888" : "#999"),
                      background: isActive
                        ? (isConflict ? "rgba(255,45,85,0.12)" : "rgba(255,255,255,0.7)")
                        : "transparent",
                      border: isActive
                        ? `1px solid ${tab.key === "conflict" ? CONFLICT_COLOR : theme.color}30`
                        : "1px solid transparent",
                      letterSpacing: "0.05em",
                      fontWeight: isActive ? 700 : 400,
                      transition: "all 0.3s",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tab.icon} {isMobile ? "" : tab.label}
                  </button>
                );
              })}
            </div>
          </div>
          {!isMobile && (
            <span style={{
              fontFamily: MONO, fontSize: 8,
              color: isConflict ? "#666" : "#bbb",
              letterSpacing: "0.1em",
              transition: "color 0.5s",
            }}>
              {isConflict
                ? "Source: ACLED Conflict Index 2025, Wikipedia"
                : "Source: World Bank, UNESCO, IEA, UNDP (2020\u20132024)"
              }
            </span>
          )}
        </motion.header>

        {/* ── Theme Selector (data mode only) ── */}
        {!isConflict && (
          <div style={{ flexShrink: 0 }}>
            <ThemeSelector activeIndex={themeIndex} onChange={handleThemeChange} isMobile={isMobile} />
          </div>
        )}

        {/* ── Main content ── */}
        <div style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 10 : 14,
          flex: isMobile ? "none" : 1,
          minHeight: 0,
          overflow: isMobile ? "visible" : "hidden",
        }}>
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              flex: isMobile ? "none" : 1,
              minWidth: 0,
              background: isConflict ? "rgba(10,10,20,0.6)" : "rgba(255,255,255,0.45)",
              borderTop: `1px solid ${accentColor}15`,
              borderBottom: `1px solid ${accentColor}15`,
              borderRadius: 0,
              margin: 0,
              padding: "6px 0 6px",
              position: "relative",
              overflow: "hidden",
              backdropFilter: "blur(10px)",
              transition: "border-color 0.8s, background 0.6s",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Top neon line */}
            <div style={{
              position: "absolute", top: 0, left: "5%", right: "5%", height: 1,
              background: `linear-gradient(90deg, transparent, ${accentColor}35, transparent)`,
              transition: "background 0.8s",
            }} />

            <div style={{ flex: isMobile ? "none" : 1, minHeight: 0 }}>
              {isConflict ? (
                <ConflictMap
                  isMobile={isMobile}
                  selectedConflict={selectedConflict}
                  onSelectConflict={setSelectedConflict}
                />
              ) : (
                <WorldMap
                  theme={theme}
                  hovered={hovered}
                  selected={selected}
                  onHover={setHovered}
                  onSelect={handleSelect}
                  isLoaded={isLoaded}
                />
              )}
            </div>

            {/* Legend + Detail inline (data mode only) */}
            {!isConflict && (
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 4,
                paddingTop: 4,
                padding: isMobile ? "4px 6px 0" : "4px 10px 0",
                flexShrink: 0,
                flexWrap: isMobile ? "wrap" : "nowrap",
                gap: isMobile ? 4 : 0,
              }}>
                {theme.isVisited ? (
                  <span style={{
                    fontFamily: MONO, fontSize: 9, color: "#999",
                    letterSpacing: "0.05em", opacity: 0.7,
                  }}>
                    Click a country to see photos
                  </span>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontFamily: MONO, fontSize: 8, color: "#999", letterSpacing: "0.1em" }}>LOW</span>
                    <div style={{
                      width: isMobile ? 50 : 80, height: 4, borderRadius: 2,
                      background: `linear-gradient(90deg, ${theme.lo}, ${theme.color})`,
                      boxShadow: `0 0 6px ${theme.color}20`, transition: "all 0.6s",
                    }} />
                    <span style={{ fontFamily: MONO, fontSize: 8, color: "#999", letterSpacing: "0.1em" }}>HIGH</span>
                  </div>
                )}
                {activeCode && (
                  <DetailPanel code={activeCode} activeThemeIndex={themeIndex} theme={theme} inline />
                )}
              </div>
            )}
          </motion.div>

          {/* Right panel */}
          <motion.div
            initial={{ opacity: 0, x: isMobile ? 0 : 20, y: isMobile ? 20 : 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{
              width: isMobile ? "100%" : 340,
              flexShrink: 0,
              overflow: isMobile ? "visible" : "hidden",
              paddingRight: isMobile ? 0 : 4,
              paddingBottom: isMobile ? 20 : 0,
              display: "flex",
              flexDirection: "column",
              background: isConflict ? "rgba(10,10,20,0.6)" : undefined,
              borderTop: isConflict ? `1px solid ${CONFLICT_COLOR}15` : undefined,
              borderBottom: isConflict ? `1px solid ${CONFLICT_COLOR}15` : undefined,
              backdropFilter: isConflict ? "blur(10px)" : undefined,
              transition: "background 0.6s",
            }}
          >
            {isConflict ? (
              <ConflictPanel
                selectedConflict={selectedConflict}
                onSelectConflict={setSelectedConflict}
                isMobile={isMobile}
              />
            ) : theme.isVisited ? (
              <PhotoPanel
                selectedCountry={selected}
                themeColor={theme.color}
              />
            ) : (
              <RankingBar
                theme={theme}
                hovered={hovered}
                selected={selected}
                onHover={setHovered}
                onSelect={handleSelect}
              />
            )}
          </motion.div>
        </div>
      </div>

    </div>
  );
}
