"use client";
import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { countries, resolveCountry } from "@/lib/countries";
export function CountrySelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const selected = resolveCountry(value);
  useEffect(() => {
    if (!open) return;
    function close(e: PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  return (
    <div
      className="country-picker"
      ref={ref}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(e) => {
        if (open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
          const buttons = Array.from(
            ref.current?.querySelectorAll<HTMLButtonElement>(
              ".country-options button",
            ) ?? [],
          );
          if (buttons.length) {
            e.preventDefault();
            const i = buttons.findIndex(
              (button) => button === document.activeElement,
            );
            buttons[
              ((i < 0 && e.key === "ArrowUp" ? 0 : i) +
                (e.key === "ArrowDown" ? 1 : -1) +
                buttons.length) %
                buttons.length
            ]?.focus();
          }
        }

        if (e.key === "Escape") {
          setOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      <button
        ref={trigger}
        className="country-trigger"
        aria-expanded={open}
        aria-controls="country-options"
        onClick={() => {
          setOpen(!open);
          setQuery("");
        }}
        aria-label={`Select country, ${selected.name}`}
      >
        <span>{selected.flag}</span>
        <span>{selected.name}</span>
        <span className="iso">{selected.code}</span>
        <ChevronDown size={16} />
      </button>
      {open && (
        <div className="country-menu" id="country-options">
          <label className="search">
            <Search size={16} />
            <input
              autoFocus
              placeholder="Search name or ISO code"
              aria-label="Search countries"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <div className="country-options">
            {countries
              .filter((c) =>
                `${c.name} ${c.code} ${c.iso3}`
                  .toLowerCase()
                  .includes(query.toLowerCase()),
              )
              .map((c) => (
                <button
                  key={c.code}
                  aria-pressed={value === c.code}
                  onClick={() => {
                    onChange(c.code);
                    setOpen(false);
                    trigger.current?.focus();
                  }}
                >
                  <span>
                    {c.flag} {c.name}
                  </span>
                  <small>
                    {c.code} / {c.iso3}
                  </small>
                  {value === c.code && <Check size={15} />}
                </button>
              ))}
            {!countries.some((c) =>
              `${c.name} ${c.code} ${c.iso3}`
                .toLowerCase()
                .includes(query.toLowerCase()),
            ) && <p>No countries found.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
