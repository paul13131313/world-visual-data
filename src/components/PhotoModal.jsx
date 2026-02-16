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

// Build flat list of all photos with country info
function getAllPhotos() {
  const all = [];
  for (const [code, photos] of Object.entries(PHOTOS)) {
    for (const photo of photos) {
      all.push({ code, file: photo.file, caption: photo.caption });
    }
  }
  return all;
}

export default function PhotoModal({ code, onClose, themeColor }) {
  const isAll = code === "ALL";
  const isSingleCountry = code && !isAll;

  const photos = useMemo(() => {
    if (isAll) return getAllPhotos();
    if (isSingleCountry && PHOTOS[code]) return PHOTOS[code].map(p => ({ ...p, code }));
    return null;
  }, [code, isAll, isSingleCountry]);

  const [fullscreenIdx, setFullscreenIdx] = useState(null);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const scrollRef = useRef(null);

  // Reset when code changes
  useEffect(() => {
    setFullscreenIdx(null);
    setLoadedImages(new Set());
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [code]);

  // Keyboard navigation
  useEffect(() => {
    if (!photos || !code) return;
    const handleKey = (e) => {
      if (e.key === "Escape") {
        if (fullscreenIdx !== null) {
          setFullscreenIdx(null);
        } else {
          onClose();
        }
      }
      if (fullscreenIdx !== null) {
        if (e.key === "ArrowRight") setFullscreenIdx(i => Math.min(i + 1, photos.length - 1));
        if (e.key === "ArrowLeft") setFullscreenIdx(i => Math.max(i - 1, 0));
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [code, photos, fullscreenIdx, onClose]);

  const handleImageLoad = useCallback((key) => {
    setLoadedImages(prev => new Set(prev).add(key));
  }, []);

  // Group photos by country for "ALL" mode
  const grouped = useMemo(() => {
    if (!isAll) return null;
    const groups = {};
    for (const [c, ps] of Object.entries(PHOTOS)) {
      if (ps.length > 0) groups[c] = ps;
    }
    // Sort by photo count descending
    return Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
  }, [isAll]);

  // Compute global index for fullscreen navigation in ALL mode
  const globalIndex = useMemo(() => {
    if (!isAll || !grouped) return null;
    const list = [];
    for (const [c, ps] of grouped) {
      for (const p of ps) {
        list.push({ code: c, file: p.file, caption: p.caption });
      }
    }
    return list;
  }, [isAll, grouped]);

  if (!code || !photos || photos.length === 0) return null;

  const fsPhotos = isAll ? globalIndex : photos;
  const fsCode = fullscreenIdx !== null ? fsPhotos[fullscreenIdx]?.code || code : null;
  const fsFile = fullscreenIdx !== null ? fsPhotos[fullscreenIdx]?.file : null;

  return (
    <>
      {/* Main modal - full screen overlay for ALL, bottom panel for single country */}
      <AnimatePresence>
        {code && (
          <motion.div
            initial={isAll ? { opacity: 0 } : { y: "100%" }}
            animate={isAll ? { opacity: 1 } : { y: 0 }}
            exit={isAll ? { opacity: 0 } : { y: "100%" }}
            transition={isAll ? { duration: 0.3 } : { type: "spring", damping: 28, stiffness: 300 }}
            style={{
              position: "fixed",
              inset: isAll ? 0 : undefined,
              bottom: isAll ? undefined : 0,
              left: isAll ? undefined : 0,
              right: isAll ? undefined : 0,
              zIndex: 200,
              background: isAll ? "rgba(8, 10, 16, 0.98)" : "rgba(12, 14, 20, 0.97)",
              backdropFilter: "blur(20px)",
              borderTop: isAll ? "none" : `1px solid ${themeColor}30`,
              maxHeight: isAll ? "100vh" : "70vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: isAll ? "16px 24px 12px" : "14px 20px 10px",
              flexShrink: 0,
              borderBottom: isAll ? "1px solid #1a1c24" : "none",
            }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                {isAll ? (
                  <>
                    <span style={{
                      fontFamily: SERIF, fontSize: 20, fontStyle: "italic",
                      color: "#fff", fontWeight: 600,
                    }}>
                      All Photos
                    </span>
                    <span style={{
                      fontFamily: MONO, fontSize: 11, color: themeColor, opacity: 0.7,
                    }}>
                      {Object.keys(PHOTOS).filter(c => PHOTOS[c]?.length > 0).length} countries
                    </span>
                    <span style={{
                      fontFamily: MONO, fontSize: 11, color: "#555",
                    }}>
                      {photos.length} photos
                    </span>
                  </>
                ) : (
                  <>
                    <span style={{
                      fontFamily: SERIF, fontSize: 18, fontStyle: "italic",
                      color: "#fff", fontWeight: 600,
                    }}>
                      {getCountryName(code)}
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: 10, color: themeColor, opacity: 0.7 }}>
                      {code}
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: 10, color: "#555" }}>
                      {photos.length} photos
                    </span>
                  </>
                )}
              </div>
              <button
                onClick={onClose}
                style={{
                  background: "none", border: "1px solid #333", borderRadius: 4,
                  color: "#888", cursor: "pointer", fontFamily: MONO, fontSize: 11,
                  padding: "4px 12px", transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.target.style.color = "#fff"; e.target.style.borderColor = "#666"; }}
                onMouseLeave={e => { e.target.style.color = "#888"; e.target.style.borderColor = "#333"; }}
              >
                ESC
              </button>
            </div>

            {/* Content */}
            {isAll ? (
              /* ALL mode: grid grouped by country, vertical scroll */
              <div
                ref={scrollRef}
                style={{
                  flex: 1,
                  overflowY: "auto",
                  overflowX: "hidden",
                  padding: "0 24px 24px",
                  scrollbarWidth: "thin",
                  scrollbarColor: "#333 transparent",
                }}
              >
                {grouped.map(([countryCode, countryPhotos]) => {
                  // Calculate global start index for this country
                  let globalStart = 0;
                  for (const [c] of grouped) {
                    if (c === countryCode) break;
                    globalStart += PHOTOS[c].length;
                  }

                  return (
                    <div key={countryCode} style={{ marginBottom: 28 }}>
                      {/* Country header */}
                      <div style={{
                        display: "flex", alignItems: "baseline", gap: 8,
                        marginBottom: 10, paddingBottom: 6,
                        borderBottom: "1px solid #1a1c24",
                      }}>
                        <span style={{
                          fontFamily: SERIF, fontSize: 15, fontStyle: "italic",
                          color: "#fff", fontWeight: 600,
                        }}>
                          {getCountryName(countryCode)}
                        </span>
                        <span style={{ fontFamily: MONO, fontSize: 9, color: themeColor, opacity: 0.6 }}>
                          {countryCode}
                        </span>
                        <span style={{ fontFamily: MONO, fontSize: 9, color: "#444" }}>
                          {countryPhotos.length}
                        </span>
                      </div>
                      {/* Photo grid */}
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                        gap: 8,
                      }}>
                        {countryPhotos.map((photo, i) => {
                          const imgKey = `${countryCode}-${i}`;
                          return (
                            <div
                              key={i}
                              onClick={() => setFullscreenIdx(globalStart + i)}
                              style={{
                                cursor: "pointer", position: "relative",
                                borderRadius: 4, overflow: "hidden",
                                background: "#1a1c24", aspectRatio: "4/3",
                              }}
                            >
                              {!loadedImages.has(imgKey) && (
                                <div style={{
                                  position: "absolute", inset: 0,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  color: "#222", fontFamily: MONO, fontSize: 10,
                                }}>
                                  ...
                                </div>
                              )}
                              <img
                                src={getThumbUrl(countryCode, photo.file)}
                                alt={photo.caption || `${getCountryName(countryCode)} ${i + 1}`}
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
              </div>
            ) : (
              /* Single country mode: horizontal scroll strip */
              <div
                ref={scrollRef}
                style={{
                  display: "flex", gap: 10,
                  overflowX: "auto", overflowY: "hidden",
                  padding: "0 20px 16px", flex: 1,
                  scrollSnapType: "x mandatory",
                  WebkitOverflowScrolling: "touch",
                  scrollbarWidth: "none",
                }}
              >
                {photos.map((photo, i) => {
                  const imgKey = `${code}-${i}`;
                  return (
                    <div
                      key={i}
                      onClick={() => setFullscreenIdx(i)}
                      style={{
                        flexShrink: 0, width: "min(340px, 75vw)",
                        scrollSnapAlign: "center", cursor: "pointer",
                        position: "relative", borderRadius: 6,
                        overflow: "hidden", background: "#1a1c24",
                      }}
                    >
                      {!loadedImages.has(imgKey) && (
                        <div style={{
                          position: "absolute", inset: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#333", fontFamily: MONO, fontSize: 11,
                        }}>
                          loading...
                        </div>
                      )}
                      <img
                        src={getThumbUrl(code, photo.file)}
                        alt={photo.caption || `${getCountryName(code)} photo ${i + 1}`}
                        loading="lazy"
                        onLoad={() => handleImageLoad(imgKey)}
                        style={{
                          width: "100%", height: "auto", maxHeight: "50vh",
                          objectFit: "cover", display: "block",
                          opacity: loadedImages.has(imgKey) ? 1 : 0,
                          transition: "opacity 0.3s",
                        }}
                      />
                      {photo.caption && (
                        <div style={{
                          position: "absolute", bottom: 0, left: 0, right: 0,
                          padding: "24px 12px 10px",
                          background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                          fontFamily: SERIF, fontSize: 12, fontStyle: "italic", color: "#ddd",
                        }}>
                          {photo.caption}
                        </div>
                      )}
                      <div style={{
                        position: "absolute", top: 8, right: 8,
                        fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.5)",
                        background: "rgba(0,0,0,0.4)", padding: "2px 6px", borderRadius: 3,
                      }}>
                        {i + 1}/{photos.length}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen image overlay */}
      <AnimatePresence>
        {fullscreenIdx !== null && fsFile && (
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
              src={getPhotoUrl(fsCode, fsFile)}
              alt=""
              style={{
                maxWidth: "95vw", maxHeight: "92vh",
                objectFit: "contain", borderRadius: 4,
              }}
            />
            {/* Country label in fullscreen */}
            <div style={{
              position: "absolute", top: 16, left: 20,
              fontFamily: SERIF, fontSize: 14, fontStyle: "italic", color: "#888",
            }}>
              {getCountryName(fsCode)}
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
            {fullscreenIdx < fsPhotos.length - 1 && (
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
              {fullscreenIdx + 1} / {fsPhotos.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
