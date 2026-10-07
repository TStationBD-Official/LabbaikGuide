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

/** A real tap: finger down and up in the same spot. */
function tap(el: HTMLElement, at = { clientX: 100, clientY: 100 }) {
  act(() => {
    fireEvent.pointerDown(el, { button: 0, pointerId: 1, isPrimary: true, ...at });
    fireEvent.pointerUp(el, { button: 0, pointerId: 1, isPrimary: true, ...at });
  });
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
    const btn = screen.getByRole("button", { name: /Count one —/ });
    tap(btn);
    clock += 30; // duplicate event within the guard window
    tap(btn);
    clock += 200;
    tap(btn);
    expect(count()).toBe(2);

    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(count()).toBe(1);
  });

  it("does not count a touch that turns into a scroll", () => {
    renderCounter();
    const btn = screen.getByRole("button", { name: /Count one —/ });
    const down = { button: 0, pointerId: 1, isPrimary: true, clientX: 100, clientY: 200 };
    // Finger drags upward (scrolling the page) and lifts elsewhere.
    act(() => {
      fireEvent.pointerDown(btn, down);
      fireEvent.pointerMove(btn, { ...down, clientY: 160 });
      fireEvent.pointerUp(btn, { ...down, clientY: 120 });
    });
    // Browser takes over the gesture for scrolling.
    clock += 300;
    act(() => {
      fireEvent.pointerDown(btn, down);
      fireEvent.pointerCancel(btn, down);
      fireEvent.pointerUp(btn, down);
    });
    // Page scrolled while the finger was down.
    clock += 300;
    act(() => {
      fireEvent.pointerDown(btn, down);
      fireEvent.scroll(window);
      fireEvent.pointerUp(btn, down);
    });
    // Thumb resting on the circle for a long time.
    clock += 300;
    act(() => void fireEvent.pointerDown(btn, down));
    clock += 1500;
    act(() => void fireEvent.pointerUp(btn, down));
    expect(count()).toBe(0);

    // A small wobble is still a tap.
    clock += 300;
    act(() => {
      fireEvent.pointerDown(btn, down);
      fireEvent.pointerUp(btn, { ...down, clientX: 104, clientY: 203 });
    });
    expect(count()).toBe(1);
  });

  it("supports keyboard counting on the counter button", () => {
    renderCounter();
    const btn = screen.getByRole("button", { name: /Count one —/ });
    fireEvent.keyDown(btn, { key: "Enter" });
    clock += 200;
    fireEvent.keyDown(btn, { key: " " });
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
    const btn = screen.getByRole("button", { name: /Count one —/ });
    tap(btn);
    expect(count()).toBe(33);
    expect(vib).toHaveBeenLastCalledWith([300, 120, 300]);
    clock += 300;
    tap(btn); // during the hand-over: ignored
    expect(count()).toBe(33);
    act(() => void vi.advanceTimersByTime(1500));
    expect(useZikrStore.getState().activeId).toBe(DEFAULT_ZIKR[1].id);
    vi.useRealTimers();
  });

  it("stays on the zikr when 'Stay here' is pressed", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    useZikrStore.setState({ counts: { [DEFAULT_ZIKR[0].id]: 32 } });
    renderCounter(DEFAULT_ZIKR[1]);
    tap(screen.getByRole("button", { name: /Count one —/ }));
    await act(async () => {}); // flush the microtask that shows the hand-over bar
    fireEvent.click(screen.getByRole("button", { name: "Stay here" }));
    act(() => void vi.advanceTimersByTime(2000));
    expect(useZikrStore.getState().activeId).toBe(DEFAULT_ZIKR[0].id);
    vi.useRealTimers();
  });
});
