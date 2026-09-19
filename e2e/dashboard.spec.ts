import { expect, test, type Page } from "@playwright/test";

const values: Record<string, number> = {
  inflation: 2.8,
  growth: 2.1,
  unemployment: 4.2,
  perCapita: 82_000,
  population: 340_000_000,
  gdp: 28_000_000_000_000,
  gini: 41,
  participation: 62.5,
  employment: 60,
  wages: 70_000,
};

async function mockIndicators(page: Page) {
  await page.route("**/api/indicators?*", async (route) => {
    const url = new URL(route.request().url());
    const indicator = url.searchParams.get("indicator") ?? "inflation";
    const value = values[indicator] ?? 1;
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        indicator,
        observations: [
          { year: 2022, value: value * 0.9 },
          { year: 2023, value: value * 0.95 },
          { year: 2024, value },
        ],
        updated: "2026-01-01",
        ...(indicator === "wages"
          ? {
              wageBasis: {
                baseYear: 2025,
                currency: "USD_PPP",
                priceBasis: "constant",
                frequency: "annual",
                population: "full-time-equivalent dependent employees",
              },
            }
          : {}),
      }),
    });
  });
}

test.beforeEach(async ({ page }) => {
  await mockIndicators(page);
});

test("overview loads indicators and preserves a searched country", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "Covered by mobile navigation test");
  await page.goto("/?country=US&period=10");
  await expect(page.getByRole("heading", { name: "Economic Overview" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Inflation" }).first()).toBeVisible();

  await page.getByRole("button", { name: /Select country/ }).click();
  await page.getByRole("textbox", { name: "Search countries" }).fill("DEU");
  await page.getByRole("button", { name: /Germany/ }).click();

  await expect(page).toHaveURL(/country=DE/);
  await expect(page.getByRole("button", { name: /Select country, Germany/ })).toBeVisible();
});

test("comparison supports searched countries and shared latest values", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "Desktop comparison coverage");
  await page.goto(
    "/compare?country=US&countries=US,KR,JP&indicator=inflation&period=10",
  );
  await expect(page.getByRole("heading", { name: "Compare Countries" })).toBeVisible();
  await expect(page.getByRole("table", { name: /Inflation/ })).toContainText(
    "United States",
  );

  await page.getByPlaceholder("Search name or ISO code").fill("Brazil");
  await expect(page.getByText("Brazil", { exact: true })).toBeVisible();
  await expect(page.getByText("Germany", { exact: true })).toHaveCount(0);
});

test("mobile navigation opens, traps focus, and closes with Escape", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Mobile-only behavior");
  await page.goto("/about?country=JP&period=5");
  const open = page.getByRole("button", { name: "Open navigation" });
  await open.click();
  await expect(page.getByRole("button", { name: "Close navigation" }).last()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(open).toBeFocused();
});
