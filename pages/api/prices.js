async function getPrices() {
    const key = process.env.MARKETSTACK_API_KEY;
    const symbols = "VTI,QQQ,VXUS";
    const url =
        `https://api.marketstack.com/v2/eod/latest` +
        `?access_key=${encodeURIComponent(key)}` +
        `&symbols=${encodeURIComponent(symbols)}`;

    console.log("Marketstack URL:", url);

    const response = await fetch(url);
    const data = await response.json();

    console.log(response.status);
    console.log(data);

    const prices = {
        VTI: null,
        QQQ: null,
        VXUS: null,
    };

    const rows = data.data;

    for (const row of rows) {
        const symbol = String(row.symbol).toUpperCase();
        const close = Number(row.close ?? row.adj_close);

        if (symbol === "VTI") prices.VTI = close;
        if (symbol === "QQQ") prices.QQQ = close;
        if (symbol === "VXUS") prices.VXUS = close;
    }

    console.log(prices);

    return prices;
}
export default async function handler(req, res) {
    switch (req.method) {
        case "GET":
            try {
                const prices = await getPrices();

                return res.status(200).json({
                    prices,
                    source: "marketstack",
                    updatedAt: new Date().toISOString(),
                });
            } catch (error) {
                console.error(error);
                return res.status(400).json({ error: error.message });
            }

        default:
            return res.status(404).end();
    }
}
