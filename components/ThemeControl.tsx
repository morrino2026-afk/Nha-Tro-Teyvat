'use client';

import { useEffect, useRef, useState } from 'react';
import { IconSpark } from './Icons';

const PRESETS = [
  { hue: 268, label: 'Tím khói' },
  { hue: 300, label: 'Hồng oải hương' },
  { hue: 232, label: 'Xanh đêm' },
  { hue: 330, label: 'Hồng đào' },
];

export function ThemeControl() {
  const [open, setOpen] = useState(false);
  const [hue, setHue] = useState(268);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const stored = Number(window.localStorage.getItem('vongnguyet.hue'));
    if (stored >= 210 && stored <= 350) {
      setHue(stored);
      document.documentElement.style.setProperty('--hue', String(stored));
    }
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function apply(value: number) {
    setHue(value);
    document.documentElement.style.setProperty('--hue', String(value));
    window.localStorage.setItem('vongnguyet.hue', String(value));
  }

  return (
    <div className="theme-control" ref={wrapRef}>
      <button
        type="button"
        className="icon-btn"
        aria-label="Chỉnh sắc độ giao diện"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <IconSpark width={18} height={18} />
      </button>
      {open && (
        <div className="hue-panel">
          <div className="hue-panel__head">
            <span>Sắc độ giao diện</span>
            <span className="hue-panel__value">{hue}°</span>
          </div>
          <input
            className="hue-range"
            type="range"
            min={210}
            max={350}
            value={hue}
            onChange={(event) => apply(Number(event.target.value))}
            aria-label="Chọn sắc độ"
          />
          <div className="hue-presets">
            {PRESETS.map((preset) => (
              <button
                key={preset.hue}
                type="button"
                className={`hue-preset ${Math.abs(preset.hue - hue) < 3 ? 'is-active' : ''}`}
                onClick={() => apply(preset.hue)}
              >
                <span
                  className="hue-preset__dot"
                  style={{ background: `hsl(${preset.hue} 90% 76%)` }}
                />
                {preset.label}
              </button>
            ))}
          </div>
          <p className="hue-panel__hint">Tông tối giữ nguyên, chỉ đổi ánh tím – hồng.</p>
        </div>
      )}
    </div>
  );
}
