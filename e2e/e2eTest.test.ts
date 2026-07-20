import { test, expect } from '@playwright/test';
import { join } from 'node:path';


test.describe('Signup', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('https://magnetic-orbital.vercel.app/pages/Signup/signup.html');
  });

  test('1. Empty name', async ({ page }) => {
    page.on('dialog', async dialog => {
      console.log(`[Dialog Detected]: "${dialog.message()}"`);
      expect(dialog.message()).toBe('Please enter your name');
      await dialog.accept();
    });
    await page.locator("#name").fill("")
    await page.locator('#email').fill(Date.now() + '@u.nus.edu');
    await page.locator('#password').fill('password123');
    await page.locator('#signUp').click();
  });

  test('2. Empty email', async ({ page }) => {
    page.on('dialog', async dialog => {
      console.log(`[Dialog Detected]: "${dialog.message()}"`);
      expect(dialog.message()).toBe('Please enter your email');
      await dialog.accept();
    });

    await page.locator("#name").fill("tester")
    await page.locator('#email').fill('');
    await page.locator('#password').fill('password123');
    await page.locator('#signUp').click();
  });

  test('3. Empty password', async ({ page }) => {
    page.on('dialog', async dialog => {
      console.log(`[Dialog Detected]: "${dialog.message()}"`);
      expect(dialog.message()).toBe('Please enter your password');
      await dialog.accept();
    });

    await page.locator("#name").fill("tester")
    await page.locator('#email').fill(Date.now() + "@u.nus.edu");
    await page.locator('#password').fill('');
    await page.locator('#signUp').click();
  });

  test('4. Using existing account detaila', async ({ page }) => {
    page.on('dialog', async dialog => {
      console.log(`[Dialog Detected]: "${dialog.message()}"`);
      expect(dialog.message()).toBe('User already registered');
      await dialog.accept();
    });

    await page.locator("#name").fill("tester")
    await page.locator('#email').fill("e123@u.nus.edu");
    await page.locator('#password').fill('123456');
    await page.locator('#signUp').click();
  });

  test('5. Non nus email', async ({ page }) => {
    page.on('dialog', async dialog => {
      console.log(`[Dialog Detected]: "${dialog.message()}"`);
      expect(dialog.message()).toBe('Only valid NUS emails are allowed');
      await dialog.accept();
    });

    await page.locator("#name").fill("tester")
    await page.locator('#email').fill("e123@gmail.com");
    await page.locator('#password').fill('123456');
    await page.locator('#signUp').click();
  });
  
  test('6. Successful signup', async ({ page }) => {
  test.setTimeout(80000);

  // Handle signup success dialog
  page.once('dialog', async dialog => {
    console.log(`[Dialog Detected]: "${dialog.message()}"`);
    expect(dialog.message()).toBe('Signup successful!');
    await dialog.accept();
  });

  await page.locator("#name").fill("tester");
  await page.locator("#email").fill(`${Date.now()}@u.nus.edu`);
  await page.locator("#password").fill("123456");
  await page.getByRole("button", { name: "Create Account" }).click();

  // Wait until the profile page is loaded
  await expect(page).toHaveURL(/.*\/EditProfile\/edit\.html/);

  // Register the next dialog BEFORE clicking Save
  page.once('dialog', async dialog => {
    console.log(`[Dialog Detected]: "${dialog.message()}"`);
    expect(dialog.message()).toBe('Profile successfully created!');
    await dialog.accept();
  });

  await page.getByRole('textbox', { name: 'Enter your name' }).fill('hi');
  await page.locator("#year").selectOption("Year 1");
  await page.locator('#residence').selectOption('NIL');
  await page.locator('#major').selectOption('Sciences');
  await page.getByRole('checkbox', { name: 'Music' }).check();

  await page.getByRole('button', { name: 'Save' }).click();

  // Optional: verify you're still on the profile page
  await expect(page).toHaveURL(/.*\/Profile\/profile\.html/);
});
});
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
     const dialogPromise = page.waitForEvent("dialog");
    
  page.once("dialog", async (dialog) => {
        expect(dialog.message()).toBe("Invalid login credentials");
        await dialog.accept();
    });

    await page.locator('#email').fill('testuser@example.com');
    await page.locator('#password').fill('123456');
    await page.locator('#loginBtn').click();
      await dialogPromise; 

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
  // 1. Fill in the form fields
  await page.locator('#name').fill('Valid Activity' + Date.now());
  await page.locator('#location').fill('nus');
  await page.locator('#date').fill('2026-12-25');
  await page.locator('#time').fill('18:00');
  await page.locator('#interest').fill('Gaming, Coding');
  await page.locator('#participants').fill('10');

  // 2. Set up the event promise and trigger the click simultaneously
  const [dialog] = await Promise.all([
    page.waitForEvent('dialog'),
    page.locator('#saveActivity').click()
  ]);

  // 3. Assert on the dialog message and accept it
  expect(dialog.message()).toBe('Activity successfully created!');
  await dialog.accept();

  // 4. Assert the final redirect after the dialog is closed
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
  const dialogPromise = page.waitForEvent("dialog");
    
  page.once("dialog", async (dialog) => {
        expect(dialog.message()).toBe("Invalid friend code");
        await dialog.accept();
    });

    await page.locator('#friend-code-input').fill('');
    await page.getByText("Send Request").click();
    await dialogPromise; 
  });

 test("Successfully send friend request", async ({ page }) => {
    await page.goto("https://magnetic-orbital.vercel.app/pages/RecommendFriends/recommendF.html");

    const firstCard = page.locator(".recommend-card").first();
    await expect(firstCard).toBeVisible();

    let friendCode = await firstCard.locator(".friend-code").textContent();
    expect(friendCode).not.toBeNull();

    await page.goto("https://magnetic-orbital.vercel.app/pages/Friends/friend.html");
    await page.locator("#friend-code-input").fill(friendCode!.trim());

    const dialogPromise = page.waitForEvent("dialog");
    
  page.once("dialog", async (dialog) => {
        expect(dialog.message()).toBe("Friend request sent!");
        await dialog.accept();
    });

    await page.getByRole("button", { name: "Send Request" }).click();
    await dialogPromise; 
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
let activityName: string; 
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
  });
  test("Join activity, verify joined activity, and leave activity", async ({ page }) => {
    test.setTimeout(80000);

    await page.getByText("Browse activities").click();
    await expect(page).toHaveURL(/.*\/ActivityBrowser\/browser\.html/);

    let firstActivityCard = page.locator(".activityBox").first();
    await expect(firstActivityCard).toBeVisible();
    let activityName = (await firstActivityCard.locator("h2").textContent()) ?? "";

    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toBe("Successfully joined activity!");
      await dialog.accept();
    });
    
    await Promise.all([
      page.waitForEvent("dialog"),
      firstActivityCard.getByRole("button", { name: "Join" }).click()
    ]);

    await expect(firstActivityCard.getByRole("button")).toHaveText("Leave Activity");

    await page.locator("#joinedActivities").click();
    let joinedCard = page.locator(".activityBox").filter({ hasText: activityName });
    await expect(joinedCard).toBeVisible();
    
    await page.locator("#allActivities").click();
    
    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toBe("Left activity successfully");
      await dialog.accept();
    });

    await Promise.all([
      page.waitForEvent("dialog"),
      joinedCard.getByRole("button").click()
    ]);

    await expect(joinedCard.getByRole("button")).toHaveText("Join");
  });
})