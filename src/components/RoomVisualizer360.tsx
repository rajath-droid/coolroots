import {
  FlipHorizontal2,
  Move,
  Plus,
  RotateCcw,
  RotateCw,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import { PointerEvent as ReactPointerEvent, useRef, useState } from 'react';
import { CoolingRecommendationItem, Product, RoomOverlayItem, UploadedRoomImage } from '../types';
import { SafeImage } from './SafeImage';

interface RoomVisualizer360Props {
  roomImages: UploadedRoomImage[];
  recommendations: CoolingRecommendationItem[];
  allProducts: Product[];
  overlays: RoomOverlayItem[];
  onChangeOverlays: (next: RoomOverlayItem[]) => void;
}

export function RoomVisualizer360({
  roomImages,
  recommendations,
  allProducts,
  overlays,
  onChangeOverlays,
}: RoomVisualizer360Props) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [panPercent, setPanPercent] = useState(50);
  const [selectedId, setSelectedId] = useState<string | null>(
    overlays[0]?.instanceId || null
  );
  const [panModeOverride, setPanModeOverride] = useState<boolean | null>(null);

  const stageInnerRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<{
    mode: 'move' | 'resize' | 'pan';
    instanceId?: string;
    startX: number;
    startY: number;
    origXPercent: number;
    origYPercent: number;
    origWidthPx: number;
    origPanPercent: number;
  } | null>(null);

  const activeImage = roomImages[activeImageIdx] || roomImages[0];
  const isPanoramicView =
    panModeOverride !== null ? panModeOverride : Boolean(activeImage?.isPanoramic);

  const selectedOverlay = overlays.find((o) => o.instanceId === selectedId) || null;

  // Build quick-add palette from recommended items first, then remaining catalog
  const paletteProducts = (() => {
    const seen = new Set<string>();
    const list: Array<{
      productId: string;
      variantId: string;
      name: string;
      image: string;
      recommended?: boolean;
    }> = [];

    for (const rec of recommendations) {
      if (!seen.has(rec.productId)) {
        seen.add(rec.productId);
        list.push({
          productId: rec.productId,
          variantId: rec.variantId,
          name: rec.productName,
          image: rec.image,
          recommended: true,
        });
      }
    }
    for (const p of allProducts) {
      if (!seen.has(p.id) && p.variants.length > 0) {
        seen.add(p.id);
        list.push({
          productId: p.id,
          variantId: p.variants[0].id,
          name: p.name,
          image: p.image,
        });
      }
    }
    return list;
  })();

  const handleAddOverlay = (item: {
    productId: string;
    variantId: string;
    name: string;
    image: string;
  }) => {
    const offset = (overlays.length % 4) * 5;
    const baseX = isPanoramicView ? Math.min(82, Math.max(18, panPercent + (offset - 7))) : 42 + offset;
    const newItem: RoomOverlayItem = {
      instanceId: `ov_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      productId: item.productId,
      variantId: item.variantId,
      name: item.name,
      image: item.image,
      xPercent: baseX,
      yPercent: 48 + (offset % 12),
      widthPx: 145,
      rotationDeg: 0,
      flipX: false,
      opacity: 0.96,
    };
    onChangeOverlays([...overlays, newItem]);
    setSelectedId(newItem.instanceId);
  };

  const updateOverlay = (instanceId: string, patch: Partial<RoomOverlayItem>) => {
    onChangeOverlays(
      overlays.map((item) => (item.instanceId === instanceId ? { ...item, ...patch } : item))
    );
  };

  const removeOverlay = (instanceId: string) => {
    const remaining = overlays.filter((item) => item.instanceId !== instanceId);
    onChangeOverlays(remaining);
    if (selectedId === instanceId) {
      setSelectedId(remaining[0]?.instanceId || null);
    }
  };

  const bringToFront = (instanceId: string) => {
    const target = overlays.find((item) => item.instanceId === instanceId);
    if (!target) return;
    onChangeOverlays([...overlays.filter((item) => item.instanceId !== instanceId), target]);
    setSelectedId(instanceId);
  };

  const startMove = (e: ReactPointerEvent, item: RoomOverlayItem) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedId(item.instanceId);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragStateRef.current = {
      mode: 'move',
      instanceId: item.instanceId,
      startX: e.clientX,
      startY: e.clientY,
      origXPercent: item.xPercent,
      origYPercent: item.yPercent,
      origWidthPx: item.widthPx,
      origPanPercent: panPercent,
    };
  };

  const startResize = (e: ReactPointerEvent, item: RoomOverlayItem) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedId(item.instanceId);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragStateRef.current = {
      mode: 'resize',
      instanceId: item.instanceId,
      startX: e.clientX,
      startY: e.clientY,
      origXPercent: item.xPercent,
      origYPercent: item.yPercent,
      origWidthPx: item.widthPx,
      origPanPercent: panPercent,
    };
  };

  const startPanBackground = (e: ReactPointerEvent) => {
    if (!isPanoramicView) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragStateRef.current = {
      mode: 'pan',
      startX: e.clientX,
      startY: e.clientY,
      origXPercent: 0,
      origYPercent: 0,
      origWidthPx: 0,
      origPanPercent: panPercent,
    };
  };

  const handlePointerMove = (e: ReactPointerEvent) => {
    const drag = dragStateRef.current;
    if (!drag) return;

    const stage = stageInnerRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();

    if (drag.mode === 'pan') {
      const deltaX = e.clientX - drag.startX;
      const sensitivity = 0.25;
      const nextPan = Math.min(100, Math.max(0, drag.origPanPercent - deltaX * sensitivity));
      setPanPercent(nextPan);
      return;
    }

    if (!drag.instanceId) return;

    if (drag.mode === 'move') {
      const dxPct = ((e.clientX - drag.startX) / Math.max(1, rect.width)) * 100;
      const dyPct = ((e.clientY - drag.startY) / Math.max(1, rect.height)) * 100;
      updateOverlay(drag.instanceId, {
        xPercent: Math.min(94, Math.max(6, drag.origXPercent + dxPct)),
        yPercent: Math.min(92, Math.max(8, drag.origYPercent + dyPct)),
      });
    } else if (drag.mode === 'resize') {
      const dx = e.clientX - drag.startX;
      const nextWidth = Math.min(340, Math.max(64, Math.round(drag.origWidthPx + dx)));
      updateOverlay(drag.instanceId, { widthPx: nextWidth });
    }
  };

  const stopDrag = () => {
    dragStateRef.current = null;
  };

  if (!activeImage) {
    return (
      <div className="rounded-[20px] border border-white/85 bg-white/70 backdrop-blur-lg p-8 text-center text-sm text-[#2D4B3C]">
        Please upload at least one room photograph in Step 1 to launch the Room Visualizer.
      </div>
    );
  }

  // Panning offset shifts the wide panoramic canvas smoothly inside viewport
  const panTranslatePercent = isPanoramicView ? -((panPercent / 100) * 54) : 0;

  return (
    <div className="space-y-5">
      {/* Top Toolbar: Room Photo Switcher & 360 Pan Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] bg-white/70 backdrop-blur-lg border border-white/85 p-3.5 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {roomImages.length > 1 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-medium text-[#163024] mr-1">Room View:</span>
              {roomImages.map((img, idx) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveImageIdx(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    idx === activeImageIdx
                      ? 'bg-[#1E3D2F] text-white shadow-xs'
                      : 'bg-white/80 text-[#163024] border border-[#1E3D2F]/15 hover:bg-white'
                  }`}
                >
                  Photo {idx + 1}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setPanModeOverride(!isPanoramicView)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
              isPanoramicView
                ? 'bg-[#1E3D2F]/12 border-[#1E3D2F]/35 text-[#163024]'
                : 'bg-white/80 border-[#1E3D2F]/15 text-[#2D4B3C] hover:bg-white'
            }`}
          >
            {isPanoramicView ? '360° Pan View: On' : 'Enable 360° Pan View'}
          </button>
        </div>

        <p className="text-xs text-[#3C5849]">
          Click a product below to add, then drag, resize, or rotate inside your room.
        </p>
      </div>

      {/* Product Overlay Palette */}
      <div className="rounded-[18px] bg-white/65 backdrop-blur-lg border border-white/85 p-3.5">
        <p className="text-xs font-medium uppercase tracking-wider text-[#1E3D2F] mb-2.5">
          Add CoolRoots Products to Room Scene
        </p>
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
          {paletteProducts.map((item) => (
            <button
              key={item.productId}
              type="button"
              onClick={() => handleAddOverlay(item)}
              className="shrink-0 inline-flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-[14px] bg-white/85 border border-white hover:border-[#1E3D2F]/30 hover:bg-white shadow-xs transition-all cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-[10px] overflow-hidden bg-[#ECE8DC] shrink-0">
                <SafeImage
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-[#163024] whitespace-nowrap">{item.name}</p>
                <p className="text-[10px] text-[#3C5849]">
                  {item.recommended ? 'AI Recommended' : 'Catalog Item'}
                </p>
              </div>
              <Plus className="w-3.5 h-3.5 text-[#1E3D2F] group-hover:scale-110 transition-transform" />
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Room Canvas */}
      <div className="rounded-[22px] p-2 bg-white/65 backdrop-blur-xl border border-white/90 shadow-[0_16px_42px_-12px_rgba(22,48,36,0.18)]">
        <div
          onPointerMove={handlePointerMove}
          onPointerUp={stopDrag}
          onPointerCancel={stopDrag}
          onPointerLeave={stopDrag}
          className="relative w-full h-[360px] sm:h-[460px] lg:h-[520px] rounded-[16px] overflow-hidden bg-[#1D2B24] select-none"
        >
          <div
            ref={stageInnerRef}
            onPointerDown={startPanBackground}
            style={{
              width: isPanoramicView ? '220%' : '100%',
              transform: `translateX(${panTranslatePercent}%)`,
            }}
            className={`relative h-full transition-transform duration-75 ease-out ${
              isPanoramicView ? 'cursor-ew-resize' : ''
            }`}
          >
            <img
              src={activeImage.dataUrl}
              alt="Uploaded room scene"
              draggable={false}
              className="w-full h-full object-cover pointer-events-none select-none"
            />

            {/* Draggable, Resizable, Rotatable Product Overlays */}
            {overlays.map((item) => {
              const isSelected = item.instanceId === selectedId;
              return (
                <div
                  key={item.instanceId}
                  onPointerDown={(e) => startMove(e, item)}
                  style={{
                    left: `${item.xPercent}%`,
                    top: `${item.yPercent}%`,
                    width: `${item.widthPx}px`,
                    opacity: item.opacity,
                    transform: `translate(-50%, -50%) rotate(${item.rotationDeg}deg) scaleX(${
                      item.flipX ? -1 : 1
                    })`,
                  }}
                  className={`absolute touch-none cursor-grab active:cursor-grabbing group ${
                    isSelected ? 'z-30' : 'z-20'
                  }`}
                >
                  <div
                    className={`relative rounded-[14px] overflow-hidden transition-shadow ${
                      isSelected
                        ? 'ring-2 ring-white shadow-[0_14px_30px_rgba(0,0,0,0.45)]'
                        : 'ring-1 ring-white/50 shadow-[0_10px_24px_rgba(0,0,0,0.32)] hover:ring-white'
                    }`}
                  >
                    <SafeImage
                      src={item.image}
                      alt={item.name}
                      className="w-full h-auto aspect-[4/3] object-cover pointer-events-none select-none"
                    />
                    <div
                      style={{
                        transform: `scaleX(${item.flipX ? -1 : 1})`,
                      }}
                      className="bg-[#163024]/82 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-1 text-center truncate pointer-events-none"
                    >
                      {item.name}
                    </div>
                  </div>

                  {/* Corner Resize Handle */}
                  {isSelected && (
                    <button
                      type="button"
                      onPointerDown={(e) => startResize(e, item)}
                      aria-label={`Resize ${item.name}`}
                      title="Drag to resize"
                      className="absolute -bottom-2.5 -right-2.5 w-7 h-7 rounded-full bg-[#1E3D2F] text-white border-2 border-white shadow-md flex items-center justify-center cursor-nwse-resize touch-none"
                    >
                      <Move className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 360° Panoramic Look-Around Slider */}
        {isPanoramicView && (
          <div className="mt-3 px-2 flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-[#163024] whitespace-nowrap">
              360° Room Pan ({Math.round(panPercent * 3.6)}°)
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(panPercent)}
              onChange={(e) => setPanPercent(Number(e.target.value))}
              aria-label="Pan 360 degree room view"
              className="flex-1 accent-[#1E3D2F] cursor-pointer"
            />
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPanPercent(10)}
                className="px-2 py-1 rounded-lg bg-white/80 text-[11px] font-medium text-[#163024] border border-[#1E3D2F]/15 cursor-pointer"
              >
                Left
              </button>
              <button
                type="button"
                onClick={() => setPanPercent(50)}
                className="px-2 py-1 rounded-lg bg-white/80 text-[11px] font-medium text-[#163024] border border-[#1E3D2F]/15 cursor-pointer"
              >
                Center
              </button>
              <button
                type="button"
                onClick={() => setPanPercent(90)}
                className="px-2 py-1 rounded-lg bg-white/80 text-[11px] font-medium text-[#163024] border border-[#1E3D2F]/15 cursor-pointer"
              >
                Right
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selected Item Precision Controls */}
      {selectedOverlay ? (
        <div className="rounded-[20px] bg-white/75 backdrop-blur-lg border border-white/90 p-4 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#1E3D2F]" aria-hidden="true" />
              <span className="text-sm font-semibold text-[#163024]">
                Adjusting: {selectedOverlay.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => bringToFront(selectedOverlay.instanceId)}
                className="px-2.5 py-1.5 rounded-xl bg-white/80 border border-[#1E3D2F]/15 text-xs font-medium text-[#163024] hover:bg-white cursor-pointer"
              >
                Bring Front
              </button>
              <button
                type="button"
                onClick={() =>
                  updateOverlay(selectedOverlay.instanceId, {
                    flipX: !selectedOverlay.flipX,
                  })
                }
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/80 border border-[#1E3D2F]/15 text-xs font-medium text-[#163024] hover:bg-white cursor-pointer"
              >
                <FlipHorizontal2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Flip</span>
              </button>
              <button
                type="button"
                onClick={() => removeOverlay(selectedOverlay.instanceId)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#FAF3EE] border border-[#B84E32]/30 text-xs font-medium text-[#B84E32] hover:bg-[#F5E4DA] cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Remove</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="block space-y-1">
              <div className="flex justify-between text-xs text-[#2D4B3C]">
                <span>Size</span>
                <span className="tabular-nums font-medium">{selectedOverlay.widthPx}px</span>
              </div>
              <input
                type="range"
                min={64}
                max={340}
                value={selectedOverlay.widthPx}
                onChange={(e) =>
                  updateOverlay(selectedOverlay.instanceId, {
                    widthPx: Number(e.target.value),
                  })
                }
                className="w-full accent-[#1E3D2F] cursor-pointer"
              />
            </label>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-[#2D4B3C]">
                <span>Rotation</span>
                <span className="tabular-nums font-medium">{selectedOverlay.rotationDeg}°</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    updateOverlay(selectedOverlay.instanceId, {
                      rotationDeg: Math.max(-180, selectedOverlay.rotationDeg - 15),
                    })
                  }
                  aria-label="Rotate counter-clockwise"
                  className="p-1.5 rounded-lg bg-white/80 border border-[#1E3D2F]/15 text-[#163024] cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  value={selectedOverlay.rotationDeg}
                  onChange={(e) =>
                    updateOverlay(selectedOverlay.instanceId, {
                      rotationDeg: Number(e.target.value),
                    })
                  }
                  className="flex-1 accent-[#1E3D2F] cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() =>
                    updateOverlay(selectedOverlay.instanceId, {
                      rotationDeg: Math.min(180, selectedOverlay.rotationDeg + 15),
                    })
                  }
                  aria-label="Rotate clockwise"
                  className="p-1.5 rounded-lg bg-white/80 border border-[#1E3D2F]/15 text-[#163024] cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <label className="block space-y-1">
              <div className="flex justify-between text-xs text-[#2D4B3C]">
                <span>Blend Opacity</span>
                <span className="tabular-nums font-medium">
                  {Math.round(selectedOverlay.opacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={55}
                max={100}
                value={Math.round(selectedOverlay.opacity * 100)}
                onChange={(e) =>
                  updateOverlay(selectedOverlay.instanceId, {
                    opacity: Number(e.target.value) / 100,
                  })
                }
                className="w-full accent-[#1E3D2F] cursor-pointer"
              />
            </label>
          </div>
        </div>
      ) : (
        <div className="rounded-[18px] bg-white/60 border border-white/80 p-3.5 text-xs text-[#3C5849] text-center">
          Tap any placed product in the room to resize, rotate, flip, or reposition it.
        </div>
      )}

      <p className="text-[11px] text-[#3C5849] text-center">
        2D Interactive Room & 360° Pan Placement Preview using actual CoolRoots catalogue photography.
      </p>
    </div>
  );
}
