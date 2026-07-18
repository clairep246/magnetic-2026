import { test, expect } from '@playwright/test';

test.describe('Login module', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('https://magnetic-orbital.vercel.app/pages/Login/login.html/');
  });

  test('1. Empty email', async ({ page }) => {
    page.on('dialog', async dialog => {
      console.log(`[Dialog Detected]: "${dialog.message()}"`);
      expect(dialog.message()).toBe('Please enter your email');
      await dialog.accept();
    });

    await page.locator('#email').fill('');
    await page.locator('#password').fill('password123');
    await page.locator('#loginBtn').click();
  });

  test('2. Empty password', async ({ page }) => {
    page.on('dialog', async dialog => {
      console.log(`[Dialog Detected]: "${dialog.message()}"`);
      expect(dialog.message()).toBe('Please enter your password');
      await dialog.accept();
    });

    await page.locator('#email').fill('testuser@example.com');
    await page.locator('#password').fill('');
    await page.locator('#loginBtn').click();
  });

  test('3. Wrong password and email', async ({ page }) => {
    page.on('dialog', async dialog => {
      console.log(`[Dialog Detected]: "${dialog.message()}"`);
      expect(dialog.message()).toBe('Invalid login credentials');
      await dialog.accept();
    });

    await page.locator('#email').fill('testuser@example.com');
    await page.locator('#password').fill('123456');
    await page.locator('#loginBtn').click();
  });

  test('4. Successful login and profile redirection', async ({ page }) => {
    page.on('dialog', async dialog => {
      console.log(`[Dialog Detected]: "${dialog.message()}"`);
      expect(dialog.message()).toBe('Login successful!');
      await dialog.accept();
    });

    await page.locator('#email').fill('e123@u.nus.edu');
    await page.locator('#password').fill('123456');
    await page.locator('#loginBtn').click();

    await expect(page).toHaveURL(/.*\/Profile\/profile\.html/);
  });
  
});

//-----------------------------------------------
test.describe('Activity Creation', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('https://magnetic-orbital.vercel.app/pages/Login/login.html');

    page.once('dialog', async dialog => {
      expect(dialog.message()).toBe('Login successful!');
      await dialog.accept();
    });

    await page.locator('#email').fill('e123@u.nus.edu');
    await page.locator('#password').fill('123456');
    await page.locator('#loginBtn').click();

    await expect(page).toHaveURL(/.*\/Profile\/profile\.html/);

    await page.getByText('Your activities').click();
    await page.getByRole('link', { name: 'Create an activity' }).click();
    await expect(page).toHaveURL(/.*\/CreateActivity\/create\.html/);
  });

  test('Empty name', async ({ page }) => {
    page.once('dialog', async dialog => {
      expect(dialog.message()).toBe('Please enter an activity name');
      await dialog.accept();
    });

    await page.locator('#name').fill('');
    await page.locator('#location').fill('NUS');
    await page.locator('#date').fill('2026-12-01');
    await page.locator('#time').fill('14:00');
    await page.locator('#interest').fill('Running');
    await page.locator('#participants').fill('5');

    await page.locator('#saveActivity').click();
  });

  test('Empty location', async ({ page }) => {
    page.once('dialog', async dialog => {
      expect(dialog.message()).toBe('Please enter a location');
      await dialog.accept();
    });

    await page.locator('#name').fill('Test');
    await page.locator('#location').fill('');
    await page.locator('#date').fill('2026-12-01');
    await page.locator('#time').fill('14:00');
    await page.locator('#interest').fill('Running');
    await page.locator('#participants').fill('5');

    await page.locator('#saveActivity').click();
  });

  test('Past date', async ({ page }) => {
    page.once('dialog', async dialog => {
      expect(dialog.message()).toBe('Cannot choose past dates. Please choose a future date');
      await dialog.accept();
    });

    await page.locator('#name').fill('Testing');
    await page.locator('#location').fill('nus');
    await page.locator('#date').fill('2026-01-01');
    await page.locator('#time').fill('14:00');
    await page.locator('#interest').fill('Running');
    await page.locator('#participants').fill('5');

    await page.locator('#saveActivity').click();
  });

  test('Empty time', async ({ page }) => {
    page.once('dialog', async dialog => {
      expect(dialog.message()).toBe('Please select a time');
      await dialog.accept();
    });

    await page.locator('#name').fill('Badminton');
    await page.locator('#location').fill('nus');
    await page.locator('#date').fill('2026-12-01');
    await page.locator('#time').fill('');
    await page.locator('#interest').fill('Running');
    await page.locator('#participants').fill('5');

    await page.locator('#saveActivity').click();
  });

  test('Empty participants', async ({ page }) => {
    page.once('dialog', async dialog => {
      expect(dialog.message()).toBe('Please enter number of participants');
      await dialog.accept();
    });

    await page.locator('#name').fill('testing');
    await page.locator('#location').fill('nus');
    await page.locator('#date').fill('2026-12-01');
    await page.locator('#time').fill('14:00');
    await page.locator('#interest').fill('Running');
    await page.locator('#participants').fill('');

    await page.locator('#saveActivity').click();
  });

  test('More than 3 interests are entered', async ({ page }) => {
    page.once('dialog', async dialog => {
      expect(dialog.message()).toBe('Please enter max 3 interests');
      await dialog.accept();
    });

    await page.locator('#name').fill('Testing');
    await page.locator('#location').fill('nus');
    await page.locator('#date').fill('2026-12-01');
    await page.locator('#time').fill('14:00');
    await page.locator('#interest').fill('Running, Cycling, Swimming, Tennis');
    await page.locator('#participants').fill('5');

    await page.locator('#saveActivity').click();
  });

  test('Successfully create activity and redirect', async ({ page }) => {
    page.once('dialog', async dialog => {
      expect(dialog.message()).toBe('Activity successfully created!');
      await dialog.accept();
    });

    await page.locator('#name').fill('Valid Activity' + Date.now());
    await page.locator('#location').fill('nus');
    await page.locator('#date').fill('2026-12-25');
    await page.locator('#time').fill('18:00');
    await page.locator('#interest').fill('Gaming, Coding');
    await page.locator('#participants').fill('10');

    await page.locator('#saveActivity').click();

    await expect(page).toHaveURL(/.*\/ActivityPage\/activity\.html/);
  });
});
test.describe('Friend request', () => {
  let friendCode;
  test.beforeEach(async ({ page }) => {
    await page.goto('https://magnetic-orbital.vercel.app/pages/Login/login.html');

    page.once('dialog', async dialog => {
      expect(dialog.message()).toBe('Login successful!');
      await dialog.accept();
    });

    await page.locator('#email').fill('e123@u.nus.edu');
    await page.locator('#password').fill('123456');
    await page.locator('#loginBtn').click();

    await expect(page).toHaveURL(/.*\/Profile\/profile\.html/);

    await page.getByText('Friends').click();
    await expect(page).toHaveURL(/.*\/Friends\/friend\.html/);
  });

   test('Send friend request to existing friend', async ({ page }) => {
    page.once('dialog', async dialog => {
      expect(dialog.message()).toBe('You are already friends with this user.');
      await dialog.accept();
    });

    await page.locator('#friend-code-input').fill('W3CU6U');
    await page.getByText("Send Request").click();
  });

  test('Send friend request to non-existent user', async ({ page }) => {
    page.once('dialog', async dialog => {
      expect(dialog.message()).toBe('Invalid friend code');
      await dialog.accept();
    });

    await page.locator('#friend-code-input').fill('123456');
    await page.getByText("Send Request").click();
  });

  test("Send friend request with empty friend code", async ({ page }) => {
    page.once('dialog', async dialog => {
      expect(dialog.message()).toBe('Invalid friend code');
      await dialog.accept();
    });

    await page.locator('#friend-code-input').fill('');
    await page.getByText("Send Request").click();
  });

  test("Successfully send friend request", async ({ page }) => {
    page.once('dialog', async dialog => {
      expect(dialog.message()).toBe('Friend request sent!');
      await dialog.accept();
    });

    await page.getByText('Recommend Me').click();
    await page.getByRole('link', { name: 'Recommend users' }).click();
    await expect(page).toHaveURL(/.*\/RecommendFriends\/recommendF\.html/);

    const firstCard = page.locator('.recommend-card').first();
    await expect(firstCard).toBeVisible();

    const textBox = firstCard.locator('p', { hasText: 'Friend code' });
    
    const rawText = await textBox.textContent(); 
    if (rawText != null) {
      await page.getByRole('link', { name: 'Friends', exact: true }).click();
      await expect(page).toHaveURL(/.*\/Friends\/friend\.html/);
      friendCode = rawText.replace('Friend code', '').trim();
      //await page.locator('#friend-code-input').fill(friendCode);
      await page.locator("#friend-code-input").fill("E0H0CP");
      await page.getByText("Send Request").click();
    }
    });
     test("Send friend request with friend code that has been used before", async ({ page }) => {
    page.once('dialog', async dialog => {
      expect(dialog.message()).toBe('Request has already been sent to this user');
      await dialog.accept();
    });

    await page.locator('#friend-code-input').fill('E0H0CP');
    await page.getByText("Send Request").click();
  });
});

test.describe("Join and leave activities", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://magnetic-orbital.vercel.app/pages/Login/login.html');

    page.once('dialog', async dialog => {
      expect(dialog.message()).toBe('Login successful!');
      await dialog.accept();
    });

    await page.locator('#email').fill('e123@u.nus.edu');
    await page.locator('#password').fill('123456');
    await page.locator('#loginBtn').click();

    await expect(page).toHaveURL(/.*\/Profile\/profile\.html/);

    await page.getByText('Browse activities').click();
    await expect(page).toHaveURL(/.*\/ActivityBrowser\/browser\.html/);
  }); 
 test("Join activity and verify status", async ({ page }) => {
    page.once('dialog', async dialog => {
      expect(dialog.message()).toBe('Joined activity successfully');
      await dialog.accept();
    });
    const firstActivityCard = page.locator('.activityBox').first();
    await expect(firstActivityCard).toBeVisible();
    
    const activityName = await firstActivityCard.locator('h2').textContent();

    const joinButton = firstActivityCard.getByRole('button', { name: 'Join' });
    await joinButton.click();

    await expect(firstActivityCard.getByRole('button')).toHaveText(/Leave/i);

    await page.getByText("Joined activities").click();

    if (activityName != null) {
      await expect(page.getByText(activityName)).toBeVisible();
    }
  });
})