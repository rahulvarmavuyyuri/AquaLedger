# AquaLedger

Farm management for shrimp and fish farms. Record tanks, seed stocking, feed, water quality, medication and chemicals, mortality and harvest. The dashboard raises alerts for problems, and inventory, profit by tank and exportable reports are built in. It works on phones and desktops, can be installed to a phone's home screen, and keeps working on a weak connection.

## What it does

| Area | What you record or see |
| --- | --- |
| **Tanks** | Tank ID, name, capacity, location, species (shrimp or fish icon), active or inactive |
| **Seed stocking** | Date, tank, seed type, quantity, supplier, average size, cost. Each stocking starts a crop cycle. |
| **Medication & chemicals** | Date, tank, product, quantity and unit (kg, g, l, ml), purpose, applied by, withdrawal period |
| **Feed** | Date, time, tank, feed type, kg given. Feed draws down inventory and is costed at average purchase price. |
| **Water quality** | pH, temperature, dissolved oxygen, salinity and ammonia, checked against your safe ranges |
| **Mortality** | Dead count and cause; updates the live count and survival rate |
| **Harvest** | Partial or final harvest, kg, average weight, pieces, count per kg, price and buyer. A final harvest closes the cycle. |
| **Inventory** | Stock on hand, low-stock warnings, average cost |
| **Costs & profit** | Revenue against seed, feed, medication and other expenses, per tank and for the whole farm |
| **Reports** | Current seed count, medication history, feed consumption, water trends, mortality, harvest summary, profit and loss. Each one exports to Excel, PDF or CSV. |

The dashboard flags out-of-range water readings, missing readings, mortality spikes, low stock, feed not logged today, and tanks still inside a medicine withdrawal period.

## Set up (about 15 minutes, free)

Records are stored in **Firebase Firestore**, and people sign in with **Google**. On Firebase's free Spark plan a small farm fits comfortably within the free usage limits.

### 1. Create the Firebase project
1. Go to <https://console.firebase.google.com>, then **Add project**. Name it (for example `aqualedger-farm`). Google Analytics is optional.
2. Open **Build → Firestore Database → Create database**. Choose **Production mode**. For a farm in India, pick the `asia-south1 (Mumbai)` location.
3. Open **Build → Authentication → Get started → Sign-in method → Google → Enable**, then save.
4. In **Authentication → Settings → Authorized domains**, add `rahulvarmavuyyuri.github.io`.

### 2. Connect the app
1. In **Project settings → General → Your apps**, click the web icon `</>` and register an app called `AquaLedger`. Hosting is not needed.
2. Copy the `firebaseConfig` values into [`firebase-config.js`](firebase-config.js).
3. In the same file, replace `owner@example.com` with your own Google email.

### 3. Lock down the data
1. Open [`firestore.rules`](firestore.rules) and replace `owner@example.com` with the same email.
2. In Firebase, go to **Firestore Database → Rules**, paste the whole file and click **Publish**.

Without published rules, anyone could read your farm data. The rules allow only the owner and the people you add.

### 4. Publish the website
Every push to `main` deploys to GitHub Pages through `.github/workflows/pages.yml`. If the first run fails, open the repository's **Settings → Pages**, set **Source** to **GitHub Actions**, then re-run the workflow from the **Actions** tab.

The site is then live at **https://rahulvarmavuyyuri.github.io/AquaLedger/**.

GitHub Pages on a free account requires the repository to be public. That's fine here: the Firebase keys in `firebase-config.js` only identify your project, and the rules from step 3 protect the data.

### 5. Add your team
Sign in as the owner, open **Settings → Team access**, and add each person's Google email:

| Role | Can do |
| --- | --- |
| **Staff** | Add and edit all farm records |
| **Viewer** | Read records and reports only |
| **Admin** | Everything staff can do, plus manage the team and farm settings |

People who sign in without being added see a "Waiting for access" screen showing their email.

To try every screen before entering real data, tap **Load sample farm** on the empty dashboard. Sample records are marked, and **Remove sample data** deletes them in one step.

## Install on a phone
Open the site in Chrome (Android) or Safari (iPhone), then choose **Add to Home screen**. It opens full screen like an app. Entries made with no signal are saved on the phone and sync automatically when the connection returns.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The whole app: layout, styles and logic |
| `firebase-config.js` | Your Firebase project keys and owner email |
| `firestore.rules` | Who can read and write data |
| `firebase.json` | Lets the Firebase CLI deploy the rules with `firebase deploy --only firestore:rules` |
| `manifest.webmanifest`, `sw.js`, `icons/` | Home-screen install and offline loading |
| `.github/workflows/pages.yml` | Publishes the site to GitHub Pages |

There is no build step. To run it locally, serve the folder with any static server (for example `python3 -m http.server`) and add `localhost` to Firebase's authorized domains.

## Notes
- Exported PDFs show the rupee symbol as "Rs" because the built-in PDF font has no ₹ glyph. Excel and CSV exports keep plain numbers.
- Water ranges, farm name, currency symbol and staff names are set in **Settings**.
- Download a full backup (JSON or Excel) from **Settings → Data** at the end of each season.

## AquaLedger Farms (multi-farm, for clients)

A second site at **/farms/** (https://rahulvarmavuyyuri.github.io/AquaLedger/farms/) lets you run AquaLedger for many client farms from one place. It uses its **own Firebase project**, so it never touches your own farm's data above.

- **Provider** (rahulvarmavuyyuri@gmail.com): opens **All farms**, creates a farm with its owner's Google email and plan, pauses or resumes farms, and can open any farm for support.
- **Farm owner**: sees only their farm and adds their own staff in Settings → Team access.
- **Staff / viewers**: see only the farm(s) they were added to.
- **Paused farm**: its team keeps read-only access until resumed.

Files: `farms/index.html`, `farms/firebase-config.js` (new project keys + provider emails), `farms/firestore.rules` (publish these in the new project), `farms/sw.js`, `farms/manifest.webmanifest`.
The **Farms security test** workflow checks the rules in Google's Firestore emulator whenever they change.
