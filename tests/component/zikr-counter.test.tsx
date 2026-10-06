import { describe, expect, it, beforeEach, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import en from "@/i18n/locales/en.json";
import { DEFAULT_PREFERENCES } from "@/lib/preferences";
import { PreferencesProvider } from "@/components/providers/preferences-provider";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { ToastProvider } from "@/components/ui/toast";
import { ZikrCounter } from "@/components/zikr/zikr-counter";
import { DEFAULT_ZIKR } from "@/data/zikr/defaults";
import { useZikrStore } from "@/stores/zikr-store";

function renderCounter(next: (typeof DEFAULT_ZIKR)[number] | null = null) {
  return render(
    <PreferencesProvider initial={{ ...DEFAULT_PREFERENCES, locale: "en" }}>
      <I18nProvider initialLocale="en" initialMessages={en}>
        <ToastProvider>
          <ZikrCounter zikr={DEFAULT_ZIKR[0]} next={next} />
        </ToastProvider>
      </I18nProvider>
    </PreferencesProvider>,
  );
}

const count = () => useZikrStore.getState().counts[DEFAULT_ZIKR[0].id] ?? 0;
let clock = 1000;

describe("<ZikrCounter>", () => {
  beforeEach(() => {
    useZikrStore.setState({ counts: {}, history: {}, undo: [], autoAdvance: true, haptics: true, activeId: DEFAULT_ZIKR[0].id });
    clock = 1000;
    // Control the double-tap guard deterministically.
    performance.now = () => clock;
  });

  it("counts taps, ignores near-simultaneous duplicates, and undoes", () => {
    renderCounter();
    const tap = screen.getByRole("button", { name: /Count one —/ });
    act(() => void fireEvent.pointerDown(tap, { button: 0 }));
    clock += 30; // duplicate event within the guard window
    act(() => void fireEvent.pointerDown(tap, { button: 0 }));
    clock += 200;
    act(() => void fireEvent.pointerDown(tap, { button: 0 }));
    expect(count()).toBe(2);

    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(count()).toBe(1);
  });

  it("supports keyboard counting on the counter button", () => {
    renderCounter();
    const tap = screen.getByRole("button", { name: /Count one —/ });
    fireEvent.keyDown(tap, { key: "Enter" });
    clock += 200;
    fireEvent.keyDown(tap, { key: " " });
    expect(count()).toBe(2);
  });

  it("shows Arabic text with RTL direction and the target", () => {
    renderCounter();
    expect(screen.getByText("سُبْحَانَ اللَّهِ")).toHaveAttribute("dir", "rtl");
    expect(screen.getByText("/ 33")).toBeInTheDocument();
  });

  it("vibrates and moves to the next zikr when the target is reached, ignoring extra taps", () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const vib = vi.fn();
    Object.defineProperty(navigator, "vibrate", { value: vib, configurable: true });
    useZikrStore.setState({ counts: { [DEFAULT_ZIKR[0].id]: 32 } });
    renderCounter(DEFAULT_ZIKR[1]);
    const tap = screen.getByRole("button", { name: /Count one —/ });
    act(() => void fireEvent.pointerDown(tap, { button: 0 }));
    expect(count()).toBe(33);
    expect(vib).toHaveBeenLastCalledWith([300, 120, 300]);
    clock += 300;
    act(() => void fireEvent.pointerDown(tap, { button: 0 })); // during the hand-over: ignored
    expect(count()).toBe(33);
    act(() => void vi.advanceTimersByTime(1500));
    expect(useZikrStore.getState().activeId).toBe(DEFAULT_ZIKR[1].id);
    vi.useRealTimers();
  });

  it("stays on the zikr when 'Stay here' is pressed", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    useZikrStore.setState({ counts: { [DEFAULT_ZIKR[0].id]: 32 } });
    renderCounter(DEFAULT_ZIKR[1]);
    act(() => void fireEvent.pointerDown(screen.getByRole("button", { name: /Count one —/ }), { button: 0 }));
    await act(async () => {}); // flush the microtask that shows the hand-over bar
    fireEvent.click(screen.getByRole("button", { name: "Stay here" }));
    act(() => void vi.advanceTimersByTime(2000));
    expect(useZikrStore.getState().activeId).toBe(DEFAULT_ZIKR[0].id);
    vi.useRealTimers();
  });
});
