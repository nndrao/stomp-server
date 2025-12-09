const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Fixed income instrument types
const instrumentTypes = ['Treasury', 'Corporate', 'Municipal', 'MBS', 'ABS', 'Agency', 'Sovereign'];
const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF'];
const sectors = ['Financial', 'Technology', 'Healthcare', 'Energy', 'Consumer', 'Industrial', 'Utilities', 'Real Estate'];
const ratings = ['AAA', 'AA+', 'AA', 'AA-', 'A+', 'A', 'A-', 'BBB+', 'BBB', 'BBB-', 'BB+', 'BB', 'BB-'];
const traders = ['John Smith', 'Jane Doe', 'Mike Johnson', 'Sarah Williams', 'Tom Brown', 'Lisa Davis'];
const books = ['BOOK001', 'BOOK002', 'BOOK003', 'BOOK004', 'BOOK005'];
const desks = ['IG Credit', 'HY Credit', 'Govies', 'EM Debt', 'Structured Products', 'Rates'];
const regions = ['Americas', 'EMEA', 'APAC'];

// Helper functions
function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomNumber(min, max, decimals = 2) {
    const num = Math.random() * (max - min) + min;
    return decimals !== null ? parseFloat(num.toFixed(decimals)) : num;
}

function generateCUSIP() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let cusip = '';
    for (let i = 0; i < 9; i++) {
        cusip += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return cusip;
}

function generateISIN() {
    const countryCode = getRandomElement(['US', 'GB', 'DE', 'FR', 'JP', 'CA', 'AU']);
    return countryCode + generateCUSIP().substring(0, 10);
}

function getRandomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generatePosition(index, cusipList) {
    const cusip = cusipList[index % cusipList.length];
    const notional = getRandomNumber(100000, 50000000, 0);
    const price = getRandomNumber(85, 115, 4);
    const marketValue = notional * price / 100;
    
    return {
        positionId: `POS-${uuidv4()}`,
        cusip: cusip,
        isin: generateISIN(),
        sedol: Math.random().toString(36).substring(2, 9).toUpperCase(),
        ticker: `TICK${index}`,
        instrumentName: `${getRandomElement(sectors)} ${getRandomNumber(2025, 2050, 0)} ${getRandomNumber(1, 10, 3)}%`,
        instrumentType: getRandomElement(instrumentTypes),
        asOfDate: new Date().toISOString(),
        bookName: getRandomElement(books),
        portfolio: `PORT${Math.floor(index / 100)}`,
        trader: getRandomElement(traders),
        desk: getRandomElement(desks),
        region: getRandomElement(regions),
        country: getRandomElement(['USA', 'UK', 'Germany', 'France', 'Japan', 'Canada']),
        currency: getRandomElement(currencies),
        quantity: getRandomNumber(100, 10000, 0),
        notionalAmount: notional,
        marketValue: marketValue,
        bookValue: marketValue * getRandomNumber(0.95, 1.05, 4),
        accruedInterest: getRandomNumber(0, notional * 0.05, 2),
        totalValue: marketValue + getRandomNumber(0, notional * 0.05, 2),
        costBasis: marketValue * getRandomNumber(0.9, 1.1, 4),
        averagePrice: price,
        currentPrice: price,
        priceSource: getRandomElement(['Bloomberg', 'Reuters', 'ICE', 'MarketAxess']),
        pnl: getRandomNumber(-100000, 100000, 0),
        unrealizedPnl: getRandomNumber(-50000, 50000, 0),
        realizedPnl: getRandomNumber(-50000, 50000, 0),
        dailyPnl: getRandomNumber(-10000, 10000, 0),
        mtdPnl: getRandomNumber(-50000, 50000, 0),
        ytdPnl: getRandomNumber(-200000, 200000, 0),
        maturityDate: getRandomDate(new Date(2025, 0, 1), new Date(2055, 0, 1)).toISOString().split('T')[0],
        issueDate: getRandomDate(new Date(2015, 0, 1), new Date(2024, 0, 1)).toISOString().split('T')[0],
        couponRate: getRandomNumber(0, 8, 3),
        couponFrequency: getRandomElement([1, 2, 4]),
        dayCountConvention: getRandomElement(['30/360', 'ACT/360', 'ACT/365', 'ACT/ACT']),
        nextCouponDate: getRandomDate(new Date(), new Date(2025, 0, 1)).toISOString().split('T')[0],
        yield: getRandomNumber(0, 8, 3),
        yieldToMaturity: getRandomNumber(0, 8, 3),
        modifiedDuration: getRandomNumber(0.1, 20, 2),
        effectiveDuration: getRandomNumber(0.1, 20, 2),
        macaulayDuration: getRandomNumber(0.1, 20, 2),
        convexity: getRandomNumber(0, 500, 2),
        effectiveConvexity: getRandomNumber(0, 500, 2),
        spread: getRandomNumber(-50, 500, 0),
        assetSwapSpread: getRandomNumber(-50, 500, 0),
        zSpread: getRandomNumber(-50, 500, 0),
        oas: getRandomNumber(-50, 500, 0),
        dv01: getRandomNumber(10, 10000, 2),
        pv01: getRandomNumber(10, 10000, 2),
        cs01: getRandomNumber(1, 1000, 2),
        rating: {
            moody: getRandomElement(ratings),
            sp: getRandomElement(ratings),
            fitch: getRandomElement(ratings),
            composite: getRandomElement(ratings),
            internal: getRandomElement(ratings)
        },
        issuer: {
            name: `${getRandomElement(sectors)} Corp ${index}`,
            sector: getRandomElement(sectors),
            industry: getRandomElement(['Banking', 'Insurance', 'Software', 'Hardware', 'Retail', 'Manufacturing']),
            country: getRandomElement(['USA', 'UK', 'Germany', 'France', 'Japan']),
            parentCompany: `Parent Corp ${Math.floor(index / 10)}`,
            marketCap: getRandomNumber(1000000000, 100000000000, 0),
            creditRating: getRandomElement(ratings)
        },
        riskMetrics: {
            var95: getRandomNumber(10000, 1000000, 2),
            var99: getRandomNumber(20000, 2000000, 2),
            cvar95: getRandomNumber(15000, 1500000, 2),
            cvar99: getRandomNumber(25000, 2500000, 2),
            expectedShortfall: getRandomNumber(20000, 2000000, 2),
            beta: getRandomNumber(0.5, 1.5, 3),
            correlation: getRandomNumber(-1, 1, 3),
            trackingError: getRandomNumber(0, 5, 3),
            sharpeRatio: getRandomNumber(-2, 3, 3),
            informationRatio: getRandomNumber(-2, 3, 3)
        },
        analytics: {
            keyRateDuration: {
                "1M": getRandomNumber(-0.1, 0.1, 4),
                "3M": getRandomNumber(-0.2, 0.2, 4),
                "6M": getRandomNumber(-0.3, 0.3, 4),
                "1Y": getRandomNumber(-0.5, 0.5, 4),
                "2Y": getRandomNumber(-1, 1, 4),
                "3Y": getRandomNumber(-1.5, 1.5, 4),
                "5Y": getRandomNumber(-3, 3, 4),
                "7Y": getRandomNumber(-4, 4, 4),
                "10Y": getRandomNumber(-5, 5, 4),
                "20Y": getRandomNumber(-8, 8, 4),
                "30Y": getRandomNumber(-10, 10, 4)
            },
            scenarioAnalysis: {
                parallelShiftUp100: getRandomNumber(-10, -1, 2),
                parallelShiftDown100: getRandomNumber(1, 10, 2),
                steepening50: getRandomNumber(-5, 5, 2),
                flattening50: getRandomNumber(-5, 5, 2),
                twist: getRandomNumber(-3, 3, 2)
            },
            greeks: {
                delta: getRandomNumber(-1, 1, 4),
                gamma: getRandomNumber(0, 0.1, 6),
                theta: getRandomNumber(-100, 0, 2),
                vega: getRandomNumber(0, 1000, 2),
                rho: getRandomNumber(-1000, 1000, 2)
            }
        },
        cashflows: {
            nextCashflow: getRandomNumber(0, notional * 0.08, 2),
            nextCashflowDate: getRandomDate(new Date(), new Date(2025, 0, 1)).toISOString().split('T')[0],
            totalRemainingCashflows: getRandomNumber(notional, notional * 1.5, 2),
            averageLife: getRandomNumber(0.5, 30, 2),
            weightedAverageLife: getRandomNumber(0.5, 30, 2)
        },
        prepayment: {
            cpr: getRandomNumber(0, 50, 2),
            smm: getRandomNumber(0, 5, 2),
            psa: getRandomNumber(50, 300, 0),
            historicalCpr: getRandomNumber(0, 40, 2),
            projectedCpr: getRandomNumber(0, 50, 2)
        },
        collateral: {
            type: getRandomElement(['Real Estate', 'Auto', 'Credit Card', 'Student Loan', 'Equipment']),
            description: `Collateral pool ${index}`,
            value: notional * getRandomNumber(1, 1.5, 2),
            ltv: getRandomNumber(50, 90, 2),
            coverage: getRandomNumber(100, 200, 2)
        },
        compliance: {
            regulatoryCapital: getRandomNumber(10000, 1000000, 2),
            rwa: getRandomNumber(10000, 5000000, 2),
            liquidityCoverage: getRandomNumber(100, 200, 2),
            nsfr: getRandomNumber(100, 150, 2),
            leverageRatio: getRandomNumber(3, 10, 2),
            concentrationLimit: getRandomNumber(0, 100, 2),
            breachStatus: Math.random() > 0.95
        },
        accounting: {
            accountingClassification: getRandomElement(['HTM', 'AFS', 'Trading']),
            fairValueHierarchy: getRandomElement([1, 2, 3]),
            hedgeDesignation: getRandomElement(['Fair Value', 'Cash Flow', 'Net Investment', 'None']),
            hedgeEffectiveness: getRandomNumber(80, 100, 2),
            impairment: getRandomNumber(0, notional * 0.1, 2),
            provision: getRandomNumber(0, notional * 0.05, 2)
        },
        liquidity: {
            bidAskSpread: getRandomNumber(0.01, 2, 4),
            avgDailyVolume: getRandomNumber(1000000, 100000000, 0),
            liquidityScore: getRandomNumber(1, 10, 2),
            marketDepth: getRandomNumber(1000000, 50000000, 0),
            daysToLiquidate: getRandomNumber(1, 30, 0)
        },
        settlement: {
            settlementDate: getRandomDate(new Date(), new Date(2024, 11, 31)).toISOString().split('T')[0],
            settlementType: getRandomElement(['DVP', 'FOP', 'DvD']),
            clearingHouse: getRandomElement(['DTCC', 'Euroclear', 'Clearstream', 'LCH']),
            custodian: getRandomElement(['BNY Mellon', 'State Street', 'JPM', 'Citi']),
            settlementStatus: getRandomElement(['Settled', 'Pending', 'Failed'])
        },
        optionality: {
            callable: Math.random() > 0.7,
            putable: Math.random() > 0.8,
            convertible: Math.random() > 0.9,
            nextCallDate: getRandomDate(new Date(2025, 0, 1), new Date(2030, 0, 1)).toISOString().split('T')[0],
            callPrice: getRandomNumber(100, 105, 2),
            putPrice: getRandomNumber(95, 100, 2),
            conversionRatio: getRandomNumber(10, 50, 2)
        },
        historicalData: {
            purchaseDate: getRandomDate(new Date(2020, 0, 1), new Date()).toISOString().split('T')[0],
            purchasePrice: price * getRandomNumber(0.9, 1.1, 4),
            purchaseYield: getRandomNumber(0, 8, 3),
            highPrice52Week: price * getRandomNumber(1.05, 1.2, 4),
            lowPrice52Week: price * getRandomNumber(0.8, 0.95, 4),
            avgPrice52Week: price
        },
        marketData: {
            lastTradeTime: new Date().toISOString(),
            lastTradePrice: price,
            bidPrice: price - getRandomNumber(0.1, 0.5, 4),
            askPrice: price + getRandomNumber(0.1, 0.5, 4),
            midPrice: price,
            volume: getRandomNumber(1000000, 100000000, 0)
        },
        benchmarks: {
            benchmarkIndex: getRandomElement(['UST10Y', 'LIBOR3M', 'SOFR', 'CDX.IG', 'CDX.HY']),
            benchmarkSpread: getRandomNumber(-50, 500, 0),
            excessReturn: getRandomNumber(-5, 5, 2),
            trackingDifference: getRandomNumber(-2, 2, 2)
        },
        stress: {
            stressScenario1: getRandomNumber(-notional * 0.2, -notional * 0.01, 2),
            stressScenario2: getRandomNumber(-notional * 0.15, -notional * 0.01, 2),
            stressScenario3: getRandomNumber(-notional * 0.1, -notional * 0.01, 2),
            worstCaseScenario: getRandomNumber(-notional * 0.3, -notional * 0.05, 2)
        },
        allocation: {
            strategyAllocation: getRandomNumber(0, 100, 2),
            sectorAllocation: getRandomNumber(0, 100, 2),
            regionAllocation: getRandomNumber(0, 100, 2),
            ratingAllocation: getRandomNumber(0, 100, 2)
        },
        performance: {
            dailyReturn: getRandomNumber(-5, 5, 4),
            mtdReturn: getRandomNumber(-10, 10, 4),
            qtdReturn: getRandomNumber(-15, 15, 4),
            ytdReturn: getRandomNumber(-20, 20, 4),
            inceptionReturn: getRandomNumber(-30, 50, 4)
        },
        fees: {
            managementFee: getRandomNumber(0, 2, 4),
            performanceFee: getRandomNumber(0, 20, 2),
            custodyFee: getRandomNumber(0, 0.1, 4),
            transactionCost: getRandomNumber(0, 100, 2),
            totalExpenseRatio: getRandomNumber(0, 2, 4)
        },
        counterparty: {
            counterpartyName: `Counterparty ${Math.floor(index / 20)}`,
            counterpartyRating: getRandomElement(ratings),
            exposureLimit: getRandomNumber(1000000, 100000000, 0),
            currentExposure: getRandomNumber(0, 50000000, 0),
            collateralPosted: getRandomNumber(0, 10000000, 0)
        },
        documentation: {
            prospectus: `PROSP-${index}`,
            termSheet: `TS-${index}`,
            legalAgreement: `LEGAL-${index}`,
            lastReviewDate: getRandomDate(new Date(2023, 0, 1), new Date()).toISOString().split('T')[0]
        },
        tax: {
            taxLotId: `TL-${uuidv4()}`,
            taxBasis: marketValue * getRandomNumber(0.9, 1.1, 2),
            unrealizedTaxGain: getRandomNumber(-50000, 50000, 2),
            taxRate: getRandomNumber(15, 35, 2),
            withholdingTax: getRandomNumber(0, 30, 2)
        },
        hedging: {
            hedgeRatio: getRandomNumber(0, 100, 2),
            hedgeInstrument: getRandomElement(['IRS', 'CDS', 'TRS', 'Future', 'Option']),
            hedgeNotional: notional * getRandomNumber(0, 1, 2),
            hedgeEffectiveness: getRandomNumber(80, 100, 2)
        },
        reporting: {
            reportingCurrency: getRandomElement(currencies),
            reportingValue: marketValue * getRandomNumber(0.8, 1.2, 2),
            fxRate: getRandomNumber(0.5, 2, 4),
            reportingDate: new Date().toISOString().split('T')[0]
        },
        tradingLimits: {
            positionLimit: getRandomNumber(10000000, 100000000, 0),
            varLimit: getRandomNumber(100000, 10000000, 0),
            concentrationLimit: getRandomNumber(5, 25, 2),
            stopLoss: getRandomNumber(100000, 5000000, 0)
        },
        metadata: {
            createdDate: new Date().toISOString(),
            modifiedDate: new Date().toISOString(),
            createdBy: getRandomElement(traders),
            modifiedBy: getRandomElement(traders),
            version: 1
        },
        additionalAttributes: {}
    };
    
    // Add 100 additional attributes
    for (let i = 1; i <= 100; i++) {
        if (i % 3 === 0) {
            position.additionalAttributes[`attribute${i}`] = getRandomNumber(0, 1000, 2);
        } else if (i % 3 === 1) {
            position.additionalAttributes[`attribute${i}`] = `Value${i}_${index}`;
        } else {
            position.additionalAttributes[`attribute${i}`] = Math.random() > 0.5;
        }
    }
    
    return position;
}

function generateTrade(index, cusipList) {
    const cusip = cusipList[Math.floor(Math.random() * cusipList.length)];
    const side = getRandomElement(['BUY', 'SELL']);
    const quantity = getRandomNumber(100, 10000, 0);
    const price = getRandomNumber(85, 115, 4);
    const notional = quantity * 1000 * price / 100;
    
    return {
        tradeId: `TRD-${uuidv4()}`,
        cusip: cusip,
        isin: generateISIN(),
        sedol: Math.random().toString(36).substring(2, 9).toUpperCase(),
        ticker: `TICK${Math.floor(Math.random() * 1000)}`,
        instrumentName: `${getRandomElement(sectors)} ${getRandomNumber(2025, 2050, 0)} ${getRandomNumber(1, 10, 3)}%`,
        instrumentType: getRandomElement(instrumentTypes),
        tradeDate: new Date().toISOString(),
        settlementDate: getRandomDate(new Date(), new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        valueDate: getRandomDate(new Date(), new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        side: side,
        quantity: quantity,
        notionalAmount: notional,
        price: price,
        yield: getRandomNumber(0, 8, 3),
        spread: getRandomNumber(-50, 500, 0),
        accruedInterest: getRandomNumber(0, notional * 0.02, 2),
        totalConsideration: notional + getRandomNumber(0, notional * 0.02, 2),
        principalAmount: notional,
        currency: getRandomElement(currencies),
        fxRate: getRandomNumber(0.8, 1.2, 4),
        baseCurrencyAmount: notional * getRandomNumber(0.8, 1.2, 2),
        tradeType: getRandomElement(['MARKET', 'LIMIT', 'AGENCY', 'PRINCIPAL']),
        executionType: getRandomElement(['Electronic', 'Voice', 'RFQ']),
        orderType: getRandomElement(['GTC', 'IOC', 'FOK', 'Day']),
        status: getRandomElement(['FILLED', 'PARTIAL', 'NEW']),
        trader: getRandomElement(traders),
        salesperson: getRandomElement(['Alice Brown', 'Bob Green', 'Charlie White']),
        book: getRandomElement(books),
        portfolio: `PORT${Math.floor(index / 300)}`,
        desk: getRandomElement(desks),
        strategy: getRandomElement(['Relative Value', 'Directional', 'Carry', 'Arbitrage']),
        counterparty: {
            name: `Counterparty ${Math.floor(index / 100)}`,
            lei: `LEI${Math.random().toString(36).substring(2, 22).toUpperCase()}`,
            id: `CP-${Math.floor(index / 100)}`,
            type: getRandomElement(['Bank', 'Asset Manager', 'Hedge Fund', 'Insurance', 'Pension']),
            rating: getRandomElement(ratings),
            country: getRandomElement(['USA', 'UK', 'Germany', 'France', 'Japan']),
            sector: getRandomElement(sectors)
        },
        broker: {
            name: getRandomElement(['Broker A', 'Broker B', 'Broker C', 'Broker D']),
            id: `BRK-${Math.floor(Math.random() * 10)}`,
            commission: getRandomNumber(0, 100, 2),
            commissionType: getRandomElement(['Fixed', 'Percentage', 'PerMillion'])
        },
        venue: {
            name: getRandomElement(['MarketAxess', 'Tradeweb', 'Bloomberg', 'Direct']),
            type: getRandomElement(['MTF', 'OTF', 'RFQ', 'Voice']),
            mic: getRandomElement(['XNAS', 'XNYS', 'XLON', 'XETR']),
            country: getRandomElement(['US', 'UK', 'DE', 'FR'])
        },
        clearing: {
            clearingHouse: getRandomElement(['DTCC', 'LCH', 'CME', 'ICE']),
            clearingBroker: `CLR-${Math.floor(Math.random() * 20)}`,
            clearingAccount: `CLRACC-${index}`,
            clearingStatus: getRandomElement(['Cleared', 'Pending', 'Rejected']),
            clearingFee: getRandomNumber(0, 50, 2)
        },
        settlement: {
            custodian: getRandomElement(['BNY Mellon', 'State Street', 'JPM', 'Citi']),
            settlementAccount: `SETTACC-${index}`,
            settlementInstructions: `Standard settlement for ${cusip}`,
            dvp: true,
            failureReason: Math.random() > 0.95 ? 'Insufficient securities' : null
        },
        fees: {
            brokerCommission: getRandomNumber(0, 100, 2),
            exchangeFee: getRandomNumber(0, 50, 2),
            clearingFee: getRandomNumber(0, 30, 2),
            settlementFee: getRandomNumber(0, 20, 2),
            regulatoryFee: getRandomNumber(0, 10, 2),
            otherFees: getRandomNumber(0, 20, 2),
            totalFees: getRandomNumber(0, 250, 2)
        },
        compliance: {
            bestExecution: true,
            regulatoryReporting: true,
            mifidClass: getRandomElement(['BOND', 'DERV', 'EMAL']),
            doddFrank: Math.random() > 0.3,
            volcker: Math.random() > 0.7,
            preTradeChecks: 'Passed',
            postTradeChecks: 'Passed'
        },
        allocation: {
            allocationMethod: getRandomElement(['ProRata', 'Average', 'Random']),
            allocationStatus: 'Complete',
            allocations: [
                {
                    account: `ACC-${Math.floor(index / 10)}`,
                    quantity: quantity * 0.6,
                    percentage: 60
                },
                {
                    account: `ACC-${Math.floor(index / 10) + 1}`,
                    quantity: quantity * 0.4,
                    percentage: 40
                }
            ]
        },
        pricing: {
            priceSource: getRandomElement(['Bloomberg', 'Reuters', 'ICE', 'Internal']),
            quotedPrice: price - getRandomNumber(0, 0.5, 4),
            executedPrice: price,
            markupMarkdown: getRandomNumber(-0.5, 0.5, 4),
            benchmarkPrice: price - getRandomNumber(-0.2, 0.2, 4),
            slippage: getRandomNumber(-0.1, 0.1, 4)
        },
        execution: {
            executionTime: new Date().toISOString(),
            executionVenue: getRandomElement(['MarketAxess', 'Tradeweb', 'Bloomberg']),
            executionMethod: getRandomElement(['Auction', 'RFQ', 'Streaming']),
            orderTime: new Date(Date.now() - getRandomNumber(60000, 600000)).toISOString(),
            confirmationTime: new Date().toISOString(),
            latency: getRandomNumber(10, 1000, 0)
        },
        reference: {
            clientOrderId: `CLI-${uuidv4()}`,
            brokerOrderId: `BRO-${uuidv4()}`,
            exchangeOrderId: `EXC-${uuidv4()}`,
            blockTradeId: Math.random() > 0.7 ? `BLK-${Math.floor(index / 50)}` : null,
            allocationId: `ALC-${index}`,
            parentOrderId: Math.random() > 0.8 ? `PAR-${Math.floor(index / 10)}` : null
        },
        marketData: {
            bidPriceAtExecution: price - getRandomNumber(0.1, 0.5, 4),
            askPriceAtExecution: price + getRandomNumber(0.1, 0.5, 4),
            midPriceAtExecution: price,
            vwap: price + getRandomNumber(-0.2, 0.2, 4),
            marketVolume: getRandomNumber(10000000, 1000000000, 0)
        },
        analytics: {
            tca: {
                implementationShortfall: getRandomNumber(-50, 50, 2),
                arrivalPrice: price - getRandomNumber(-0.1, 0.1, 4),
                participationRate: getRandomNumber(0, 20, 2),
                marketImpact: getRandomNumber(-20, 20, 2),
                timingCost: getRandomNumber(-10, 10, 2)
            },
            pnl: {
                realizedPnl: side === 'SELL' ? getRandomNumber(-10000, 50000, 0) : 0,
                unrealizedPnl: side === 'BUY' ? getRandomNumber(-10000, 50000, 0) : 0,
                tradePnl: getRandomNumber(-5000, 5000, 0),
                dayOnePnl: getRandomNumber(-2000, 2000, 0)
            }
        },
        riskMetrics: {
            dv01: getRandomNumber(10, 10000, 2),
            duration: getRandomNumber(0.1, 20, 2),
            convexity: getRandomNumber(0, 500, 2),
            var: getRandomNumber(1000, 100000, 2),
            creditExposure: getRandomNumber(0, notional * 0.1, 2)
        },
        lifecycle: {
            createdDate: new Date().toISOString(),
            modifiedDate: new Date().toISOString(),
            cancelledDate: null,
            amendmentHistory: []
        },
        documentation: {
            confirmationId: `CONF-${uuidv4()}`,
            masterAgreement: `ISDA-${Math.floor(index / 1000)}`,
            supplementalAgreement: Math.random() > 0.7 ? `SUPP-${Math.floor(index / 500)}` : null,
            tradeTicket: `TICK-${index}`
        },
        collateral: {
            collateralType: getRandomElement(['Cash', 'Securities', 'Letter of Credit']),
            collateralAmount: getRandomNumber(0, notional * 0.2, 2),
            marginRequirement: getRandomNumber(0, notional * 0.1, 2),
            haircut: getRandomNumber(0, 10, 2)
        },
        reporting: {
            tradeReportingStatus: 'Reported',
            regulatoryReportingId: `REG-${uuidv4()}`,
            reportingTimestamp: new Date().toISOString(),
            reportingJurisdictions: ['US', 'EU']
        },
        metadata: {
            source: getRandomElement(['FIX', 'API', 'Manual', 'Import']),
            version: 1,
            lastUpdatedBy: getRandomElement(traders),
            comments: ''
        }
    };
}

// Generate data
console.log('Generating position and trade data...');

// Generate CUSIPs that will be shared between positions and trades
const cusipList = [];
for (let i = 0; i < 5000; i++) {
    cusipList.push(generateCUSIP());
}

// Generate positions
const positions = [];
for (let i = 0; i < 1000; i++) {
    positions.push(generatePosition(i, cusipList));
    if (i % 1000 === 0) {
        console.log(`Generated ${i} positions...`);
    }
}

// Generate trades
const trades = [];
for (let i = 0; i < 1000; i++) {
    trades.push(generateTrade(i, cusipList));
    if (i % 5000 === 0) {
        console.log(`Generated ${i} trades...`);
    }
}

// Save to files
fs.writeFileSync('data/positions.json', JSON.stringify(positions, null, 2));
fs.writeFileSync('data/trades.json', JSON.stringify(trades, null, 2));

console.log('Data generation complete!');
console.log(`Generated ${positions.length} positions and ${trades.length} trades`);
console.log('Files saved to data/positions.json and data/trades.json');