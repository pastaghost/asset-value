# AssetValue

```typescript

// Old convention, Example #1
const amount = bnOrZero(asset0AmountBaseUnit)
.multipliedBy(bn(1).minus(bnOrZero(DEFAULT_SLIPPAGE)))
.toFixed(0, BigNumber.ROUND_DOWN)

// Using AssetValue, Example #1
const amount = asset0Amount.mult('1' - 'DEFAULT_SLIPPAGE').toBaseUnit()



// Old convention, Example #2
const underlyingAsset0AmountPrecision = bnOrZero(asset0AmountBaseUnit)
.dividedBy(bn(10).pow(lpAsset.precision ?? '0'))
.toString()

// Using AssetValue, Example #2
const underlyingAsset0Amount = asset0Amount.toPrecision()



// Initialization using AssetId
const av = new AssetValue({
value: '420',
assetId: 'cosmos:osmosis-1/ibc:118',
precision: 6,
format: AssetValueFormat.BASE_UNIT,
})



// Initialization using Asset
const asset: Asset = {
    assetId: 'cosmos:osmosis-1/ibc:gamm/pool/1',
    chainId: 'cosmos:osmosis-1',
    symbol: 'gamm/pool/1',
    name: 'Osmosis OSMO/ATOM LP Token',
    precision: 6,
    color: '#750BBB',
    icon: 'https://rawcdn.githack.com/cosmos/chain-registry/master/osmosis/images/osmo.png',
    explorer: 'https://www.mintscan.io/osmosis',
    explorerAddressLink: 'https://www.mintscan.io/osmosis/account/',
    explorerTxLink: 'https://www.mintscan.io/osmosis/txs/',
}
const av = new AssetValue({ value: '42', asset: asset, format: AssetValueFormat.BASE_UNIT })



// Serialized Redux-compatible representation (SerializedAssetValue)
const k = av.toSerialized() => "{"a":"cosmos:osmosis-1/ibc:118","p":6,"v":"420"}|a35b8ad1"



// Initialization using SerializedAssetValue
const av = newAssetValue(k)
```
