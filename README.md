# Personal FIRE Tracker - Web App

A FIRE (Financial Independence, Retire Early) tracking web app that helps users manage key inputs and view their portfolio + allocation decisions in one place, instead of jumping between multiple apps. 

---

## Minimum viable product (MVP) core feature list:
- [ ] **1. Manual portfolio input tool**
  - The app allows the user to manually enter what they currently hold (e.g., VTI, QQQ, VXUS) and how many shares they own for each symbol. The user can also set a target allocation percentage for each holding (e.g., 50/20/30).
  - Technology used: Next.js and React are used to create form inputs, and the data is stored locally in local storage.

- [ ] **2. Automatic stock price update via API**
  - The app fetches current stock/ETF prices using a public stock API (MarketStack). Since this API has rate limits, fetched prices are saved in localStorage and reused for up to one week. The user can still refresh manually if needed.
  - Technology used: Next.js API route is created to fetch the data from MarketStack API. Data will be stored in local storage for one week.

- [ ] **3. Portfolio allocation calculation**
  - After the user enters shares and the app has prices, the app calculates and visually displays the portfolio allocation through a chart or a graph with stock price, shares, value, and current allocation percentage.
  - Technology used: React is used to store the calculation code and the visual display code.

- [ ] **4. Manual paycheck and rent input tool**
  - The app allows the user to enter the paycheck amount and rent (with a frequency dropdown), then calculates how much is left after rent. This helps the user understand how much money is left available to allocate toward investing after fixed expenses.
  - Technology used: Next.js and React are used to create form inputs. Data are stored locally.

- [ ] **5. Contribution suggestion calculation**
  - The amount left from the paycheck is used to suggest contribution amounts to help the user rebalance their portfolio allocation. The app calculates and suggests approximate dollar amounts to invest in each symbol to move the portfolio closer to the target allocation percentages they set.
  - Technology used: React is used to store the calculation code and the visual display code.

## Nice-to-haves:
- [ ] Login and account creation
       MongoDB storage
- [ ] More investment types for tracking (e.g., bonds, HYSA, HSA, retirement account)
- [ ] Long-term retirement projections or predictions (how-if scenarios)
- [ ] Notifications/reminders on payday to input the paycheck

## Pages:

- [ ] **1. Dashboard (home page)**
  - a. Users can interact with this page by:
    - i. Clicking “update paycheck/inputs” and it goes to the Paycheck and Portfolio Input page
    - ii. Clicking “refresh prices” and it forces an API refresh
  - b. Users see:
    - i. The portfolio summary
      - 1. current prices (weekly auto-update)
      - 2. Total portfolio value
      - 3. current allocation summary
      - 4. Timestamp for the last price update
    - ii. Current paycheck snapshot
      - 1. Shows the most recently entered paycheck amount
      - 2. Shows rent (or whatever is being deducted from the paycheck)
      - 3. Shows “Amount left after rent”
    - iii. Suggested contribution table
      - 1. Table with Symbol, Price, Shares, Value, Current %, Target %, Difference, Suggested $

- [ ] **2. Paycheck and Portfolio Input page**
  - a. Users can interact with this page by:
    - i. entering paycheck amount
    - ii. entering rent amount
    - iii. entering shares and target allocation %
    - iv. Clicking the “Calculate/Update” or “Back to dashboard” to navigate back to the Dashboard.
  - b. When users update the inputs, the app saves data to local storage automatically and updates the calculation immediately using useState.

## External Resources:
- [ ] 1. Marketstack API (or any stock market API that allows fetching stock prices)
- [ ] 2. Nice-to-have
  - A chart library, such as Chart.js, to visually display the portfolio summary.
  - A database, such as MongoDB, to store user data.
