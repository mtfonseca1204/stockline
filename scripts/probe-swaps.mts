// Bounded, read-only route discovery. A quote is not a transfer or liquidation proof.
import {createPublicClient,http,parseAbi,zeroAddress,type Address} from 'viem';
import {base} from 'viem/chains';
import {readFileSync,writeFileSync} from 'node:fs';
const inputs=JSON.parse(readFileSync('contracts/deployments/8453.preflight.json','utf8'));
const client=createPublicClient({chain:base,transport:http(process.env.BASE_RPC_URL??'https://base-rpc.publicnode.com')});
const factory='0x33128a8fC17869897dcE68Ed026d694621f6FDfD';
const quoter='0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a';
const factoryAbi=parseAbi(['function getPool(address,address,uint24) view returns(address)']);
const poolAbi=parseAbi(['function liquidity() view returns(uint128)']);
const quoterAbi=parseAbi(['function quoteExactInputSingle((address tokenIn,address tokenOut,uint256 amountIn,uint24 fee,uint160 sqrtPriceLimitX96)) returns(uint256 amountOut,uint160 sqrtPriceX96After,uint32 initializedTicksCrossed,uint256 gasEstimate)']);
const blockNumber=await client.getBlockNumber();const results=[];
for(const market of inputs.markets){
 const routes=[];
 for(const fee of [100,500,3000,10000]){
  try {
   const pool=await client.readContract({address:factory,abi:factoryAbi,functionName:'getPool',args:[market.token,inputs.usdc,fee],blockNumber});
   if(pool===zeroAddress)continue;
   const liquidity=await client.readContract({address:pool,abi:poolAbi,functionName:'liquidity',blockNumber});
   const amountIn=10n**BigInt(market.decimals);
   const quote=await client.simulateContract({address:quoter,abi:quoterAbi,functionName:'quoteExactInputSingle',args:[{tokenIn:market.token as Address,tokenOut:inputs.usdc as Address,amountIn,fee,sqrtPriceLimitX96:0n}],blockNumber});
   routes.push({pool,fee,liquidity,amountIn,amountOut:quote.result[0],gasEstimate:quote.result[3],transferValidated:false});
  }catch(e){routes.push({fee,error:e instanceof Error?e.message.split('\n')[0]:'RPC failure'});}
  await new Promise(resolve=>setTimeout(resolve,300));
 }
 results.push({ticker:market.ticker,routes,enabled:false});
}
const report={chainId:await client.getChainId(),blockNumber,source:'https://developers.uniswap.org/docs/protocols/v3/deployments/v3-base-deployments',scope:'Uniswap V3 direct USDC pairs, fees 100/500/3000/10000. Other venues and multihop are not covered.',factory,quoter,results};
writeFileSync('contracts/deployments/8453.swap-probe.json',JSON.stringify(report,(_,v)=>typeof v==='bigint'?v.toString():v,2)+'\n');
console.log(JSON.stringify(results,(_,v)=>typeof v==='bigint'?v.toString():v,2));
