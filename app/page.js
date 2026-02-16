"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

const TARGET_PERCENT_BY_SYMBOL = {
    VTI: 50,
    QQQ: 30,
    VXUS: 20,
};

export default function Home() {
    const [prices, setPrices] = useState(null);
    const [shares, setShares] = useState({ VTI: "10", QQQ: "5", VXUS: "8" });

    const [payAmount, setPayAmount] = useState("0");
    const [payFrequency, setPayFrequency] = useState("biweekly");
    const [rentAmount, setRentAmount] = useState("0");
    const [rentFrequency, setRentFrequency] = useState("monthly");

    useEffect(() => {
        document.title = "FIRE Tracker";

        // prices cache (weekly)
        const cachedPrices = localStorage.getItem("poc_prices");
        if (cachedPrices) {
            const cachedPricesData = JSON.parse(cachedPrices);
            if (Date.now() - cachedPricesData.savedAt < ONE_WEEK) {
                setPrices(cachedPricesData.prices);
            }
        }

        // inputs from /input page
        const savedInputs = localStorage.getItem("fire_inputs");
        if (savedInputs) {
            const data = JSON.parse(savedInputs);
            setPayAmount(data.payAmount ?? "0");
            setPayFrequency(data.payFrequency ?? "biweekly");
            setRentAmount(data.rentAmount ?? "0");
            setRentFrequency(data.rentFrequency ?? "monthly");
        }
    }, []);

    async function loadPrices(forceRefresh) {
        if (!forceRefresh) {
            const cachedPrices = localStorage.getItem("poc_prices");
            if (cachedPrices) {
                const cachedPricesData = JSON.parse(cachedPrices);
                if (Date.now() - cachedPricesData.savedAt < ONE_WEEK) {
                    setPrices(cachedPricesData.prices);
                    return;
                }
            }
        }

        const response = await fetch("/api/prices", { cache: "no-store" });
        const responseData = await response.json();

        setPrices(responseData.prices);
        localStorage.setItem(
            "poc_prices",
            JSON.stringify({
                prices: responseData.prices,
                savedAt: Date.now(),
            }),
        );
    }

    function paychecksPerYear(frequency) {
        if (frequency === "weekly") return 52;
        if (frequency === "biweekly") return 26;
        if (frequency === "monthly") return 12;
        return 1;
    }

    const rentPerPaycheck = useMemo(() => {
        const rentNumber = Number(rentAmount) || 0;
        const paychecks = paychecksPerYear(payFrequency);

        if (rentFrequency === "weekly") return (rentNumber * 52) / paychecks;
        return (rentNumber * 12) / paychecks; // monthly
    }, [rentAmount, rentFrequency, payFrequency]);

    const amountLeft = useMemo(() => {
        const payNumber = Number(payAmount) || 0;
        return payNumber - rentPerPaycheck;
    }, [payAmount, rentPerPaycheck]);

    const priceBySymbol = prices || { VTI: null, QQQ: null, VXUS: null };

    const holdings = useMemo(() => {
        return ["VTI", "QQQ", "VXUS"].map((symbol) => {
            const sharesAmount = Number(shares[symbol]) || 0;
            const currentPrice =
                priceBySymbol[symbol] == null
                    ? 0
                    : Number(priceBySymbol[symbol]) || 0;

            return {
                symbol,
                price: priceBySymbol[symbol],
                shares: sharesAmount,
                value: sharesAmount * currentPrice,
            };
        });
    }, [shares, priceBySymbol]);

    const totalValue = useMemo(() => {
        return holdings.reduce((sum, holding) => sum + holding.value, 0);
    }, [holdings]);

    const tableRows = useMemo(() => {
        const totalPortfolioValue = totalValue;
        const currentAllocationRows = holdings.map((holding) => {
            const currentPercent =
                totalPortfolioValue > 0
                    ? (holding.value / totalPortfolioValue) * 100
                    : 0;

            const targetPercent = TARGET_PERCENT_BY_SYMBOL[holding.symbol] || 0;
            const diffPercent = targetPercent - currentPercent;

            return {
                ...holding,
                currentPercent,
                targetPercent,
                diffPercent,
            };
        });

        const usableLeftover = amountLeft > 0 ? amountLeft : 0;

        const positiveDiffs = currentAllocationRows.map((row) =>
            row.diffPercent > 0 ? row.diffPercent : 0,
        );
        const sumPositiveDiffs = positiveDiffs.reduce((a, b) => a + b, 0);

        return currentAllocationRows.map((row, index) => {
            const suggestedAmount =
                sumPositiveDiffs === 0
                    ? 0
                    : (usableLeftover * positiveDiffs[index]) /
                      sumPositiveDiffs;

            return {
                ...row,
                suggestedAmount,
            };
        });
    }, [holdings, totalValue, amountLeft]);

    return (
        <main className="page-container">
            <div className="page-header">
                <h1>FIRE Tracker</h1>
                <Link href="/input" className="btn btn-secondary">
                    Update Paycheck/Inputs
                </Link>
            </div>

            <div className="button-group">
                <button
                    onClick={() => loadPrices(false)}
                    className="btn btn-primary"
                >
                    Load prices (use 1-week cache)
                </button>
                <button
                    onClick={() => loadPrices(true)}
                    className="btn btn-primary"
                >
                    Force refresh
                </button>
            </div>

            <h2>Current Paycheck Snapshot</h2>
            <p className="summary-text">
                Paycheck Amount{" "}
                <strong>${(Number(payAmount) || 0).toFixed(2)}</strong> | Rent
                (per paycheck) <strong>${rentPerPaycheck.toFixed(2)}</strong> |
                Amount Left After Rent <strong>${amountLeft.toFixed(2)}</strong>
            </p>

            <h2>Suggested Contribution Table</h2>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Symbol</th>
                        <th>Price</th>
                        <th>Shares</th>
                        <th>Value</th>
                        <th>Current %</th>
                        <th>Target %</th>
                        <th>Diff</th>
                        <th>Suggested $</th>
                    </tr>
                </thead>
                <tbody>
                    {tableRows.map((row) => (
                        <tr key={row.symbol}>
                            <td>{row.symbol}</td>
                            <td>
                                {row.price == null
                                    ? "-"
                                    : `$${Number(row.price).toFixed(2)}`}
                            </td>
                            <td>
                                <input
                                    className="input-field"
                                    value={shares[row.symbol]}
                                    onChange={(e) =>
                                        setShares({
                                            ...shares,
                                            [row.symbol]: e.target.value,
                                        })
                                    }
                                />
                            </td>
                            <td>${row.value.toFixed(2)}</td>
                            <td>{row.currentPercent.toFixed(2)}%</td>
                            <td>{row.targetPercent.toFixed(2)}%</td>
                            <td>
                                {row.diffPercent >= 0 ? "+" : ""}
                                {row.diffPercent.toFixed(2)}%
                            </td>
                            <td>${row.suggestedAmount.toFixed(2)}</td>
                        </tr>
                    ))}
                    <tr>
                        <td colSpan="3">
                            <strong>Total</strong>
                        </td>
                        <td>
                            <strong>${totalValue.toFixed(2)}</strong>
                        </td>
                        <td colSpan="4"></td>
                    </tr>
                </tbody>
            </table>
        </main>
    );
}
