import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Components use the Next.js App Router; provide a minimal stub outside Next.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), replace: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));
