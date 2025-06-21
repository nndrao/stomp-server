const Stomp = require('stompjs');
Object.assign(global, { WebSocket: require('ws') });

const client = Stomp.overWS('ws://localhost:8080');

let positionShown = false;
let tradeShown = false;

client.connect({}, () => {
    console.log('Connected to STOMP server\n');
    
    // Subscribe to positions
    client.subscribe('/snapshot/positions', (message) => {
        if (!message.body.startsWith('Success') && !positionShown) {
            try {
                const data = JSON.parse(message.body);
                if (message.headers['message-type'] === 'update') {
                    console.log('=== POSITION UPDATE FIELDS ===');
                    console.log(`Position ID: ${data.positionId}`);
                    console.log(`CUSIP: ${data.cusip}`);
                    console.log('\nPrice & Value:');
                    console.log(`  Current Price: ${data.currentPrice?.toFixed(4)}`);
                    console.log(`  Market Value: ${data.marketValue?.toFixed(2)}`);
                    console.log('\nPnL Fields:');
                    console.log(`  PnL: ${data.pnl}`);
                    console.log(`  Unrealized PnL: ${data.unrealizedPnl}`);
                    console.log(`  Daily PnL: ${data.dailyPnl}`);
                    console.log(`  MTD PnL: ${data.mtdPnl}`);
                    console.log(`  YTD PnL: ${data.ytdPnl}`);
                    console.log('\nRisk Metrics:');
                    console.log(`  VaR 95: ${data.riskMetrics?.var95}`);
                    console.log(`  VaR 99: ${data.riskMetrics?.var99}`);
                    console.log(`  Expected Shortfall: ${data.riskMetrics?.expectedShortfall}`);
                    console.log(`  Sharpe Ratio: ${data.riskMetrics?.sharpeRatio?.toFixed(4)}`);
                    console.log('\nSensitivities:');
                    console.log(`  DV01: ${data.dv01?.toFixed(2)}`);
                    console.log(`  PV01: ${data.pv01?.toFixed(2)}`);
                    console.log(`  CS01: ${data.cs01?.toFixed(2)}`);
                    console.log(`  Convexity: ${data.convexity?.toFixed(2)}`);
                    console.log('\nSpreads:');
                    console.log(`  Spread: ${data.spread}`);
                    console.log(`  Asset Swap: ${data.assetSwapSpread}`);
                    console.log(`  Z-Spread: ${data.zSpread}`);
                    console.log(`  OAS: ${data.oas}`);
                    console.log('\nMarket Data:');
                    console.log(`  Bid: ${data.marketData?.bidPrice?.toFixed(4)}`);
                    console.log(`  Ask: ${data.marketData?.askPrice?.toFixed(4)}`);
                    console.log(`  Bid-Ask Spread: ${data.liquidity?.bidAskSpread?.toFixed(4)}`);
                    console.log(`  Volume: ${data.marketData?.volume}`);
                    console.log('\nPerformance:');
                    console.log(`  Daily Return: ${data.performance?.dailyReturn?.toFixed(4)}%`);
                    console.log(`  MTD Return: ${data.performance?.mtdReturn?.toFixed(4)}%`);
                    console.log(`  YTD Return: ${data.performance?.ytdReturn?.toFixed(4)}%`);
                    console.log('\nCompliance:');
                    console.log(`  Regulatory Capital: ${data.compliance?.regulatoryCapital}`);
                    console.log(`  RWA: ${data.compliance?.rwa}`);
                    console.log(`  Concentration: ${data.compliance?.concentrationLimit?.toFixed(2)}%`);
                    console.log(`  Breach: ${data.compliance?.breachStatus}`);
                    console.log('================================\n');
                    positionShown = true;
                }
            } catch (e) {}
        }
    });
    
    // Subscribe to trades
    client.subscribe('/snapshot/trades', (message) => {
        if (!message.body.startsWith('Success') && !tradeShown) {
            try {
                const data = JSON.parse(message.body);
                if (message.headers['message-type'] === 'update') {
                    console.log('=== TRADE UPDATE FIELDS ===');
                    console.log(`Trade ID: ${data.tradeId}`);
                    console.log(`CUSIP: ${data.cusip}`);
                    console.log(`Side: ${data.side}`);
                    console.log(`Quantity: ${data.quantity}`);
                    console.log('\nPricing:');
                    console.log(`  Trade Price: ${data.price?.toFixed(4)}`);
                    console.log(`  Current Market: ${data.marketData?.midPriceAtExecution?.toFixed(4)}`);
                    console.log(`  Yield: ${data.yield?.toFixed(4)}`);
                    console.log(`  Spread: ${data.spread}`);
                    console.log('\nPnL:');
                    console.log(`  Realized PnL: ${data.analytics?.pnl?.realizedPnl}`);
                    console.log(`  Unrealized PnL: ${data.analytics?.pnl?.unrealizedPnl}`);
                    console.log(`  Total PnL: ${data.analytics?.pnl?.tradePnl}`);
                    console.log(`  Day One PnL: ${data.analytics?.pnl?.dayOnePnl}`);
                    console.log('\nTCA:');
                    console.log(`  Implementation Shortfall: ${data.analytics?.tca?.implementationShortfall} bps`);
                    console.log(`  Market Impact: ${data.analytics?.tca?.marketImpact}`);
                    console.log(`  Timing Cost: ${data.analytics?.tca?.timingCost}`);
                    console.log(`  Participation Rate: ${data.analytics?.tca?.participationRate?.toFixed(2)}%`);
                    console.log('\nRisk:');
                    console.log(`  VaR: ${data.riskMetrics?.var}`);
                    console.log(`  Credit Exposure: ${data.riskMetrics?.creditExposure}`);
                    console.log(`  DV01: ${data.riskMetrics?.dv01?.toFixed(2)}`);
                    console.log(`  Duration: ${data.riskMetrics?.duration?.toFixed(2)}`);
                    console.log('\nFees:');
                    console.log(`  Market Impact Cost: ${data.fees?.marketImpactCost}`);
                    console.log(`  Total Fees: ${data.fees?.totalFees}`);
                    console.log('\nCollateral:');
                    console.log(`  Margin Requirement: ${data.collateral?.marginRequirement}`);
                    console.log(`  Collateral Amount: ${data.collateral?.collateralAmount}`);
                    console.log('\nCompliance:');
                    console.log(`  Best Execution: ${data.compliance?.bestExecution}`);
                    console.log(`  Post Trade Checks: ${data.compliance?.postTradeChecks}`);
                    console.log('\nStatus:');
                    console.log(`  Trade Status: ${data.status}`);
                    console.log(`  Settlement Status: ${data.settlement?.settlementStatus}`);
                    console.log('================================\n');
                    tradeShown = true;
                    
                    // Disconnect after showing both
                    if (positionShown) {
                        setTimeout(() => {
                            client.disconnect(() => {
                                console.log('Test complete.');
                                process.exit(0);
                            });
                        }, 1000);
                    }
                }
            } catch (e) {}
        }
    });
    
    // Send triggers
    setTimeout(() => {
        console.log('Sending triggers...\n');
        client.send('/snapshot/positions/5000', {}, 'START');
        client.send('/snapshot/trades/5000', {}, 'START');
    }, 1000);
    
}, (error) => {
    console.error('Connection error:', error);
});

client.debug = () => {};