"use client";

import { useEffect, useState } from "react";

const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

export default function Home() {
    const [prices, setPrices] = useState(null);
    const [shares, setShares] = useState({ VTI: "10", QQQ: "5", VXUS: "8" });

    useEffect(() => {
        document.title = "Stock price API PoC";
        const cachedPrices = localStorage.getItem("poc_prices");
        if (cachedPrices) {
            const cachedPricesData = JSON.parse(cachedPrices);
            if (Date.now() - cachedPricesData.savedAt < ONE_WEEK) {
                setPrices(cachedPricesData.prices);
            }
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

    const priceBySymbol = prices || { VTI: null, QQQ: null, VXUS: null };
    const holdings = ["VTI", "QQQ", "VXUS"].map((symbol) => {
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

    const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
    const portfolioData = holdings.map((h) => ({
        ...h,
        percent: totalValue > 0 ? (h.value / totalValue) * 100 : 0,
    }));

    return (
        <main>
            <h1>Stock price API PoC</h1>
            <div>
                <button onClick={() => loadPrices(false)}>
                    Load prices (use 1-week cache)
                </button>{" "}
                <button onClick={() => loadPrices(true)}>Force refresh</button>
            </div>

            <h2>Portfolio Allocation</h2>
            <table border="1" cellPadding="6">
                <thead>
                    <tr>
                        <th>Symbol</th>
                        <th>Price</th>
                        <th>Shares</th>
                        <th>Value</th>
                        <th>Allocation %</th>
                    </tr>
                </thead>
                <tbody>
                    {portfolioData.map((row) => (
                        <tr key={row.symbol}>
                            <td>{row.symbol}</td>
                            <td>
                                {row.price == null
                                    ? "-"
                                    : `$${Number(row.price).toFixed(2)}`}
                            </td>
                            <td>
                                <input
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
                            <td>{row.percent.toFixed(2)}%</td>
                        </tr>
                    ))}
                    <tr>
                        <td colSpan="3">
                            <strong>Total</strong>
                        </td>
                        <td>
                            <strong>${totalValue.toFixed(2)}</strong>
                        </td>
                        <td>
                            <strong>100%</strong>
                        </td>
                    </tr>
                </tbody>
            </table>
        </main>
    );
}
