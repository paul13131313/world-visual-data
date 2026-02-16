import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PHOTOS, getPhotoUrl, getThumbUrl } from "../data/photos";
import { COUNTRIES } from "../data/countries";

const SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";
const MONO = "'JetBrains Mono', 'SF Mono', 'Fira Code', 'Courier New', monospace";

// Extra country names for countries not in COUNTRIES data
const EXTRA_NAMES = {
  TW: "台湾", KH: "カンボジア", NP: "ネパール", KZ: "カザフスタン",
  UZ: "ウズベキスタン", IS: "アイスランド", AT: "オーストリア",
  TZ: "タンザニア", GT: "グアテマラ", EE: "エストニア",
  HK: "香港", MO: "マカオ",
};

function getCountryName(code) {
  if (COUNTRIES[code]) return COUNTRIES[code].nameJa;
  return EXTRA_NAMES[code] || code;
}

export default function PhotoPanel({ selectedCountry, themeColor }) {
  const [fullscreenIdx, setFullscreenIdx] = useState(null);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [visibleCount, setVisibleCount] = useState(5); // Load countries progressively
  const scrollRef = useRef(null);
  const countryRefs = useRef({});

  // Build grouped data: sorted by photo count descending
  const grouped = useMemo(() => {
    const groups = [];
    for (const [code, photos] of Object.entries(PHOTOS)) {
      if (photos.length > 0) {
        groups.push({ code, photos });
      }
    }
    groups.sort((a, b) => b.photos.length - a.photos.length);
    return groups;
  }, []);

  // Build flat list for fullscreen navigation
  const flatPhotos = useMemo(() => {
    const list = [];
    for (const { code, photos } of grouped) {
      for (const p of photos) {
        list.push({ code, file: p.file, caption: p.caption });
      }
    }
    return list;
  }, [grouped]);

  const totalPhotos = flatPhotos.length;
  const totalCountries = grouped.length;

  // Scroll to selected country (expand visible count if needed)
  useEffect(() => {
    if (selectedCountry) {
      const idx = grouped.findIndex(g => g.code === selectedCountry);
      if (idx >= 0 && idx >= visibleCount) {
        setVisibleCount(idx + 3);
      }
      // Wait a tick for DOM to update, then scroll
      setTimeout(() => {
        if (countryRefs.current[selectedCountry] && scrollRef.current) {
          const el = countryRefs.current[selectedCountry];
          const container = scrollRef.current;
          const top = el.offsetTop - container.offsetTop - 8;
          container.scrollTo({ top, behavior: "smooth" });
        }
      }, 100);
    }
  }, [selectedCountry, grouped, visibleCount]);

  // Infinite scroll: load more countries when scrolling near bottom
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollHeight - scrollTop - clientHeight < 200) {
      setVisibleCount(prev => Math.min(prev + 5, grouped.length));
    }
  }, [grouped.length]);

  // Keyboard navigation for fullscreen
  useEffect(() => {
    if (fullscreenIdx === null) return;
    const handleKey = (e) => {
      if (e.key === "Escape") setFullscreenIdx(null);
      if (e.key === "ArrowRight") setFullscreenIdx(i => Math.min(i + 1, flatPhotos.length - 1));
      if (e.key === "ArrowLeft") setFullscreenIdx(i => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [fullscreenIdx, flatPhotos.length]);

  const handleImageLoad = useCallback((key) => {
    setLoadedImages(prev => new Set(prev).add(key));
  }, []);

  // Get global start index for a country group
  const getGlobalStart = useCallback((targetCode) => {
    let idx = 0;
    for (const { code, photos } of grouped) {
      if (code === targetCode) return idx;
      idx += photos.length;
    }
    return idx;
  }, [grouped]);

  const fsPhoto = fullscreenIdx !== null ? flatPhotos[fullscreenIdx] : null;

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Header */}
        <div style={{
          fontFamily: SERIF,
          fontSize: 13,
          fontStyle: "italic",
          fontWeight: 400,
          color: "#666",
          marginBottom: 8,
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 8,
        }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span>Photos —</span>
            <span style={{
              fontFamily: MONO, fontSize: 9, color: themeColor,
              opacity: 0.7, letterSpacing: "0.05em",
            }}>
              {totalCountries} countries
            </span>
            <span style={{
              fontFamily: MONO, fontSize: 9, color: "#999",
              letterSpacing: "0.05em",
            }}>
              {totalPhotos} photos
            </span>
          </div>
          {visibleCount < grouped.length && (
            <button
              onClick={() => setVisibleCount(grouped.length)}
              style={{
                background: "none", border: "none", padding: 0,
                fontFamily: MONO, fontSize: 9, color: themeColor,
                cursor: "pointer", opacity: 0.6, letterSpacing: "0.05em",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={e => { e.target.style.opacity = "1"; }}
              onMouseLeave={e => { e.target.style.opacity = "0.6"; }}
            >
              Show All
            </button>
          )}
        </div>

        {/* Scrollable photo grid */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            scrollbarWidth: "thin",
            scrollbarColor: `${themeColor}30 transparent`,
          }}
        >
          {grouped.slice(0, visibleCount).map(({ code, photos }) => {
            const globalStart = getGlobalStart(code);
            const isSelected = selectedCountry === code;

            return (
              <div
                key={code}
                ref={el => { countryRefs.current[code] = el; }}
                style={{ marginBottom: 16 }}
              >
                {/* Country label */}
                <div style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 6,
                  marginBottom: 6,
                  paddingBottom: 4,
                  borderBottom: isSelected
                    ? `1px solid ${themeColor}40`
                    : "1px solid rgba(0,0,0,0.06)",
                  transition: "border-color 0.3s",
                }}>
                  <span style={{
                    fontFamily: SERIF,
                    fontSize: 12,
                    fontStyle: "italic",
                    fontWeight: 600,
                    color: isSelected ? "#222" : "#888",
                    transition: "color 0.3s",
                  }}>
                    {getCountryName(code)}
                  </span>
                  <span style={{
                    fontFamily: MONO, fontSize: 8,
                    color: isSelected ? themeColor : "#bbb",
                    transition: "color 0.3s",
                  }}>
                    {code}
                  </span>
                  <span style={{
                    fontFamily: MONO, fontSize: 8, color: "#ccc",
                  }}>
                    {photos.length}
                  </span>
                </div>

                {/* Photo grid */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
                  gap: 4,
                }}>
                  {photos.map((photo, i) => {
                    const imgKey = `panel-${code}-${i}`;
                    return (
                      <div
                        key={i}
                        onClick={() => setFullscreenIdx(globalStart + i)}
                        style={{
                          cursor: "pointer",
                          position: "relative",
                          borderRadius: 3,
                          overflow: "hidden",
                          background: "#e8e9ec",
                          aspectRatio: "4/3",
                          transition: "transform 0.2s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.03)"; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                      >
                        {!loadedImages.has(imgKey) && (
                          <div style={{
                            position: "absolute", inset: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#ccc", fontFamily: MONO, fontSize: 8,
                          }}>
                            ...
                          </div>
                        )}
                        <img
                          src={getThumbUrl(code, photo.file)}
                          alt={photo.caption || `${getCountryName(code)} ${i + 1}`}
                          loading="lazy"
                          onLoad={() => handleImageLoad(imgKey)}
                          style={{
                            width: "100%", height: "100%",
                            objectFit: "cover", display: "block",
                            opacity: loadedImages.has(imgKey) ? 1 : 0,
                            transition: "opacity 0.3s",
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {visibleCount < grouped.length && (
            <div
              onClick={() => setVisibleCount(prev => Math.min(prev + 5, grouped.length))}
              style={{
                textAlign: "center", padding: "12px 0", cursor: "pointer",
                fontFamily: MONO, fontSize: 9, color: themeColor,
                opacity: 0.6, letterSpacing: "0.05em",
              }}
            >
              + {grouped.length - visibleCount} more countries
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen image overlay */}
      <AnimatePresence>
        {fullscreenIdx !== null && fsPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setFullscreenIdx(null)}
            style={{
              position: "fixed", inset: 0, zIndex: 300,
              background: "rgba(0,0,0,0.95)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "zoom-out",
            }}
          >
            <img
              src={getPhotoUrl(fsPhoto.code, fsPhoto.file)}
              alt=""
              style={{
                maxWidth: "95vw", maxHeight: "92vh",
                objectFit: "contain", borderRadius: 4,
              }}
            />
            {/* Country label */}
            <div style={{
              position: "absolute", top: 16, left: 20,
              fontFamily: SERIF, fontSize: 14, fontStyle: "italic", color: "#888",
            }}>
              {getCountryName(fsPhoto.code)}
            </div>
            {/* Navigation arrows */}
            {fullscreenIdx > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setFullscreenIdx(i => i - 1); }}
                style={{
                  position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
                  background: "rgba(255,255,255,0.1)", border: "none", color: "#fff",
                  fontSize: 28, cursor: "pointer", width: 44, height: 44, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                ‹
              </button>
            )}
            {fullscreenIdx < flatPhotos.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setFullscreenIdx(i => i + 1); }}
                style={{
                  position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
                  background: "rgba(255,255,255,0.1)", border: "none", color: "#fff",
                  fontSize: 28, cursor: "pointer", width: 44, height: 44, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                ›
              </button>
            )}
            {/* Counter */}
            <div style={{
              position: "absolute", top: 16, right: 20,
              fontFamily: MONO, fontSize: 12, color: "#666",
            }}>
              {fullscreenIdx + 1} / {flatPhotos.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
