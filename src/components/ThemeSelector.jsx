import { useState } from "react";
import { THEMES, THEME_CATEGORIES } from "../data/themes";
import { motion, AnimatePresence } from "framer-motion";

const SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";
const MONO = "'JetBrains Mono', 'SF Mono', 'Fira Code', 'Courier New', monospace";

export default function ThemeSelector({ activeIndex, onChange, isMobile }) {
  // Default: open the category of the active theme
  const activeTheme = THEMES[activeIndex];
  const [expandedCategory, setExpandedCategory] = useState(activeTheme.category);

  // Group themes by category
  const grouped = {};
  THEMES.forEach((t, i) => {
    if (!grouped[t.category]) grouped[t.category] = [];
    grouped[t.category].push({ ...t, index: i });
  });

  const categoryOrder = ["economy", "society", "environment", "technology", "other"];

  const handleCategoryClick = (cat) => {
    setExpandedCategory(expandedCategory === cat ? null : cat);
  };

  const handleThemeClick = (index) => {
    onChange(index);
    // Keep the category open
  };

  return (
    <div style={{ marginBottom: 6 }}>
      {/* Category + theme buttons */}
      <div style={{
        display: "flex",
        gap: 3,
        marginBottom: 6,
        flexWrap: isMobile ? "nowrap" : "wrap",
        alignItems: "center",
        overflowX: isMobile ? "auto" : "visible",
        WebkitOverflowScrolling: "touch",
        paddingBottom: isMobile ? 4 : 0,
        scrollbarWidth: "none",
      }}>
        {categoryOrder.map(cat => {
          const catInfo = THEME_CATEGORIES[cat];
          const isExpanded = expandedCategory === cat;
          const hasActive = grouped[cat]?.some(t => t.index === activeIndex);

          return (
            <div key={cat} style={{ display: "flex", gap: 2, alignItems: "center" }}>
              <button
                onClick={() => handleCategoryClick(cat)}
                style={{
                  padding: "4px 10px",
                  fontFamily: SERIF,
                  fontSize: 11,
                  fontStyle: "italic",
                  cursor: "pointer",
                  borderRadius: 3,
                  transition: "all 0.3s",
                  background: isExpanded ? "rgba(0,0,0,0.08)" : hasActive ? "rgba(0,0,0,0.04)" : "rgba(0,0,0,0.01)",
                  border: `1px solid ${isExpanded ? activeTheme.color + "50" : hasActive ? activeTheme.color + "25" : "rgba(0,0,0,0.05)"}`,
                  color: isExpanded ? "#333" : hasActive ? "#555" : "#999",
                }}
              >
                {catInfo.label}
              </button>

              {/* Inline theme buttons when expanded */}
              {isExpanded && (
                <AnimatePresence>
                  {grouped[cat]?.map(t => {
                    const isActive = t.index === activeIndex;
                    return (
                      <motion.button
                        key={t.key}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => handleThemeClick(t.index)}
                        style={{
                          padding: "4px 10px",
                          fontFamily: MONO,
                          fontSize: 10,
                          cursor: "pointer",
                          borderRadius: 3,
                          transition: "all 0.3s",
                          background: isActive ? `${t.color}15` : "transparent",
                          border: isActive ? `1px solid ${t.color}60` : "1px solid transparent",
                          color: isActive ? "#333" : "#888",
                          boxShadow: isActive ? `0 0 10px ${t.color}15` : "none",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {t.label}
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              )}

              {/* Separator between categories */}
              {cat !== "other" && !isMobile && (
                <div style={{
                  width: 1,
                  height: 16,
                  background: "rgba(0,0,0,0.06)",
                  margin: "0 2px",
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Active theme indicator */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
      }}>
        <div style={{
          width: 6, height: 6, borderRadius: "50%",
          background: activeTheme.color,
          boxShadow: `0 0 6px ${activeTheme.color}, 0 0 16px ${activeTheme.color}40`,
          transition: "all 0.5s",
          flexShrink: 0,
        }} />
        <span style={{
          fontFamily: SERIF,
          fontSize: 12,
          fontStyle: "italic",
          color: "#555",
        }}>
          {activeTheme.desc}
        </span>
        {activeTheme.unit && (
          <span style={{
            fontFamily: MONO,
            fontSize: 9,
            color: activeTheme.color,
            opacity: 0.5,
          }}>
            [{activeTheme.unit}]
          </span>
        )}
        {activeTheme.year && (
          <span style={{
            fontFamily: MONO,
            fontSize: 8,
            color: "#aaa",
            letterSpacing: "0.05em",
          }}>
            {activeTheme.year}年データ
          </span>
        )}
        {activeTheme.help && !isMobile && (
          <span style={{
            fontFamily: SERIF,
            fontSize: 10,
            fontStyle: "italic",
            color: "#999",
            lineHeight: 1.3,
            display: "block",
            width: "100%",
            marginTop: 1,
          }}>
            {activeTheme.help}
          </span>
        )}
      </div>
    </div>
  );
}
