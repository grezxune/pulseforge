import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAction, useQuery } from "convex/react";
import App from "./App";

vi.mock("convex/react", () => ({
  useAction: vi.fn(),
  useQuery: vi.fn(),
}));

vi.mock("@marsidev/react-turnstile", () => ({
  Turnstile: ({ onSuccess }: { onSuccess: (token: string) => void }) => (
    <button type="button" onClick={() => onSuccess("captcha-token")}>Human Check</button>
  ),
}));

vi.mock("gsap", () => ({
  gsap: {
    context: (callback: () => void) => {
      callback();
      return { revert: () => undefined };
    },
    fromTo: vi.fn(),
    to: vi.fn(),
  },
}));

const mockedUseAction = vi.mocked(useAction);
const mockedUseQuery = vi.mocked(useQuery);

describe("App", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_TURNSTILE_SITE_KEY", "test-site-key");
    window.localStorage.clear();
    mockedUseQuery.mockReset();
    mockedUseAction.mockReset();
  });

  it("renders the global count and requires human verification", () => {
    mockedUseQuery.mockReturnValue({ total: 9876, shardCount: 128, activeShards: 18 } as never);
    mockedUseAction.mockReturnValue(vi.fn().mockResolvedValue({ ok: true, shard: 1 }) as never);

    render(<App />);

    expect(screen.getByText("9,876")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Press" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Human Check" }));

    expect(screen.getByRole("button", { name: "Press" })).toBeEnabled();
  });

  it("calls protected press action after captcha verification", async () => {
    const protectedPress = vi.fn().mockResolvedValue({ ok: true, shard: 6 });
    mockedUseQuery.mockReturnValue({ total: 2, shardCount: 128, activeShards: 2 } as never);
    mockedUseAction.mockReturnValue(protectedPress as never);

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Human Check" }));
    fireEvent.click(screen.getByRole("button", { name: "Press" }));

    await waitFor(() => {
      expect(protectedPress).toHaveBeenCalledWith({
        captchaToken: "captcha-token",
        clientId: expect.any(String),
      });
    });
  });
});
