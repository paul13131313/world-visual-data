import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SEVERITY, CONFLICTS } from "../data/conflicts";

const SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";
const MONO = "'JetBrains Mono', 'SF Mono', 'Fira Code', 'Courier New', monospace";

const SEVERITY_ORDER = ["war", "armed", "low"];

export default function ConflictPanel({ selectedConflict, onSelectConflict, isMobile }) {
  const sortedConflicts = [...CONFLICTS].sort((a, b) => {
    return SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity);
  });

  const selectedData = selectedConflict
    ? CONFLICTS.find(c => c.id === selectedConflict)
    : null;

  const getSeverityData = (key) => Object.values(SEVERITY).find(s => s.key === key);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "10px 12px 8px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        flexShrink: 0,
      }}>
        <div style={{
          fontFamily: SERIF,
          fontSize: 14,
          color: "#fff",
          fontWeight: 600,
          marginBottom: 2,
        }}>
          Active Conflicts
        </div>
        <div style={{
          fontFamily: MONO,
          fontSize: 9,
          color: "#666",
          letterSpacing: "0.08em",
        }}>
          {CONFLICTS.length} conflicts tracked · 2024–2025
        </div>
      </div>

      {/* Detail card — shown when a conflict is selected */}
      <AnimatePresence>
        {selectedData && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: "hidden", flexShrink: 0 }}
          >
            <div style={{
              padding: "10px 12px",
              background: "rgba(255,45,85,0.06)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 6,
              }}>
                <div style={{
                  fontFamily: SERIF,
                  fontSize: 13,
                  color: "#fff",
                  fontWeight: 600,
                }}>
                  {selectedData.name}
                </div>
                <button
                  onClick={() => onSelectConflict(null)}
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    color: "#666",
                    padding: "2px 6px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 3,
                    background: "rgba(255,255,255,0.05)",
                  }}
                >
                  ×
                </button>
              </div>
              <div style={{
                fontFamily: MONO,
                fontSize: 9,
                color: "#999",
                marginBottom: 6,
                lineHeight: 1.6,
              }}>
                {selectedData.summary}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px" }}>
                {[
                  { label: "タイプ", value: selectedData.type },
                  { label: "開始年", value: selectedData.startYear },
                  { label: "推定死者", value: selectedData.deaths },
                ].map(item => (
                  <div key={item.label}>
                    <span style={{
                      fontFamily: MONO, fontSize: 8, color: "#555",
                      letterSpacing: "0.05em",
                    }}>
                      {item.label}
                    </span>
                    <div style={{
                      fontFamily: MONO, fontSize: 11, color: "#ddd",
                      fontWeight: 600,
                    }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 6 }}>
                <span style={{
                  fontFamily: MONO, fontSize: 8, color: "#555",
                  letterSpacing: "0.05em",
                }}>
                  当事者
                </span>
                <div style={{
                  display: "flex", flexWrap: "wrap", gap: 4, marginTop: 2,
                }}>
                  {selectedData.parties.map(p => (
                    <span key={p} style={{
                      fontFamily: MONO,
                      fontSize: 9,
                      color: "#ccc",
                      background: "rgba(255,255,255,0.06)",
                      padding: "2px 6px",
                      borderRadius: 3,
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conflict list */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "4px 0",
      }}>
        {SEVERITY_ORDER.map(sevKey => {
          const sevData = getSeverityData(sevKey);
          const items = sortedConflicts.filter(c => c.severity === sevKey);
          if (items.length === 0) return null;

          return (
            <div key={sevKey}>
              {/* Severity group header */}
              <div style={{
                padding: "6px 12px 2px",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: 1,
                  background: sevData.color,
                  boxShadow: `0 0 4px ${sevData.color}60`,
                }} />
                <span style={{
                  fontFamily: MONO,
                  fontSize: 9,
                  color: sevData.color,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}>
                  {sevData.label}
                </span>
                <span style={{
                  fontFamily: MONO,
                  fontSize: 8,
                  color: "#555",
                }}>
                  ({items.length})
                </span>
              </div>

              {/* Conflict items */}
              {items.map(conflict => {
                const isSelected = selectedConflict === conflict.id;
                return (
                  <div
                    key={conflict.id}
                    onClick={() => onSelectConflict(isSelected ? null : conflict.id)}
                    style={{
                      padding: "6px 12px 6px 24px",
                      cursor: "pointer",
                      background: isSelected
                        ? `${sevData.color}12`
                        : "transparent",
                      borderLeft: isSelected
                        ? `2px solid ${sevData.color}`
                        : "2px solid transparent",
                      transition: "background 0.2s, border-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <div style={{
                      fontFamily: SERIF,
                      fontSize: 11,
                      color: isSelected ? "#fff" : "#ccc",
                      fontWeight: isSelected ? 600 : 400,
                      marginBottom: 1,
                    }}>
                      {conflict.name}
                    </div>
                    <div style={{
                      fontFamily: MONO,
                      fontSize: 9,
                      color: "#666",
                      display: "flex",
                      gap: 8,
                    }}>
                      <span>{conflict.type}</span>
                      <span>{conflict.startYear}–</span>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Source */}
      <div style={{
        padding: "6px 12px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        flexShrink: 0,
      }}>
        <div style={{
          fontFamily: MONO,
          fontSize: 7,
          color: "#555",
          letterSpacing: "0.05em",
          lineHeight: 1.5,
        }}>
          Source: ACLED Conflict Index 2025,
          <br />Wikipedia List of ongoing armed conflicts
        </div>
      </div>
    </div>
  );
}
