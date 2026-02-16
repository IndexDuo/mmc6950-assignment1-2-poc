"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function InputPage() {
    const router = useRouter();

    const [payAmount, setPayAmount] = useState("2000");
    const [payFrequency, setPayFrequency] = useState("biweekly");

    const [rentAmount, setRentAmount] = useState("700");
    const [rentFrequency, setRentFrequency] = useState("monthly");

    useEffect(() => {
        const savedInputs = localStorage.getItem("fire_inputs");

        if (savedInputs) {
            const data = JSON.parse(savedInputs);

            setPayAmount(data.payAmount ?? "2000");
            setPayFrequency(data.payFrequency ?? "biweekly");
            setRentAmount(data.rentAmount ?? "700");
            setRentFrequency(data.rentFrequency ?? "monthly");
        }
    }, []);

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
        return (rentNumber * 12) / paychecks;
    }, [rentAmount, rentFrequency, payFrequency]);

    const amountLeft = useMemo(() => {
        const payNumber = Number(payAmount) || 0;
        return payNumber - rentPerPaycheck;
    }, [payAmount, rentPerPaycheck]);

    function handleCalculateUpdate() {
        localStorage.setItem(
            "fire_inputs",
            JSON.stringify({
                payAmount,
                payFrequency,
                rentAmount,
                rentFrequency,
                savedAt: Date.now(),
            }),
        );

        router.push("/");
    }

    return (
        <main className="page-container">
            <div className="page-header">
                <h1>Paycheck and Portfolio Input</h1>
                <button
                    onClick={() => router.push("/")}
                    className="btn btn-secondary"
                >
                    Back to Dashboard
                </button>
            </div>

            <h2>Paycheck Information</h2>

            <div className="form-group">
                <label>Paycheck Amount</label>
                <input
                    className="input-field ml-6"
                    value={payAmount}
                    placeholder="2000"
                    onChange={(e) => setPayAmount(e.target.value)}
                />
                <select
                    className="select-field"
                    value={payFrequency}
                    onChange={(e) => setPayFrequency(e.target.value)}
                >
                    <option value="weekly">weekly</option>
                    <option value="biweekly">biweekly</option>
                    <option value="monthly">monthly</option>
                    <option value="annually">annually</option>
                </select>
            </div>

            <div className="form-group">
                <label>Rent Amount</label>
                <input
                    className="input-field ml-6"
                    value={rentAmount}
                    placeholder="700"
                    onChange={(e) => setRentAmount(e.target.value)}
                />
                <select
                    className="select-field"
                    value={rentFrequency}
                    onChange={(e) => setRentFrequency(e.target.value)}
                >
                    <option value="weekly">weekly</option>
                    <option value="monthly">monthly</option>
                </select>
            </div>

            <div className="info-section">
                <div className="info-label">Amount Left After Rent</div>
                <div className="info-value">${amountLeft.toFixed(2)}</div>
            </div>

            <button onClick={handleCalculateUpdate} className="btn btn-primary">
                Calculate/Update
            </button>
        </main>
    );
}
