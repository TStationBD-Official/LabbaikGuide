import { describe, expect, it, vi, beforeAll } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import en from "@/i18n/locales/en.json";
import { DEFAULT_PREFERENCES } from "@/lib/preferences";
import { PreferencesProvider } from "@/components/providers/preferences-provider";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { Select } from "@/components/ui/select";

beforeAll(() => {
  window.matchMedia ??= ((q: string) => ({ matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {} })) as never;
  Element.prototype.scrollIntoView ??= () => {};
});

function Harness({ onChange, many = false }: { onChange: (v: string) => void; many?: boolean }) {
  const opts = many
    ? Array.from({ length: 20 }, (_, i) => ({ value: `o${i}`, label: `Option ${i}`, description: i === 7 ? "Lucky" : undefined }))
    : [
        { value: "a", label: "Apple" },
        { value: "b", label: "Banana", disabled: true },
        { value: "c", label: "Cherry" },
      ];
  const [v, setV] = useState(opts[0].value);
  return (
    <Select
      label="Fruit"
      value={v}
      onChange={(x) => {
        setV(x);
        onChange(x);
      }}
      options={opts}
    />
  );
}

const wrap = (ui: React.ReactNode) =>
  render(
    <PreferencesProvider initial={{ ...DEFAULT_PREFERENCES, locale: "en" }}>
      <I18nProvider initialLocale="en" initialMessages={en}>
        {ui}
      </I18nProvider>
    </PreferencesProvider>,
  );

describe("<Select>", () => {
  it("opens from the keyboard, skips disabled options and selects with Enter", async () => {
    const onChange = vi.fn();
    wrap(<Harness onChange={onChange} />);
    const trigger = screen.getByRole("combobox", { name: /Fruit/ });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    act(() => void fireEvent.keyDown(trigger, { key: "ArrowDown" }));
    const list = await screen.findByRole("listbox");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("option", { name: /Apple/ })).toHaveAttribute("aria-selected", "true");
    act(() => void fireEvent.keyDown(list, { key: "ArrowDown" })); // Banana is disabled → Cherry
    act(() => void fireEvent.keyDown(list, { key: "Enter" }));
    expect(onChange).toHaveBeenCalledWith("c");
    expect(trigger).toHaveTextContent("Cherry");
  });

  it("closes on Escape without changing the value", async () => {
    const onChange = vi.fn();
    wrap(<Harness onChange={onChange} />);
    const trigger = screen.getByRole("combobox", { name: /Fruit/ });
    act(() => void fireEvent.click(trigger));
    const list = await screen.findByRole("listbox");
    act(() => void fireEvent.keyDown(list, { key: "Escape" }));
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("filters long lists and picks the first match", async () => {
    const onChange = vi.fn();
    wrap(<Harness onChange={onChange} many />);
    act(() => void fireEvent.click(screen.getByRole("combobox", { name: /Fruit/ })));
    const search = await screen.findByRole("searchbox");
    act(() => void fireEvent.change(search, { target: { value: "lucky" } }));
    expect(screen.getAllByRole("option")).toHaveLength(1);
    act(() => void fireEvent.keyDown(search, { key: "Enter" }));
    expect(onChange).toHaveBeenCalledWith("o7");
  });
});
