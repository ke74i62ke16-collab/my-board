import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

// ── 1. ホームページ ──
await page.goto("http://localhost:3000");
await page.waitForLoadState("networkidle");
await page.screenshot({ path: "C:/Users/falco/Documents/projects/my-board/ss-home.png", fullPage: true });
console.log("HOME title=" + await page.title());

// カテゴリタブ（「すべて」＋5カテゴリ）
const tabs = await page.locator("a[href='/'], a[href*='?category=']").allTextContents();
console.log("TABS:", tabs.join(" | "));
console.log("TAB_COUNT:", tabs.length, tabs.length === 6 ? "OK" : "NG (expected 6)");

// 本文テキストエリア
const bodyCount = await page.locator("textarea[name='body']").count();
console.log("BODY_TEXTAREA:", bodyCount > 0 ? "OK" : "MISSING");

// フィルターラベル
const filterCount = await page.locator("text=カテゴリで絞り込み").count();
console.log("FILTER_LABEL:", filterCount > 0 ? "OK" : "MISSING");

// ── 2. スレッド作成（ナビゲーション完了を正しく待機） ──
await page.fill("input[name='title']", "Phase2テスト " + Date.now());
await page.fill("textarea[name='body']", "本文テスト。>>1 参照テスト。");
await page.selectOption("select[name='category']", "chat");

await Promise.all([
  page.waitForURL(/\/threads\//),
  page.click("button[type='submit']"),
]);
await page.waitForLoadState("networkidle");
await page.screenshot({ path: "C:/Users/falco/Documents/projects/my-board/ss-thread.png", fullPage: true });
console.log("THREAD_URL:", page.url());

// 🔥 ボタン
const fireBtns = await page.locator("button:has-text('🔥')").count();
console.log("FIRE_BTNS:", fireBtns > 0 ? "OK (" + fireBtns + ")" : "MISSING");

// 常時表示の返信フォーム
const replyForms = await page.locator("textarea[name='body']").count();
console.log("ALWAYS_REPLY_FORM:", replyForms > 0 ? "OK" : "MISSING");

// ── 3. 返信投稿 ──
await page.locator("textarea[name='body']").fill("最初の返信です");
await Promise.all([
  page.waitForURL(/\/threads\//),
  page.click("button[type='submit']"),
]);
await page.waitForLoadState("networkidle");
await page.screenshot({ path: "C:/Users/falco/Documents/projects/my-board/ss-replied.png", fullPage: true });

// 返信ボタン確認
const replyBtns = await page.locator("button:has-text('返信')").count();
console.log("REPLY_BTNS:", replyBtns);

// ── 4. >>N 返信モード ──
if (replyBtns > 0) {
  await page.locator("button:has-text('返信')").first().click();
  await page.waitForTimeout(300);
  const modeText = await page.locator("text=への返信").count();
  console.log("REPLY_N_MODE:", modeText > 0 ? "OK" : "MISSING");
  const cancelBtn = await page.locator("button:has-text('キャンセル')").count();
  console.log("CANCEL_BTN:", cancelBtn > 0 ? "OK" : "MISSING");
  await page.screenshot({ path: "C:/Users/falco/Documents/projects/my-board/ss-replymode.png", fullPage: true });
}

// ── 5. 🔥 いいね（楽観的更新） ──
const fireBtn = page.locator("button:has-text('🔥')").first();
const beforeText = await fireBtn.textContent();
await fireBtn.click();
await page.waitForTimeout(600);
const afterText = await fireBtn.textContent();
console.log("LIKE_BEFORE:", beforeText?.trim(), "→ AFTER:", afterText?.trim());
await page.screenshot({ path: "C:/Users/falco/Documents/projects/my-board/ss-liked.png", fullPage: false });

// ── 6. カテゴリタブでフィルター（ホームページ） ──
await page.goto("http://localhost:3000");
await page.waitForLoadState("networkidle");
const chatTab = page.locator("a[href*='category=chat']");
await Promise.all([
  page.waitForURL(/category=chat/),
  chatTab.click(),
]);
await page.waitForLoadState("networkidle");
await page.screenshot({ path: "C:/Users/falco/Documents/projects/my-board/ss-catfilter.png", fullPage: false });
const chatUrl = page.url();
console.log("CAT_FILTER_URL:", chatUrl.includes("category=chat") ? "OK" : "NG");

await browser.close();
console.log("DONE");
