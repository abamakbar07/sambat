import { test, expect, Page } from "@playwright/test"

// --- Mock Data ---
// Sample initial posts that would be on the page when it loads.
// These should ideally match what your test setup/seeding provides if you have that,
// or be consistent with what `getPosts` in `app/page.tsx` would return for the initial load.
const initialPostsData = [
  { id: "initial1", message: "Initial Post 1: A lovely day for music.", trackName: "Initial Song A", artistName: "Artist X", createdAt: "10 minutes ago", user: { name: "User Init1" }, likes: [], comments: [] },
  { id: "initial2", message: "Initial Post 2: Checking out this new album.", trackName: "Initial Song B", artistName: "Artist Y", createdAt: "2 hours ago", user: { name: "User Init2" }, likes: [], comments: [] },
]

const searchResultsMulti = [
  { id: "search1", message: "Found Post A about music search", trackName: "Search Song A", artistName: "Search Artist A", createdAt: "5 minutes ago", user: { name: "User Search1" }, likes: [], comments: [] },
  { id: "search2", message: "Another Found Post B on searching", trackName: "Search Song B", artistName: "Search Artist B", createdAt: "15 minutes ago", user: { name: "User Search2" }, likes: [], comments: [] },
]

const searchResultsSingle = [
  { id: "search3", message: "Unique result for specific query", trackName: "Search Song C", artistName: "Search Artist C", createdAt: "1 minute ago", user: { name: "User Search3" }, likes: [], comments: [] },
]

const searchResultsNone: any[] = []

// --- Helper Functions ---
async function setupInitialPageWithPosts(page: Page) {
  // Mock the initial server-side data fetch if necessary, or ensure test DB has these.
  // For this test, we assume Home component in app/page.tsx gets these via getPosts.
  // We will mock the initial posts directly in the page context for PostFeed
  // This is a bit of a workaround because modifying server-side getPosts is outside this test's scope.
  // A better way would be to seed a test DB or have a dedicated test API endpoint for initial data.

  // Since Home (RSC) fetches and passes data to PostFeed (Client Component),
  // the most direct way to control initialPosts for testing PostFeed's behavior
  // is to ensure these posts are somehow present when PostFeed initializes.
  // The current tests will rely on the actual initial posts rendered by the server.
  // We'll verify their presence.

  await expect(page.getByText(initialPostsData[0].message)).toBeVisible({ timeout: 10000 }) // Increased timeout for initial load
  await expect(page.getByText(initialPostsData[1].message)).toBeVisible()
}


// --- Test Suite ---
test.describe("Post Search Functionality", () => {
  const searchInputSelector = 'input[placeholder="Search for posts..."]'
  const loadingTextSelector = "text=Searching posts..."
  // This regex should match the empty state message in PostList when it receives an empty array.
  const noPostsFoundMessageSelector = 'text=/No posts found|No posts yet/i'


  test.beforeEach(async ({ page }) => {
    // It's crucial that the initial posts are consistently available for each test.
    // If app/page.tsx's getPosts is dynamic, these tests can become flaky.
    // For stable integration tests, a controlled environment (e.g., test database, mocked initial fetch) is best.
    // For now, we proceed assuming initialPostsData are representative of what's usually on the page.
    await page.goto("/")
    await setupInitialPageWithPosts(page)
  })

  test("should display multiple search results and revert to initial posts on clear", async ({ page }) => {
    await page.route("/api/search?type=post&q=multi-match", async (route) => {
      await route.fulfill({ json: searchResultsMulti })
    })

    await page.fill(searchInputSelector, "multi-match")
    await expect(page.locator(loadingTextSelector)).toBeVisible()
    await expect(page.locator(loadingTextSelector)).toBeHidden()

    await expect(page.getByText(searchResultsMulti[0].message)).toBeVisible()
    await expect(page.getByText(searchResultsMulti[1].message)).toBeVisible()
    await expect(page.getByText(initialPostsData[0].message)).toBeHidden()

    await page.fill(searchInputSelector, "") // Clear search
    await expect(page.getByText(initialPostsData[0].message)).toBeVisible()
    await expect(page.getByText(initialPostsData[1].message)).toBeVisible()
    await expect(page.getByText(searchResultsMulti[0].message)).toBeHidden()
  })

  test("should display a single search result", async ({ page }) => {
    await page.route("/api/search?type=post&q=single-match", async (route) => {
      await route.fulfill({ json: searchResultsSingle })
    })

    await page.fill(searchInputSelector, "single-match")
    await expect(page.locator(loadingTextSelector)).toBeVisible()
    await expect(page.locator(loadingTextSelector)).toBeHidden()

    await expect(page.getByText(searchResultsSingle[0].message)).toBeVisible()
    await expect(page.getByText(initialPostsData[0].message)).toBeHidden()
  })

  test("should display 'No posts found' for a search with no results", async ({ page }) => {
    await page.route("/api/search?type=post&q=no-match", async (route) => {
      await route.fulfill({ json: searchResultsNone }) // API returns empty array
    })

    await page.fill(searchInputSelector, "no-match")
    await expect(page.locator(loadingTextSelector)).toBeVisible()
    await expect(page.locator(loadingTextSelector)).toBeHidden()

    // **Crucial Assertion**: This test now assumes that if `PostFeed` receives an empty array 
    // from `PostSearch` due to a "no-match" query, it will pass this empty array to `PostList`.
    // `PostList` is then expected to render a "No posts found" (or similar) message.
    // This requires `PostFeed` logic to be:
    // `postsToDisplay = (condition for active search yielding no results) ? [] : (searchResults.length > 0 ? searchResults : initialPosts)`
    // If `PostFeed` still uses `postsToDisplay = searchResults.length > 0 ? searchResults : initialPosts;`,
    // then this test step will fail because initial posts will be shown.
    // This test is written for the *desired* behavior as per step 9 of the prompt.
    
    await expect(page.locator(noPostsFoundMessageSelector)).toBeVisible()
    await expect(page.getByText(initialPostsData[0].message)).toBeHidden()
    await expect(page.getByText(initialPostsData[1].message)).toBeHidden()
  })
})
